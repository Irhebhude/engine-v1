export const onRequestGet = async ({ request, env }: any) => {
  const u = new URL(request.url);
  const q = u.searchParams.get('q') || 'Lagos';
  const key = env?.PIXABAY_API_KEY || '52173678-0a3d7481896b2907d890ab06b';
  let videos: any[] = [];
  try {
    const r = await fetch(`https://pixabay.com/api/videos/?key=${key}&q=${encodeURIComponent(q)}&per_page=12&safesearch=true`);
    const d: any = await r.json();
    console.log('PIXABAY RESP', d.totalHits);
    videos = (d.hits||[]).map((v:any)=>({
      id: v.id, title: v.tags, thumbnail: v.videos?.medium?.thumbnail,
      video_url: v.videos?.medium?.url, embed_url: v.videos?.medium?.url,
      source: 'Pixabay', pageURL: v.pageURL, duration: v.duration
    }));
  } catch(e:any){ console.log('ERR', e.message) }

  if(videos.length===0){
    videos = Array.from({length:8}).map((_,i)=>({
      id:i, title:`${q} video ${i+1}`, thumbnail:`https://picsum.photos/seed/${q}v${i}/640/360`,
      video_url:`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
      embed_url:`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(q)}`,
      source:'YouTube Search'
    }));
  }
  return new Response(JSON.stringify({query:q, count:videos.length, videos, key_exists:!!env?.PIXABAY_API_KEY }), {
    headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}
  });
}
