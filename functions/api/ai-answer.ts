// PURE GROQ AI - NO FAKE TEMPLATE
export const onRequestGet = async ({ request, env }) => {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || url.searchParams.get('query') || '';
  if (!q) return new Response(JSON.stringify({error:'missing q'}), {status:400, headers:{'Content-Type':'application/json'}});

  const GROQ_KEY = env.GROQ_API_KEY || env.GROQ_KEY;

  if (!GROQ_KEY) {
    return new Response(JSON.stringify({
      query: q,
      answer: "GROQ_API_KEY not set in Cloudflare. Go to Pages > Settings > Environment Variables > Add GROQ_API_KEY",
      error: "missing key"
    }), {headers:{'Content-Type':'application/json'}});
  }

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + GROQ_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are SEARCH-POI AI, a helpful assistant like ChatGPT. Answer directly, naturally, helpfully. NEVER say "is a search query" or "If you are looking for a person named". NEVER mention Bing, DuckDuckGo, Wikipedia. Be concise and useful like Google AI Overviews. If user asks Startup ideas 2026, give real startup ideas for 2026.' },
          { role: 'user', content: q }
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    });

    const data = await groqRes.json();
    const answer = data.choices?.[0]?.message?.content || 'No answer from GROQ';

    return new Response(JSON.stringify({
      query: q,
      answer: answer,
      source: 'groq-llama-3.3-70b',
      guaranteed: true
    }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });

  } catch (e) {
    return new Response(JSON.stringify({
      query: q,
      answer: 'AI Error: ' + e.message,
      error: e.message
    }), { headers: { 'Content-Type': 'application/json' } });
  }
};
