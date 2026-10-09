
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
        if(imgUrl.match(/\.(jpg|jpeg|png|webp)/i) || imgUrl.includes('http')){
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
