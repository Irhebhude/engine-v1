export const onRequestGet = async ({ request, env }: any) => {
  const u = new URL(request.url);
  const q = u.searchParams.get('q') || u.searchParams.get('query') || 'Nigeria';
  const all: any[] = [];

  try {
    const r = await fetch(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}&tags=story&hitsPerPage=15`);
    const d: any = await r.json();
    (d.hits||[]).forEach((h:any)=> all.push({ id:`hn_${h.objectID}`, title:h.title, url:h.url||`https://news.ycombinator.com/item?id=${h.objectID}`, source:'HackerNews', date:h.created_at, snippet:h.title }));
  } catch {}

  if (env.GNEWS_API_KEY) {
    try {
      const r = await fetch(`https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}&lang=en&max=10&apikey=${env.GNEWS_API_KEY}`);
      const d: any = await r.json();
      (d.articles||[]).forEach((a:any)=> all.push({ id:`gnews_${a.title}`, title:a.title, url:a.url, source:a.source.name, date:a.publishedAt, snippet:a.description, image:a.image }));
    } catch {}
  }

  try {
    const r = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&origin=*&srlimit=8`);
    const d: any = await r.json();
    (d.query?.search||[]).forEach((s:any)=> all.push({ id:`wiki_${s.pageid}`, title:s.title, url:`https://en.wikipedia.org/wiki/${encodeURIComponent(s.title)}`, source:'Wikipedia', snippet:s.snippet.replace(/<[^>]*>/g,'') }));
  } catch {}

  return new Response(JSON.stringify({ query: q, count: all.length, sources: ['HackerNews','GNews','Wikipedia'], news: all.slice(0,30) }), {
    headers: { 'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Cache-Control':'public, max-age=300' }
  });
}
