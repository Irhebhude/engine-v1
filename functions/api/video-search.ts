export const onRequestGet = async ({ request, env }: any) => {
  const u = new URL(request.url);
  const q = u.searchParams.get('q') || u.searchParams.get('query') || 'Lagos';
  const key = env.PIXABAY_API_KEY;
  const all: any[] = [];

  try {
    if (key) {
      const r = await fetch(`https://pixabay.com/api/videos/?key=${key}&q=${encodeURIComponent(q)}&per_page=20&safesearch=true`);
      const d: any = await r.json();
      (d.hits||[]).forEach((v:any)=>{
        all.push({
          id: `pixabay_${v.id}`,
          title: v.tags || q,
          tags: v.tags,
          thumbnail: v.videos?.medium?.thumbnail || v.videos?.tiny?.thumbnail,
          video_url: v.videos?.medium?.url,
          embed_url: v.videos?.medium?.url,
          pageURL: v.pageURL,
          duration: v.duration,
          views: v.views,
          user: v.user,
          source: 'Pixabay',
          type: 'video'
        });
      });
    }
  } catch {}

  // Archive.org fallback (no key)
  try {
    const r = await fetch(`https://archive.org/advancedsearch.php?q=${encodeURIComponent(q)}+mediatype:movies&fl[]=identifier&fl[]=title&rows=8&output=json`);
    const d: any = await r.json();
    (d.response?.docs||[]).forEach((v:any)=>{
      all.push({
        id: `archive_${v.identifier}`,
        title: v.title,
        thumbnail: `https://archive.org/services/img/${v.identifier}`,
        video_url: `https://archive.org/embed/${v.identifier}`,
        embed_url: `https://archive.org/embed/${v.identifier}`,
        pageURL: `https://archive.org/details/${v.identifier}`,
        source: 'Archive.org',
        type: 'video'
      });
    });
  } catch {}

  // Piped YouTube fallback (no key)
  try {
    const r = await fetch(`https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(q)}&filter=videos`);
    const d: any = await r.json();
    (d.items||[]).slice(0,8).forEach((v:any)=>{
      const vid = v.url?.split('v=')[1];
      if(vid) all.push({
        id: `yt_${vid}`,
        title: v.title,
        thumbnail: v.thumbnail || `https://i.ytimg.com/vi/${vid}/mqdefault.jpg`,
        video_url: `https://www.youtube.com/watch?v=${vid}`,
        embed_url: `https://www.youtube.com/embed/${vid}`,
        source: 'YouTube',
        type: 'video'
      });
    });
  } catch {}

  return new Response(JSON.stringify({ query: q, count: all.length, sources: ['Pixabay','Archive.org','YouTube'], videos: all.slice(0,24) }), {
    headers: { 'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Cache-Control':'public, max-age=600' }
  });
}
