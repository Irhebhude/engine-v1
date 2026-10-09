export const onRequestGet = async () => {
  const u = new URL(request.url);
  const q = u.searchParams.get('q') || 'Nigeria';
  const f = [];

  // 1. HACKERNEWS - FREE NO KEY
  f.push(fetch(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}&tags=story&hitsPerPage=15`).then(r=>r.json()).then(d=>(d.hits||[]).map((h:any)=>({ id:`hn_${h.objectID}`, title:h.title, url:h.url||`https://news.ycombinator.com/item?id=${h.objectID}`, source:'HackerNews', date:h.created_at, snippet:h.title }))).catch(()=>[]));

  // 2. GUARDIAN - FREE KEY 5000/day
  if (env.GUARDIAN_API_KEY) {
    f.push(fetch(`https://content.guardianapis.com/search?q=${encodeURIComponent(q)}&page-size=10&show-fields=thumbnail,trailText&api-key=${env.GUARDIAN_API_KEY}`).then(r=>r.json()).then(d=>(d.response?.results||[]).map((r:any)=>({ id:`guard_${r.id}`, title:r.webTitle, url:r.webUrl, source:'The Guardian', date:r.webPublicationDate, snippet:r.fields?.trailText, image:r.fields?.thumbnail }))).catch(()=>[]));
  }

  // 3. GNEWS - FREE 100/day
  if (env.GNEWS_API_KEY) {
    f.push(fetch(`https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}&lang=en&max=10&apikey=${env.GNEWS_API_KEY}`).then(r=>r.json()).then(d=>(d.articles||[]).map((a:any)=>({ id:`gnews_${a.title}`, title:a.title, url:a.url, source:a.source.name, date:a.publishedAt, snippet:a.description, image:a.image }))).catch(()=>[]));
  }

  // 4. WIKIPEDIA CURRENT EVENTS + DUCKDUCKGO - FREE NO KEY
  f.push(fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&origin=*&srlimit=10`).then(r=>r.json()).then(d=>(d.query?.search||[]).map((s:any)=>({ id:`wiki_${s.pageid}`, title:s.title, url:`https://en.wikipedia.org/wiki/${encodeURIComponent(s.title)}`, source:'Wikipedia', snippet:s.snippet.replace(/<[^>]*>/g,'') }))).catch(()=>[]));

  const results = await Promise.allSettled(f);
  let news = results.flatMap(r=> r.status==='fulfilled'?r.value:[]).filter(Boolean).slice(0,30);

  return new Response(JSON.stringify({ query:q, count:news.length, sources:['HackerNews','Guardian','GNews','Wikipedia'], news }), { headers:{ 'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Cache-Control':'public, max-age=300' } });
}
