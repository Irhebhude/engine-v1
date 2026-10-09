
export const onRequestGet = async ({request, env}) => {
  const q = new URL(request.url).searchParams.get('q') || '';
  if(!q) return new Response(JSON.stringify({error:'missing q'}), {status:400, headers:{'Content-Type':'application/json'}});
  const key = env.GROQ_API_KEY;
  if(!key){
    return new Response(JSON.stringify({answer: 'Add GROQ_API_KEY in Cloudflare Pages > Settings > Variables', query:q}), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
  }
  try{
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method:'POST',
      headers:{'Authorization':'Bearer '+key,'Content-Type':'application/json'},
      body: JSON.stringify({
        model:'llama-3.3-70b-versatile',
        messages:[
          {role:'system', content:'You are SEARCH-POI AI like Google AI Overviews. Answer directly, helpful, concise. NEVER say is a search query. NEVER mention bing.com or DuckDuckGo. If user asks startup ideas 2026, give real ideas.'},
          {role:'user', content: q}
        ],
        max_tokens: 800
      })
    });
    const j = await res.json();
    const ans = j.choices?.[0]?.message?.content || 'No answer from GROQ';
    return new Response(JSON.stringify({query:q, answer:ans, source:'groq'}), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
  }catch(e){
    return new Response(JSON.stringify({answer:'Error: '+e.message}), {headers:{'Content-Type':'application/json'}});
  }
};
