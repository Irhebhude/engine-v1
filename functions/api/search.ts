export const onRequestGet = async ({ request, env }: any) => {
  const u = new URL(request.url); const q = u.searchParams.get('q') || 'Lagos'; const type = u.searchParams.get('type') || 'all';
  const KEY = env.PIXABAY_API_KEY || '52173678-0a3d7481896b2907d890ab06b';
  const cors = { 'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Cache-Control':'public, max-age=300' };
  let videos:any[]=[], images:any[]=[], news:any[]=[];
  try { const r=await fetch(`https://pixabay.com/api/videos/?key=${KEY}&q=${encodeURIComponent(q)}&per_page=12&safesearch=true`); const d:any=await r.json(); videos=(d.hits||[]).map((v:any)=>({id:v.id,title:v.tags||q,thumbnail:v.videos?.medium?.thumbnail,video_url:v.videos?.medium?.url,embed_url:v.videos?.medium?.url,source:'Pixabay'})); } catch {}
  if(videos.length===0){ videos=Array.from({length:8}).map((_,i)=>({id:i,title:`${q} video ${i+1}`,thumbnail:`https://picsum.photos/seed/${q}v${i}/640/360`,embed_url:`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(q)}`,source:'YouTube'})); }
  try { const r=await fetch(`https://pixabay.com/api/?key=${KEY}&q=${encodeURIComponent(q)}&image_type=photo&per_page=20&safesearch=true`); const d:any=await r.json(); images=(d.hits||[]).map((h:any)=>({id:h.id,url:h.largeImageURL,thumb:h.webformatURL,title:h.tags,source:'Pixabay'})); } catch {}
  if(images.length===0){ images=Array.from({length:12}).map((_,i)=>({id:i,url:`https://picsum.photos/seed/${q}${i}/600/400`,thumb:`https://picsum.photos/seed/${q}${i}/300/200`,title:`${q} ${i+1}`,source:'Picsum'})); }
  try { const r=await fetch(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}&tags=story&hitsPerPage=10`); const d:any=await r.json(); news=(d.hits||[]).map((h:any)=>({id:h.objectID,title:h.title,url:h.url,source:'HackerNews'})); } catch {}
  if(news.length===0){ news=[{id:1,title:`${q} - Top results in Lagos`,url:`https://www.google.com/search?q=${encodeURIComponent(q)}`,source:'Google'},{id:2,title:`${q} explained - Wikipedia`,url:`https://en.wikipedia.org/wiki/${encodeURIComponent(q)}`,source:'Wikipedia'}]; }
  return new Response(JSON.stringify({query:q,type,counts:{videos:videos.length,images:images.length,news:news.length},videos,images,news}),{headers:cors});
}
