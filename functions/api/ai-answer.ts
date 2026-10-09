
export const onRequestGet = async ({request, env}) => {
  const q = new URL(request.url).searchParams.get('q') || '';
  const key = (env.GROQ_API_KEY || '').trim();
  const model = (env.GROQ_MODEL || 'openai/gpt-oss-120b').trim();
  
  if(!q) return new Response(JSON.stringify({answer:'No query'}), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
  if(!key) return new Response(JSON.stringify({answer:'❌ GROQ_API_KEY not found. Env: '+Object.keys(env).join(', ')}), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});

  try{
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method:'POST',
      headers:{'Authorization':'Bearer '+key,'Content-Type':'application/json'},
      body: JSON.stringify({
        model: model,
        messages:[
          {role:'system', content:'You are SEARCH-POI AI like Google AI Overviews. Answer directly, helpfully, concisely. Never say is a search query.'},
          {role:'user', content: q}
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });
    const data = await res.json();
    if(!res.ok){
      // Try fallback model if first fails
      if(data.error?.code === 'model_decommissioned' || res.status===400){
        const fallback = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method:'POST',
          headers:{'Authorization':'Bearer '+key,'Content-Type':'application/json'},
          body: JSON.stringify({
            model:'openai/gpt-oss-120b',
            messages:[{role:'user',content:q}],
            max_tokens:800
          })
        });
        const fbData = await fallback.json();
        const ans = fbData.choices?.[0]?.message?.content || JSON.stringify(fbData).slice(0,600);
        return new Response(JSON.stringify({answer: ans, model:'openai/gpt-oss-120b (fallback)', debug: data}), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
      }
      return new Response(JSON.stringify({answer:'GROQ Error '+res.status+': '+JSON.stringify(data)+' Model tried: '+model}), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
    }
    const ans = data.choices?.[0]?.message?.content || 'Empty: '+JSON.stringify(data).slice(0,500);
    return new Response(JSON.stringify({answer: ans, model: model}), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
  }catch(e){
    return new Response(JSON.stringify({answer:'Error: '+e.message}), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
  }
};
