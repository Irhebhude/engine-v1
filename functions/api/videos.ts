
export const onRequestGet = async ({request}) => {
  const q = new URL(request.url).searchParams.get('q') || '';
  const results = [];
  try {
    // Try Piped API - free YouTube search
    const piped = await fetch('https://pipedapi.kavin.rocks/search?q='+encodeURIComponent(q)+'&filter=videos', {headers:{'User-Agent':'Mozilla/5.0'}}).then(r=>r.json()).catch(()=>null);
    if(piped?.items){
      for(let v of piped.items.slice(0,12)){
        results.push({
          title: v.title,
          url: 'https://youtube.com/watch?v='+v.url.split('v=')[1]?.split('&')[0] || v.url,
          thumbnail: v.thumbnail,
          duration: v.duration || '',
          channel: v.uploaderName,
          source: 'youtube'
        });
      }
    }
  } catch(e){}

  // Fallback: use Invidious API
  if(results.length === 0){
    try {
      const inv = await fetch('https://inv.nadeko.net/api/v1/search?q='+encodeURIComponent(q)+'&type=video', {headers:{'User-Agent':'Mozilla/5.0'}}).then(r=>r.json()).catch(()=>null);
      if(Array.isArray(inv)){
        for(let v of inv.slice(0,12)){
          results.push({
            title: v.title,
            url: 'https://youtube.com/watch?v='+v.videoId,
            thumbnail: 'https://i.ytimg.com/vi/'+v.videoId+'/hqdefault.jpg',
            duration: v.lengthSeconds ? Math.floor(v.lengthSeconds/60)+':'+String(v.lengthSeconds%60).padStart(2,'0') : '',
            channel: v.author,
            source: 'youtube'
          });
        }
      }
    } catch(e){}
  }

  return new Response(JSON.stringify(results), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
};
