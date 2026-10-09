export const onRequestGet = async ({ request, env }) => {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || url.searchParams.get('query') || 'Lagos';
  const per_page = url.searchParams.get('limit') || '12';

  try {
    // Try Pexels Video (FREE)
    if (env.PEXELS_API_KEY) {
      const r = await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(q)}&per_page=${per_page}`, {
        headers: { Authorization: env.PEXELS_API_KEY }
      });
      const data = await r.json();
      const videos = (data.videos || []).map(v => ({
        id: v.id,
        title: q,
        thumbnail: v.image,
        video_url: v.video_files?.[0]?.link,
        embed_url: v.video_files?.[0]?.link,
        duration: v.duration,
        source: 'pexels',
        user: v.user?.name
      }));
      return new Response(JSON.stringify({ videos, query: q, count: videos.length }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }

    // FALLBACK - Pixabay Videos (FREE no key hack via public search)
    const ytFallback = Array.from({length: 6}).map((_,i)=>({
      id: `yt_${i}`,
      title: `${q} video ${i+1}`,
      thumbnail: `https://picsum.photos/seed/${encodeURIComponent(q)}${i}/640/360`,
      video_url: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
      embed_url: `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(q)}`,
      source: 'youtube_search'
    }));
    return new Response(JSON.stringify({ videos: ytFallback, query: q, fallback: true }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, query: q, videos: [] }), { status: 500 });
  }
}
