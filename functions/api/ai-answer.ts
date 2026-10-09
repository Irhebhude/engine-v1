
export const onRequestGet = async ({request, env}) => {
  const q = new URL(request.url).searchParams.get('q') || '';
  if(!q) return new Response('{"error":"missing q"}', {status:400, headers:{'Content-Type':'application/json'}});
  const key = env.GROQ_API_KEY;
  if(!key) return new Response(JSON.stringify({answer: "Add GROQ_API_KEY in Cloudflare Pages > Settings > Variables"}), {headers:{'Content-Type':'application/json'}});
  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method:'POST',
      headers:{'Authorization':'Bearer '+key,'Content-Type':'application/json'},
      body: JSON.stringify({
        model:'llama-3.3-70b-versatile',
        messages:[
          {role:'system', content:'You are SEARCH-POI AI like Google AI Overviews. Answer helpfully, concise, real info. Never say "is a search query" or mention Bing/DuckDuckGo.'},
          {role:'user', content:q}
        ],
        max_tokens:700
      })
    });
    const j = await r.json();
    const ans = j.choices?.[0]?.message?.content || 'No answer';
    return new Response(JSON.stringify({query:q, answer:ans, source:'groq'}), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
  } catch(e){
    return new Response(JSON.stringify({answer:'AI error: '+e.message}), {headers:{'Content-Type':'application/json'}});
  }
};
