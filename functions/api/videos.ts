
export const onRequestGet = async ({request}) => {
  const q = new URL(request.url).searchParams.get('q') || '';
  if(!q) return new Response(JSON.stringify([]), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
  
  let results = [];
  const instances = [
    'https://inv.nadeko.net/api/v1/search?q=',
    'https://invidious.nerdvpn.de/api/v1/search?q=',
    'https://inv.tux.pizza/api/v1/search?q=',
    'https://yewtu.be/api/v1/search?q='
  ];

  for(let base of instances){
    try{
      const controller = new AbortController();
      const timeout = setTimeout(()=>controller.abort(), 5000);
      const res = await fetch(base + encodeURIComponent(q) + '&type=video', {
        headers:{'User-Agent':'Mozilla/5.0'},
        signal: controller.signal
      });
      clearTimeout(timeout);
      if(!res.ok) continue;
      const data = await res.json();
      if(Array.isArray(data) && data.length>0){
        for(let v of data.slice(0,12)){
          if(!v.videoId) continue;
          results.push({
            title: v.title,
            url: 'https://youtube.com/watch?v=' + v.videoId,
            thumbnail: v.videoThumbnails?.[2]?.url || 'https://i.ytimg.com/vi/' + v.videoId + '/hqdefault.jpg',
            channel: v.author || 'YouTube',
            duration: v.lengthSeconds ? Math.floor(v.lengthSeconds/60)+':'+String(v.lengthSeconds%60).padStart(2,'0') : '',
            views: v.viewCount ? (v.viewCount/1000).toFixed(0)+'K views' : '',
            source: 'youtube-invidious'
          });
        }
        if(results.length>0) break;
      }
    }catch(e){ continue; }
  }

  return new Response(JSON.stringify(results), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
};
