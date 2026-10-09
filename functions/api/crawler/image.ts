export const onRequestGet = async ({request, env}) => {
  const q = new URL(request.url).searchParams.get('q') || 'Lagos';
  try{
    // Use Bing Images - Google blocks Cloudflare, Bing doesn't
    const html = await fetch('https://www.bing.com/images/search?q='+encodeURIComponent(q)+'&form=HDRSC2', {
      headers:{
        'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept':'text/html'
      }
    }).then(r=>r.text());

    let images = [];
    // Bing format: murl":"https://...
    const re = /"murl":"(https:[^"]+)"/g;
    let m;
    while((m = re.exec(html))!== null && images.length < 30){
      let imgUrl = m[1];
      if(!images.find(x=>x.url===imgUrl)){
        images.push({url: imgUrl, title: q});
        await env.DB.prepare(
          'INSERT OR REPLACE INTO pages (url, title, snippet, content, domain, crawled_at, rank) VALUES (?,?,?,?,?,?,?)'
        ).bind(imgUrl, q+' photo', 'Image for '+q, q+' image', 'owned.images', Date.now(), 5).run().catch(()=>{});
      }
    }

    // Second attempt - img src
    if(images.length < 5){
      const re2 = /src="https:\/\/[^"]+\.(?:jpg|jpeg|png|webp)/g;
      let m2;
      while((m2 = re2.exec(html))!== null && images.length < 30){
        let u = m2[0].slice(5);
        if(!images.find(x=>x.url===u)){
          images.push({url: u, title: q});
          await env.DB.prepare('INSERT OR REPLACE INTO pages (url, title, snippet, content, domain, crawled_at, rank) VALUES (?,?,?,?,?,?,?)')
           .bind(u, q+' photo', 'Image for '+q, q+' image', 'owned.images', Date.now(), 5).run().catch(()=>{});
        }
      }
    }

    return new Response(JSON.stringify({message:'Saved to engine-index owned 100% via Bing', query:q, count:images.length, images: images.slice(0,5)}), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
  }catch(e){
    return new Response(JSON.stringify({error:e.message, stack: e.stack}), {status:500, headers:{'Content-Type':'application/json'}});
  }
};
