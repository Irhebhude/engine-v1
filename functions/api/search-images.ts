
export const onRequestGet = async ({request, env}) => {
  const q = new URL(request.url).searchParams.get('q') || '';
  if(!q) return new Response(JSON.stringify([]), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
  try{
    // 1. Check YOUR owned images first
    const owned = await env.DB.prepare("SELECT url, title FROM pages WHERE domain='owned.images' AND (title LIKE ? OR content LIKE ?) ORDER BY crawled_at DESC LIMIT 50").bind('%'+q+'%','%'+q+'%').all();
    if(owned.results && owned.results.length > 0){
      return new Response(JSON.stringify(owned.results.map(r=>({url:r.url, title:r.title, source:'owned:engine-index'}))), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
    }
  }catch(e){}
  // 2. Fallback - crawl Google Images live if not owned yet
  try{
    const html = await fetch('https://www.google.com/search?q='+encodeURIComponent(q)+'&tbm=isch&hl=en', {
      headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    }).then(r=>r.text());
    let results = [];
    const re = /"ou":"(https:[^"]+)"/g;
    let m;
    while((m = re.exec(html)) !== null && results.length < 30){
      try{ let u = JSON.parse('"' + m[1] + '"'); if(u.startsWith('http')) results.push({url:u, title:q}); }catch(e){}
    }
    return new Response(JSON.stringify(results), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
  }catch(e){
    return new Response(JSON.stringify([]), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
  }
};
