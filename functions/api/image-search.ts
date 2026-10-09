export const onRequestGet = async ({ request, env }) => {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || url.searchParams.get('query') || 'Lagos';
  const per_page = url.searchParams.get('limit') || '20';
  try {
    if (env.PEXELS_API_KEY) {
      const r = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=${per_page}`, {
        headers: { Authorization: env.PEXELS_API_KEY }
      });
      const data = await r.json();
      const images = (data.photos || []).map(p => ({
        id: p.id, title: p.alt, url: p.src.large, thumbnail: p.src.medium,
        source: 'pexels', photographer: p.photographer, width: p.width, height: p.height
      }));
      return new Response(JSON.stringify({ images, query: q }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }
    // Fallback free lorem picsum
    const images = Array.from({length: 12}).map((_,i)=>({
      id: i, url: `https://picsum.photos/seed/${encodeURIComponent(q)}${i}/600/400`,
      thumbnail: `https://picsum.photos/seed/${encodeURIComponent(q)}${i}/300/200`,
      title: `${q} ${i+1}`, source: 'picsum'
    }));
    return new Response(JSON.stringify({ images, query: q, fallback: true }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, images: [] }), { status: 500 });
  }
}
