const fs = require('fs');
const path = require('path');

fs.mkdirSync('functions/api/crawler', {recursive:true});

fs.writeFileSync('functions/api/crawler/crawl.ts', `
export const onRequestGet = async ({env}) => {
  try{
    const pending = await env.DB.prepare("SELECT url, depth FROM frontier WHERE status='pending' LIMIT 5").all();
    let crawled = [];
    for(let row of pending.results){
      try{
        const r = await fetch(row.url, {headers:{'User-Agent':'SEARCH-POI-Bot/1.0'}});
        const html = await r.text();
        const title = (html.match(/<title[^>]*>([^<]+)<\\/title>/i)?.[1] || row.url).slice(0,200);
        const text = html.replace(/<[^>]+>/g,' ').replace(/\\s+/g,' ').slice(0,3000);
        await env.DB.prepare('INSERT OR REPLACE INTO pages (url, title, snippet, content, domain, crawled_at, rank) VALUES (?,?,?,?,?,?,?)').bind(row.url, title, text.slice(0,400), text, new URL(row.url).hostname, Date.now(), 1.0/(row.depth+1)).run();
        await env.DB.prepare("UPDATE frontier SET status='done' WHERE url=?").bind(row.url).run();
        crawled.push({url: row.url, title});
      }catch(e){ 
        await env.DB.prepare("UPDATE frontier SET status='error' WHERE url=?").bind(row.url).run().catch(()=>{});
        crawled.push({url: row.url, error: e.message});
      }
    }
    return new Response(JSON.stringify({crawled, count: crawled.length}), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
  }catch(e){
    return new Response(JSON.stringify({error: e.message}), {status:500, headers:{'Content-Type':'application/json'}});
  }
};
export const onRequestPost = async (ctx) => { return onRequestGet(ctx); }
`);

fs.writeFileSync('functions/api/search.ts', `
export const onRequestGet = async ({request, env}) => {
  const q = new URL(request.url).searchParams.get('q') || '';
  if(!q) return new Response(JSON.stringify([]), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
  
  // 1. Try YOUR OWN engine-index first (100% owned)
  try{
    const owned = await env.DB.prepare("SELECT url, title, snippet FROM pages WHERE title LIKE ? OR snippet LIKE ? OR content LIKE ? ORDER BY rank DESC LIMIT 20").bind('%'+q+'%','%'+q+'%','%'+q+'%').all();
    if(owned.results && owned.results.length > 0){
      return new Response(JSON.stringify(owned.results.map(r=>({title:r.title, url:r.url, snippet:r.snippet, source:'owned:engine-index'}))), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
    }
  }catch(e){}

  // 2. Fallback to Wikipedia (works on Cloudflare)
  try{
    const wikiRes = await fetch('https://en.wikipedia.org/w/api.php?action=opensearch&search='+encodeURIComponent(q)+'&limit=10&format=json&origin=*', {headers:{'User-Agent':'SEARCH-POI'}});
    const wikiData = await wikiRes.json();
    let results = [];
    if(wikiData[1]) for(let i=0;i<wikiData[1].length;i++) results.push({title: wikiData[1][i], url: wikiData[3][i], snippet: wikiData[2][i]||'Wikipedia: '+wikiData[1][i], source:'wikipedia'});
    return new Response(JSON.stringify(results), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
  }catch(e){
    return new Response(JSON.stringify([]), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
  }
};
`);

console.log('Fixed');
