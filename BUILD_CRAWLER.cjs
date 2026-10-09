const fs = require('fs');
fs.mkdirSync('functions/api/crawler', {recursive:true});

// 1. D1 SCHEMA - Your 500B index (starts small)
fs.writeFileSync('crawler-schema.sql', `
CREATE TABLE IF NOT EXISTS pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT UNIQUE NOT NULL,
  title TEXT,
  snippet TEXT,
  content TEXT,
  domain TEXT,
  crawled_at INTEGER,
  rank REAL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS frontier (
  url TEXT PRIMARY KEY,
  depth INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  added_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_pages_title ON pages(title);
CREATE INDEX IF NOT EXISTS idx_pages_content ON pages(content);
CREATE INDEX IF NOT EXISTS idx_frontier_status ON frontier(status);
`);

// 2. SEED your crawler with Lagos + Nigeria sites (like Google started with Stanford)
fs.writeFileSync('functions/api/crawler/seed.ts', `
export const SEEDS = [
  'https://en.wikipedia.org/wiki/Lagos',
  'https://en.wikipedia.org/wiki/Lagos_Business_School',
  'https://en.wikipedia.org/wiki/List_of_companies_based_in_Lagos',
  'https://en.wikipedia.org/wiki/Economy_of_Nigeria',
  'https://businessday.ng/',
  'https://nairametrics.com/',
  'https://techcabal.com/',
];
`);

// 3. MAIN CRAWLER - Your Googlebot
fs.writeFileSync('functions/api/crawler/crawl.ts', `
export const onRequestPost = async ({request, env}) => {
  const { url, depth = 0 } = await request.json().catch(()=>({}));
  if(!url) return new Response(JSON.stringify({error:'no url'}), {status:400});
  
  try{
    const res = await fetch(url, {
      headers: {'User-Agent':'SEARCH-POI-Bot/1.0 (+https://searchpoi.com/bot)','Accept':'text/html'},
      cf:{cacheTtl:0}
    });
    if(!res.ok) throw new Error('HTTP '+res.status);
    const html = await res.text();
    
    // Extract title + snippet + links (simple parser - no external lib)
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\\/title>/i);
    const title = titleMatch ? titleMatch[1].slice(0,200) : url;
    const text = html.replace(/<[^>]+>/g,' ').replace(/\\s+/g,' ').slice(0,2000);
    
    // Save to D1
    await env.SEARCH_DB.prepare(
      'INSERT OR REPLACE INTO pages (url, title, snippet, content, domain, crawled_at, rank) VALUES (?,?,?,?,?, ?, ?)'
    ).bind(
      url, title, text.slice(0,300), text, new URL(url).hostname, Date.now(), 1.0/(depth+1)
    ).run();
    
    // Extract links for frontier
    const links = [...html.matchAll(/href=["'](https?:\\/\\/[^"']+)["']/gi)].map(m=>m[1]).slice(0,20);
    for(let link of links){
      if(link.includes('wikipedia.org') || link.includes('.ng') || depth < 2){
        await env.SEARCH_DB.prepare(
          'INSERT OR IGNORE INTO frontier (url, depth, status, added_at) VALUES (?,?,?,?)'
        ).bind(link, depth+1, 'pending', Date.now()).run().catch(()=>{});
      }
    }
    
    await env.SEARCH_DB.prepare("UPDATE frontier SET status='done' WHERE url=?").bind(url).run();
    
    return new Response(JSON.stringify({ok:true, url, title, foundLinks: links.length}), {
      headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}
    });
  }catch(e){
    await env.SEARCH_DB?.prepare("UPDATE frontier SET status='error' WHERE url=?").bind(url).run().catch(()=>{});
    return new Response(JSON.stringify({error:e.message, url}), {status:500, headers:{'Content-Type':'application/json'}});
  }
};

// GET = crawl next 5 from frontier (fleet mode)
export const onRequestGet = async ({env}) => {
  const pending = await env.SEARCH_DB.prepare("SELECT url, depth FROM frontier WHERE status='pending' LIMIT 5").all();
  const results = [];
  for(let row of pending.results){
    // Call self
    await fetch('https://internal/crawl', {method:'POST', body: JSON.stringify(row)}).catch(()=>{});
    // Direct crawl
    try{
      const r = await fetch(row.url, {headers:{'User-Agent':'SEARCH-POI-Bot/1.0'}});
      const html = await r.text();
      const title = (html.match(/<title[^>]*>([^<]+)<\\/title>/i)?.[1] || row.url).slice(0,200);
      const text = html.replace(/<[^>]+>/g,' ').replace(/\\s+/g,' ').slice(0,2000);
      await env.SEARCH_DB.prepare(
        'INSERT OR REPLACE INTO pages (url, title, snippet, content, domain, crawled_at, rank) VALUES (?,?,?,?,?,?,?)'
      ).bind(row.url, title, text.slice(0,300), text, new URL(row.url).hostname, Date.now(), 1.0/(row.depth+1)).run();
      await env.SEARCH_DB.prepare("UPDATE frontier SET status='done' WHERE url=?").bind(row.url).run();
      results.push({url: row.url, title});
    }catch(e){ results.push({url: row.url, error: e.message}); }
  }
  return new Response(JSON.stringify({crawled: results}), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
};
`);

