export const onRequestGet=async({request}:any)=>{
  const u=new URL(request.url);
  const q=u.searchParams.get('q')?.trim()||'FX rate USD/NGN';
  const cors={'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Cache-Control':'public, max-age=3600, s-maxage=3600'};
  function clean(s:string){return s?s.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,100):'';}
  let images:any[]=[];
  try{
    const controller=new AbortController(); setTimeout(()=>controller.abort(),3000);
    // Fetch Bing images page - turl is th.bing.net = loads instantly
    const html=await fetch(`https://www.bing.com/images/search?q=${encodeURIComponent(q)}&first=1&qft=+filterui:photo-photo`,{
      headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36','Accept':'text/html'}, signal:controller.signal
    }).then(r=>r.text()).catch(()=>'');

    // Parse both murl (original) and turl (bing thumb)
    const regex1=/\"murl\":\"([^\"]+)\"[\s\S]{0,400}?\"turl\":\"([^\"]+)\"/gi;
    let m;
    while((m=regex1.exec(html))!==null && images.length<24){
      try{
        let murl=m[1].replace(/\\u002f/g,'/').replace(/\\/g,'');
        let turl=m[2].replace(/\\u002f/g,'/').replace(/\\/g,'');
        if(!murl.startsWith('http')) continue;
        if(!turl.startsWith('http')) turl=`https://th.bing.com${turl}`;
        // Weserv proxy guarantees instant load no hotlink block
        const proxy=`https://images.weserv.nl/?url=${encodeURIComponent(murl)}&w=400&h=400&fit=cover&output=webp`;
        const proxyThumb=turl.includes('th.bing.net')?turl:proxy;
        images.push({
          url:murl,
          thumb:proxyThumb,
          proxy:proxy,
          title:q,
          domain:new URL(murl).hostname.replace('www.',''),
          ics:90,
          type:'image',
          real:true
        });
      }catch{}
    }

    // Second parser for just murl if first fails
    if(images.length<10){
      const regex2=/\"murl\":\"([^\"]+)\"/gi;
      while((m=regex2.exec(html))!==null && images.length<24){
        try{
          let murl=m[1].replace(/\\u002f/g,'/').replace(/\\/g,'');
          if(!murl.startsWith('http')) continue;
          if(images.some(i=>i.url===murl)) continue;
          const proxy=`https://images.weserv.nl/?url=${encodeURIComponent(murl)}&w=400&h=400&fit=cover&output=webp`;
          images.push({url:murl, thumb:proxy, proxy:proxy, title:q, domain:new URL(murl).hostname.replace('www.',''), ics:85, type:'image', real:true});
        }catch{}
      }
    }
  }catch(e){}

  // Fallback - guaranteed to show instantly if Bing fails
  if(images.length<6){
    const fallback=[`https://picsum.photos/seed/${encodeURIComponent(q)}1/400/400`,`https://picsum.photos/seed/${encodeURIComponent(q)}2/400/400`,`https://picsum.photos/seed/${encodeURIComponent(q)}3/400/400`];
    images=[...images,...fallback.map((url,i)=>({url, thumb:url, proxy:url, title:q, domain:'picsum.photos', ics:70, type:'image'}))];
  }

  // De-dupe and limit 24
  const seen=new Set(); const uniq=[]; for(const im of images){ if(!seen.has(im.url)){ seen.add(im.url); uniq.push(im);} }

  return new Response(JSON.stringify({query:q, images:uniq.slice(0,24), images_total:uniq.length}),{headers:cors});
}
