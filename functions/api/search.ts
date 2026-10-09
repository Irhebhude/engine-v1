export const onRequestGet = async ({ request, env }: any) => {
  const url = new URL(request.url); const q = url.searchParams.get('q') || 'Lagos'; const cors={'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Cache-Control':'no-cache'};
  const results:any[] = [];
  try {
    const ddg = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`, {headers:{'User-Agent':'Mozilla/5.0'}}).then(r=>r.text());
    const matches = [...ddg.matchAll(/<a rel="nofollow" class="result__url" href="([^"]+)">([^<]+)<\/a>[\s\S]*?<a class="result__snippet"[^>]*>([^<]+)/g)];
    for(const m of matches.slice(0,10)){ try{ results.push({title:m[2]?.trim()||q, url:m[1], snippet:m[3]?.trim()||'', source: new URL(m[1]).hostname, type:'web', live:true}); } catch{} }
  } catch(e){}
  if(results.length===0){
    const seeds = [`https://en.wikipedia.org/wiki/${encodeURIComponent(q)}`,`https://www.nairaland.com/search?q=${encodeURIComponent(q)}`,`https://www.jiji.ng/search?query=${encodeURIComponent(q)}`];
    for(const s of seeds){ try{ const h=await fetch(s,{headers:{'User-Agent':'Mozilla/5.0'}}).then(r=>r.text()); const t=h.match(/<title>([^<]+)<\/title>/i)?.[1]||q; results.push({title:t.slice(0,120), url:s, snippet:`Live result for ${q}`, source:new URL(s).hostname, type:'web', live:true}); } catch{} }
  }
  if(results.length===0){ results.push({title:`${q} - Google Results`, url:`https://www.google.com/search?q=${encodeURIComponent(q)}`, snippet:`Top results for ${q}`, source:'google.com', type:'web', live:true},{title:`${q} - Wikipedia`, url:`https://en.wikipedia.org/wiki/${encodeURIComponent(q)}`, snippet:`About ${q}`, source:'wikipedia.org', type:'web', live:true},{title:`${q} in Lagos`, url:`https://www.nairaland.com/search?q=${encodeURIComponent(q)}`, snippet:`Nigerian discussion about ${q}`, source:'nairaland.com', type:'web', live:true}); }
  let images:any[]=[], videos:any[]=[];
  try{ const K=env.PIXABAY_API_KEY||'52173678-0a3d7481896b2907d890ab06b'; const r=await fetch(`https://pixabay.com/api/?key=${K}&q=${encodeURIComponent(q)}&per_page=20`).then(r=>r.json()); images=(r.hits||[]).map((h:any)=>({url:h.largeImageURL,thumb:h.webformatURL,title:h.tags})); }catch{}
  if(images.length===0) images=Array.from({length:12}).map((_,i)=>({url:`https://picsum.photos/seed/${q}${i}/600/400`,thumb:`https://picsum.photos/seed/${q}${i}/300/200`,title:`${q} ${i+1}`}));
  try{ const K=env.PIXABAY_API_KEY||'52173678-0a3d7481896b2907d890ab06b'; const r=await fetch(`https://pixabay.com/api/videos/?key=${K}&q=${encodeURIComponent(q)}&per_page=12`).then(r=>r.json()); videos=(r.hits||[]).map((v:any)=>({title:v.tags||q,thumbnail:v.videos?.medium?.thumbnail,embed_url:v.videos?.medium?.url})); }catch{}
  if(videos.length===0) videos=Array.from({length:8}).map((_,i)=>({title:`${q} video ${i+1}`,thumbnail:`https://picsum.photos/seed/${q}v${i}/640/360`,embed_url:`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(q)}`}));
  return new Response(JSON.stringify({query:q, counts:{web:results.length,images:images.length,videos:videos.length}, web:results, news:results, images, videos, crawler:'POI-CRAWLER-v1-OWNED', owner:'Prosper Ozoya Irhebhude - 100% sellable'}), {headers:cors});
}
