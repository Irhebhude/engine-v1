export const onRequestGet = async ({ request, env }: any) => {
  const u = new URL(request.url);
  const q = u.searchParams.get('q') || u.searchParams.get('query') || 'Lagos';
  const key = env.PIXABAY_API_KEY;
  const all: any[] = [];

  try {
    if (key) {
      const r = await fetch(`https://pixabay.com/api/?key=${key}&q=${encodeURIComponent(q)}&image_type=photo&per_page=30&safesearch=true&order=popular`);
      const d: any = await r.json();
      (d.hits||[]).forEach((h:any)=>{
        all.push({
          id: `pixabay_${h.id}`,
          url: h.largeImageURL,
          thumb: h.webformatURL,
          preview: h.previewURL,
          pageURL: h.pageURL,
          title: h.tags,
          tags: h.tags,
          user: h.user,
          likes: h.likes,
          views: h.views,
          source: 'Pixabay',
          width: h.imageWidth,
          height: h.imageHeight
        });
      });
    }
  } catch {}

  // Wikimedia fallback no key
  try {
    const r = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrlimit=10&prop=imageinfo&iiprop=url&format=json&origin=*`);
    const d: any = await r.json();
    Object.values(d.query?.pages||{}).forEach((p:any)=>{
      if(p.imageinfo?.[0]?.url) all.push({
        id: `wiki_${p.pageid}`,
        url: p.imageinfo[0].url,
        thumb: p.imageinfo[0].thumburl||p.imageinfo[0].url,
        pageURL: `https://commons.wikimedia.org/wiki/${p.title}`,
        title: p.title,
        source: 'Wikimedia'
      });
    });
  } catch {}

  // Final fallback picsum
  if (all.length < 6) {
    for(let i=0;i<6;i++) all.push({
      id:`picsum_${i}`, url:`https://picsum.photos/seed/${encodeURIComponent(q)}${i}/800/600`,
      thumb:`https://picsum.photos/seed/${encodeURIComponent(q)}${i}/300/200`,
      title:`${q} ${i+1}`, source:'Picsum', pageURL:`https://picsum.photos`
    });
  }

  return new Response(JSON.stringify({ query: q, count: all.length, sources: ['Pixabay','Wikimedia','Picsum'], images: all.slice(0,30) }), {
    headers: { 'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Cache-Control':'public, max-age=600' }
  });
}
