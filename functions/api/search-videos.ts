export const onRequestGet = async ({request, env}) => {
  const q = new URL(request.url).searchParams.get('q') || 'Lagos';
  let vids=[];

  // 1. Real Piped YouTube API (no key)
  try{
    const data = await fetch('https://pipedapi.kavin.rocks/search?q='+encodeURIComponent(q), {headers:{'User-Agent':'Mozilla/5.0'}}).then(r=>r.json());
    if(data?.items){
      for(let it of data.items){
        if(it.type==='stream' && vids.length<20){
          vids.push({
            title: it.title,
            url: 'https://www.youtube.com/watch?v='+it.url.split('v=')[1]?.split('&')[0] || it.url,
            thumb: it.thumbnail || 'https://i.ytimg.com/vi/'+(it.url.split('v=')[1]||'')+'/mqdefault.jpg',
            duration: it.duration||'',
            source:'Real YouTube via Piped'
          });
        }
      }
    }
  }catch(e){}

  // 2. Qwant Videos fallback
  if(vids.length<5){
    try{
      const data = await fetch('https://api.qwant.com/v3/search/videos?t=videos&q='+encodeURIComponent(q)+'&count=20&locale=en_us', {headers:{'User-Agent':'Mozilla/5.0'}}).then(r=>r.json());
      if(data?.data?.result?.items){
        for(let it of data.data.result.items){
          if(vids.length>=20) break;
          if(!vids.find(v=>v.url===it.url)) vids.push({title:it.title, url:it.url, thumb:it.thumbnail, duration:'', source:'Qwant Videos'});
        }
      }
    }catch(e){}
  }

  // 3. Never 0
  if(vids.length===0){
    vids.push({title:q+' - YouTube search', url:'https://www.youtube.com/results?search_query='+encodeURIComponent(q), thumb:'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg', source:'YouTube'});
  }

  return new Response(JSON.stringify(vids.slice(0,20)), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
};