// 4. SEARCH YOUR OWN INDEX (replaces Wikipedia)
fs.writeFileSync('functions/api/search-owned.ts', `
export const onRequestGet = async ({request, env}) => {
  const q = new URL(request.url).searchParams.get('q') || '';
  if(!q) return new Response(JSON.stringify([]), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
  
  try{
    // Search YOUR D1 index first
    const owned = await env.SEARCH_DB.prepare(
      "SELECT url, title, snippet, domain, rank FROM pages WHERE title LIKE ? OR snippet LIKE ? OR content LIKE ? ORDER BY rank DESC, crawled_at DESC LIMIT 20"
    ).bind('%'+q+'%', '%'+q+'%', '%'+q+'%').all();
    
    if(owned.results.length > 0){
      return new Response(JSON.stringify(owned.results.map(r=>({
        title: r.title,
        url: r.url,
        snippet: r.snippet,
        source: 'owned-crawler',
        domain: r.domain
      }))), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
    }
  }catch(e){
    // D1 not setup yet - fallback to Wikipedia
  }
  
  // Fallback to Wikipedia until your crawler fills
  const wiki = await fetch('https://en.wikipedia.org/w/api.php?action=opensearch&search='+encodeURIComponent(q)+'&limit=10&format=json').then(r=>r.json()).catch(()=>null);
  let results = [];
  if(wiki && wiki[1]) for(let i=0;i<wiki[1].length;i++) results.push({title: wiki[1][i], url: wiki[3][i], snippet: wiki[2][i], source:'wikipedia-fallback'});
  return new Response(JSON.stringify(results), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
};
`);

// 5. CRON + QUEUE setup instructions
fs.writeFileSync('crawler-setup.md', \`
# SEARCH-POI Owned Crawler Setup

## Step 1: Create D1 (Your Google Bigtable)
npx wrangler d1 create searchpoi-index

-> Copy database_id

## Step 2: Add to wrangler.toml (create file)
name = "engine-v1"
compatibility_date = "2024-01-01"
pages_build_output_dir = "dist"

[[d1_databases]]
binding = "SEARCH_DB"
database_name = "searchpoi-index"
database_id = "PASTE_ID_HERE"

## Step 3: Init tables
npx wrangler d1 execute searchpoi-index --file=crawler-schema.sql --remote

## Step 4: Seed frontier
npx wrangler d1 execute searchpoi-index --command="INSERT OR IGNORE INTO frontier (url, depth, status, added_at) VALUES 
('https://en.wikipedia.org/wiki/Lagos', 0, 'pending', 123),
('https://en.wikipedia.org/wiki/Lagos_Business_School', 0, 'pending', 123)
" --remote

## Step 5: Add to Cloudflare Pages
Pages -> engine-v1 -> Settings -> Functions -> D1 bindings -> Add SEARCH_DB -> select searchpoi-index

## Step 6: Crawl
curl https://YOUR-SITE.pages.dev/api/crawler/crawl

Then switch frontend to /api/search-owned instead of /api/search

After 1000 crawls, you'll own 100% of results.
\`);

console.log('Built crawler fleet: 4 files created');
