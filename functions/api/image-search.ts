export const onRequestGet = async ({ request, env }) => {
  const u = new URL(request.url);
  const q = u.searchParams.get('q') || 'Lagos';
  const f = [];

  // 1. WIKIMEDIA COMMONS - 100% FREE NO KEY
  f.push(fetch(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrlimit=15&prop=imageinfo&iiprop=url&format=json&origin=*`).then(r=>r.json()).then(d=>{
    const pages = d.query?.pages||{}; return Object.values(pages).map((p:any)=>({ id:`wiki_${p.pageid}`, url:p.imageinfo?.[0]?.url||'', thumb:p.imageinfo?.[0]?.thumburl||p.imageinfo?.[0]?.url, title:p.title, source:'Wikimedia' }));
  }).catch(()=>[]));

  // 2. PIXABAY IMAGES - FREE KEY
  if (env.PIXABAY_API_KEY) {
    f.push(fetch(`https://pixabay.com/api/?key=${env.PIXABAY_API_KEY}&q=${encodeURIComponent(q)}&image_type=photo&per_page=20`).then(r=>r.json()).then(d=>(d.hits||[]).map((h:any)=>({ id:`pixabay_${h.id}`, url:h.largeImageURL, thumb:h.webformatURL, title:q, source:'Pixabay' }))).catch(()=>[]));
  }

  // 3. UNSPLASH SOURCE - FREE NO KEY (via picsum + Lorem)
  f.push(fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=10&client_id=${env.UNSPLASH_KEY||'demo'}`, { headers:{ 'Accept-Version':'v1' } }).then(r=>r.json()).then(d=>(d.results||[]).map((p:any)=>({ id:`unsplash_${p.id}`, url:p.urls?.regular, thumb:p.urls?.thumb, title:p.alt_description||q, source:'Unsplash' }))).catch(()=>[]));

  // 4. ALWAYS WORKING FALLBACK - Picsum + Placeholder
  f.push(Promise.resolve(Array.from({length:8}).map((_,i)=>({ id:`picsum_${i}`, url:`https://picsum.photos/seed/${encodeURIComponent(q)}${i}/800/600`, thumb:`https://picsum.photos/seed/${encodeURIComponent(q)}${i}/300/200`, title:`${q} ${i+1}`, source:'Picsum' }))));

  const results = await Promise.allSettled(f);
  let images = results.flatMap(r=> r.status==='fulfilled'?r.value:[]).filter(x=>x.url).slice(0,30);
  images = [...new Map(images.map(v=>[v.id,v])).values()];

  return new Response(JSON.stringify({ query:q, count:images.length, sources:['Wikimedia','Pixabay','Unsplash','Picsum'], images }), { headers:{ 'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Cache-Control':'public, max-age=600' } });
}
