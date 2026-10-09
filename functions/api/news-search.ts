export const onRequestGet = async ({ request }) => {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || url.searchParams.get('query') || 'Nigeria';
  try {
    const r = await fetch(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}&tags=story&hitsPerPage=20`);
    const data = await r.json();
    const news = (data.hits || []).map(h => ({
      id: h.objectID, title: h.title, url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
      source: 'HackerNews', points: h.points, author: h.author, created_at: h.created_at, snippet: h._highlightResult?.title?.value || h.title
    }));
    return new Response(JSON.stringify({ news, query: q, count: news.length }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, news: [] }), { status: 500 });
  }
}
