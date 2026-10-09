
export const onRequestGet = async ({request}) => {
  const q = new URL(request.url).searchParams.get('q') || '';
  let results = [];
  try{
    const piped = await fetch('https://pipedapi.kavin.rocks/search?q='+encodeURIComponent(q)+'&filter=videos').then(r=>r.json()).catch(()=>null);
    if(piped?.items){
      for(let v of piped.items.slice(0,12)){
        const vid = (v.url || '').split('v=')[1] || v.url?.split('/').pop() || '';
        results.push({title: v.title, url: 'https://youtube.com/watch?v='+vid, thumbnail: v.thumbnail || 'https://i.ytimg.com/vi/'+vid+'/hqdefault.jpg', channel: v.uploaderName, duration: v.duration, source:'youtube'});
      }
    }
  }catch(e){}
  return new Response(JSON.stringify(results), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
};
