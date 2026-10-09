const fs = require('fs');
fs.mkdirSync('functions/api/crawler', {recursive:true});
fs.mkdirSync('functions/api', {recursive:true});

// 1. Google Images HTML crawler -> saves to engine-index
fs.writeFileSync('functions/api/crawler/image.ts', `
export const onRequestGet = async ({request, env}) => {
  const q = new URL(request.url).searchParams.get('q') || 'Lagos';
  try{
    const html = await fetch('https://www.google.com/search?q='+encodeURIComponent(q)+'&tbm=isch&hl=en&ijn=0', {
      headers:{
        'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept':'text/html'
      }
    }).then(r=>r.text());

    let images = [];
    // Google Images stores real URL in "ou":"https://..."
    const re = /"ou":"(https:[^"]+)"/g;
    let m;
    while((m = re.exec(html)) !== null && images.length < 30){
      try{
        let imgUrl = JSON.parse('"' + m[1] + '"'); // unescape unicode
        if(imgUrl.match(/\\.(jpg|jpeg|png|webp)/i) || imgUrl.includes('http')){
          if(!images.find(x=>x.url===imgUrl)){
            images.push({url: imgUrl, title: q});
            // SAVE 100% OWNED
            await env.DB.prepare(
              'INSERT OR REPLACE INTO pages (url, title, snippet, content, domain, crawled_at, rank) VALUES (?,?,?,?,?,?,?)'
            ).bind(imgUrl, q+' photo', 'Image result for '+q, q+' image', 'owned.images', Date.now(), 5).run().catch(()=>{});
          }
        }
      }catch(e){}
    }
    return new Response(JSON.stringify({message:'Saved to engine-index owned 100%', query:q, count:images.length, images}), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
  }catch(e){
    return new Response(JSON.stringify({error:e.message}), {status:500, headers:{'Content-Type':'application/json'}});
  }
};
`);

// 2. Image search that checks YOUR owned index first
fs.writeFileSync('functions/api/search-images.ts', `
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
`);

console.log('Built image owned crawler');
