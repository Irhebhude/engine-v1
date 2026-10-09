export const onRequestGet = async ({request, env}) => {
  const q = (new URL(request.url).searchParams.get('q') || '').trim();
  if(!q) return json([]);

  // 1. Try owned engine-index first (100% owned)
  try{
    const owned = await env.DB.prepare("SELECT url,title,snippet FROM pages WHERE domain!='owned.images' AND (title LIKE? OR snippet LIKE? OR content LIKE?) ORDER BY rank DESC LIMIT 40").bind('%'+q+'%','%'+q+'%','%'+q+'%').all();
    if(owned.results?.length >= 20){
      return json(owned.results.map(r=>({title:r.title,url:r.url,snippet:r.snippet,source:'owned:engine-index'})));
    }
  }catch(e){}

  let results = [];

  // 2. Real DuckDuckGo HTML scrape (works on Cloudflare)
  try{
    const html = await fetch('https://html.duckduckgo.com/html/?q='+encodeURIComponent(q), {
      headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36','Accept':'text/html'}
    }).then(r=>r.text());

    // DuckDuckGo result__a links
    const re = /<a[^>]+class="result__a"[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
    let m;
    while((m=re.exec(html))!==null && results.length < 30){
      let url = m[1];
      // Decode uddg redirect
      if(url.includes('uddg=')){
        try{ url = decodeURIComponent(url.split('uddg=')[1].split('&')[0]); }catch{}
      }
      if(url.startsWith('/')) continue;
      results.push({title: decodeHtml(m[2]), url, snippet: 'Result for '+q+' via DuckDuckGo', source:'Real DuckDuckGo'});
    }
    // Snippets
    const snipRe = /<a class="result__snippet"[^>]*>([^<]+)<\/a>/g;
    let i=0; while((m=snipRe.exec(html))!==null && i<results.length){ results[i].snippet = decodeHtml(m[1]); i++; }
  }catch(e){}

  // 3. Wikipedia opensearch to fill to 40
  try{
    const wiki = await fetch('https://en.wikipedia.org/w/api.php?action=opensearch&search='+encodeURIComponent(q)+'&limit=20&format=json&origin=*', {headers:{'User-Agent':'SEARCH-POI'}}).then(r=>r.json());
    if(wiki[1]) for(let idx=0; idx<wiki[1].length && results.length<40; idx++){
      if(!results.find(r=>r.url===wiki[3][idx])){
        results.push({title:wiki[1][idx], url:wiki[3][idx], snippet:wiki[2][idx]||'Wikipedia article for '+q, source:'Wikipedia'});
      }
    }
  }catch(e){}

  // 4. Ensure 40 - fallback Bing
  if(results.length < 10){
    try{
      const bingHtml = await fetch('https://www.bing.com/search?q='+encodeURIComponent(q), {headers:{'User-Agent':'Mozilla/5.0'}}).then(r=>r.text());
      const re2 = /<li class="b_algo"><h2><a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
      let m; while((m=re2.exec(bingHtml))!==null && results.length<40){
        if(!results.find(r=>r.url===m[1])) results.push({title:decodeHtml(m[2]), url:m[1], snippet:'Bing result for '+q, source:'Bing'});
      }
    }catch(e){}
  }

  // Save to YOUR engine-index to own 100% next time
  try{
    for(let r of results.slice(0,40)){
      await env.DB.prepare('INSERT OR IGNORE INTO pages (url,title,snippet,content,domain,crawled_at,rank) VALUES (?,?,?,?,?,?,?)')
       .bind(r.url,r.title,r.snippet,q,r.source,Date.now(),5).run();
    }
  }catch(e){}

  return json(results.slice(0,40));
};

function json(d){ return new Response(JSON.stringify(d), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}}); }
function decodeHtml(s){ return s.replace(/&quot;/g,'"').replace(/&#x27;/g,"'").replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>'); }
