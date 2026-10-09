export const onRequestGet = async ({ request, env }: any) => {
  const u = new URL(request.url);
  const q = u.searchParams.get('q') || 'Lagos';
  const type = u.searchParams.get('type') || 'all';
  const PIXABAY_KEY = env.PIXABAY_API_KEY || '52173678-0a3d7481896b2907d890ab06b';
  const cors = { 'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Cache-Control':'public, max-age=300' };
  let videos:any[]=[], images:any[]=[], news:any[]=[];

  if (type==='video' || type==='all') {
    try {
      const r = await fetch(`https://pixabay.com/api/videos/?key=${PIXABAY_KEY}&q=${encodeURIComponent(q)}&per_page=12&safesearch=true`);
      const d:any = await r.json();
      videos = (d.hits||[]).map((v:any)=>({ id:`pixabay_${v.id}`, title:v.tags||q, thumbnail:v.videos?.medium?.thumbnail, video_url:v.videos?.medium?.url, embed_url:v.videos?.medium?.url, pageURL:v.pageURL, source:'Pixabay', type:'video' }));
    } catch {}
    if(videos.length===0){
      try{
        const r=await fetch(`https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(q)}&filter=videos`);
        const d:any=await r.json();
        videos=(d.items||[]).slice(0,8).map((v:any)=>{ const vid=v.url?.split('=')[1]; return { id:`yt_${vid}`, title:v.title, thumbnail:v.thumbnail||`https://i.ytimg.com/vi/${vid}/mqdefault.jpg`, embed_url:`https://www.youtube.com/embed/${vid}`, video_url:`https://www.youtube.com/watch?v=${vid}`, source:'YouTube', type:'video' }});
      }catch{}
    }
  }
  if (type==='image' || type==='all') {
    try {
      const r = await fetch(`https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(q)}&image_type=photo&per_page=20&safesearch=true`);
      const d:any = await r.json();
      images = (d.hits||[]).map((h:any)=>({ id:`pixabay_${h.id}`, url:h.largeImageURL, thumb:h.webformatURL, title:h.tags, source:'Pixabay', pageURL:h.pageURL, type:'image' }));
    } catch {}
    if(images.length===0){ images=Array.from({length:12}).map((_,i)=>({ id:`picsum_${i}`, url:`https://picsum.photos/seed/${encodeURIComponent(q)}${i}/600/400`, thumb:`https://picsum.photos/seed/${encodeURIComponent(q)}${i}/300/200`, title:`${q} ${i+1}`, source:'Picsum', type:'image' })); }
  }
  if (type==='news' || type==='all') {
    try { const r=await fetch(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}&tags=story&hitsPerPage=10`); const d:any=await r.json(); news=(d.hits||[]).map((h:any)=>({ id:`hn_${h.objectID}`, title:h.title, url:h.url, source:'HackerNews', date:h.created_at, type:'news' })); } catch {}
  }
  return new Response(JSON.stringify({ query:q, type, counts:{videos:videos.length,images:images.length,news:news.length}, videos, images, news }), { headers:cors });
}
