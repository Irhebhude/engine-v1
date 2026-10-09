export const onRequestGet = async ({ request, env }) => {
  const q = new URL(request.url).searchParams.get('q') || '';
  if (!q) return new Response('{"error":"missing q"}', {status:400});
  let ans = '';
  try {
    if (env.AI) {
      const r = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          {role:'system', content:'You are SEARCH-POI AI like ChatGPT. Answer naturally, helpfully. NEVER say is a search query. Be concise like Google AI Overviews.'},
          {role:'user', content: q}
        ],
        max_tokens: 600
      });
      ans = r.response || '';
    }
  } catch(e){}
  if (!ans) {
    if (q.toLowerCase().includes('lagos') && q.toLowerCase().includes('business')) {
      ans = "Lagos is Nigeria's commercial capital.\n\nMajor hubs:\n- Balogun Market - wholesale\n- Computer Village Ikeja - electronics\n- Yaba/Lekki - tech startups\n- Marina/VI - banks\n- Alaba - appliances\n\nCategories: POS, supermarkets, restaurants, fashion, logistics.\nAsk 'restaurants in Lekki' for live places.";
    } else {
      ans = "Here's what I know about \"" + q + "\": Check web results below. Ask 'explain " + q + "' for full answer.";
    }
  }
  return new Response(JSON.stringify({query:q, answer:ans}), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
};
