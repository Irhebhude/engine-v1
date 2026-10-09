export const onRequestGet = async ({request, env}) => {
  const q = new URL(request.url).searchParams.get('q') || 'Lagos';

  // 1. Owned images
  try{
    const owned = await env.DB.prepare("SELECT url,title FROM pages WHERE domain='owned.images' AND content LIKE? LIMIT 40").bind('%'+q+'%').all();
    if(owned.results?.length >= 10) return json(owned.results.map(r=>({url:r.url,title:r.title,source:'owned'})));
  }catch(e){}

  let imgs=[];

  // 2. Real Qwant Images API (no key, works on Cloudflare)
  try{
    const data = await fetch('https://api.qwant.com/v3/search/images?t=images&q='+encodeURIComponent(q)+'&count=50&locale=en_us&offset=0', {
      headers:{'User-Agent':'Mozilla/5.0'}
    }).then(r=>r.json());
    if(data?.data?.result?.items){
      for(let it of data.data.result.items){
        if(imgs.length>=40) break;
        imgs.push({url: it.media, thumb: it.thumbnail, title: it.title||q, source:'Qwant'});
        try{
          await env.DB.prepare('INSERT OR IGNORE INTO pages (url,title,snippet,content,domain,crawled_at,rank) VALUES (?,?,?,?,?,?,?)')
           .bind(it.media, it.title||q, q, q, 'owned.images', Date.now(), 5).run();
        }catch{}
      }
    }
  }catch(e){}

  // 3. Bing Images fallback
  if(imgs.length<10){
    try{
      const html = await fetch('https://www.bing.com/images/search?q='+encodeURIComponent(q), {headers:{'User-Agent':'Mozilla/5.0'}}).then(r=>r.text());
      const re=/\"murl\":\"(https:[^\"]+)\"/g; let m;
      while((m=re.exec(html))!==null && imgs.length<40){
        if(!imgs.find(x=>x.url===m[1])) imgs.push({url:m[1],thumb:m[1],title:q});
      }
    }catch(e){}
  }

  // 4. Never return 0 - picsum as last resort
  if(imgs.length===0){
    for(let i=0;i<40;i++) imgs.push({url:'https://picsum.photos/seed/'+encodeURIComponent(q)+i+'/300/200', thumb:'https://picsum.photos/seed/'+encodeURIComponent(q)+i+'/300/200', title:q+' image '+(i+1), source:'fallback'});
  }

  return json(imgs.slice(0,40));
};
function json(d){ return new Response(JSON.stringify(d), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}}); }
