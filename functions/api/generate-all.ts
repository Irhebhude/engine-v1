export const onRequestPost = async ({ request, env }: any) => {
  const cors = { 'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type' };
  if (request.method === 'OPTIONS') return new Response('', { headers: cors });

  const body:any = await request.json().catch(()=>({}));
  const query = body.query || body.q || 'Lagos business';
  const location = body.location || { city: 'Lagos', country: 'Nigeria', lat: 6.5244, lng: 3.3792 };
  const OPENAI_KEY = env.OPENAI_API_KEY;

  // If no OpenAI key, return mock blueprint so frontend still works
  if (!OPENAI_KEY) {
    return new Response(JSON.stringify({
      query, location,
      summarizer: { summary: `${query} is high demand in ${location.city}. Market shows strong growth potential with low competition.`, keyPoints: [`Demand for ${query} in ${location.city}`, `Low competition zone`, `High monetization potential`], sentiment: 'positive' },
      blueprint: { niche: query, targetAudience: `Residents of ${location.city}`, monetization: ['Service fees','Affiliate','Ads','Subscription'], techStack: ['React','Cloudflare Pages','Pixabay API'], marketSize: 'Large' },
      buildGuide: { steps: [`1. Validate ${query} in ${location.city}`, `2. Build landing page`, `3. Add Pixabay images/videos`, `4. Launch with location SEO`], tools: ['engine-v1.pages.dev','Pixabay','Google Maps'], checklist: ['Domain','Logo','Content','Launch'] }
    }), { headers: cors });
  }

  try {
    // 1. SUMMARIZER
    const sumRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method:'POST',
      headers:{'Authorization':`Bearer ${OPENAI_KEY}`,'Content-Type':'application/json'},
      body: JSON.stringify({
        model:'gpt-4o-mini',
        messages:[{role:'system',content:'You are a market analyst. Return JSON {summary:string, keyPoints:string[], sentiment:string}'},{role:'user',content:`Analyze business opportunity: "${query}" in ${location.city}, ${location.country}. Location: ${location.lat},${location.lng}` }],
        response_format:{type:'json_object'}
      })
    }).then(r=>r.json());
    const summarizer = JSON.parse(sumRes.choices?.[0]?.message?.content || '{"summary":"High potential","keyPoints":[],"sentiment":"positive"}');

    // 2. BLUEPRINT (uses summarizer)
    const blueRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method:'POST',
      headers:{'Authorization':`Bearer ${OPENAI_KEY}`,'Content-Type':'application/json'},
      body: JSON.stringify({
        model:'gpt-4o-mini',
        messages:[{role:'system',content:'You are a startup architect. Return JSON {niche:string, targetAudience:string, monetization:string[], techStack:string[], marketSize:string}'},{role:'user',content:`Based on summary: ${JSON.stringify(summarizer)} - Query: ${query} Location: ${location.city}` }],
        response_format:{type:'json_object'}
      })
    }).then(r=>r.json());
    const blueprint = JSON.parse(blueRes.choices?.[0]?.message?.content || '{}');

    // 3. BUILD GUIDE (uses blueprint)
    const guideRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method:'POST',
      headers:{'Authorization':`Bearer ${OPENAI_KEY}`,'Content-Type':'application/json'},
      body: JSON.stringify({
        model:'gpt-4o-mini',
        messages:[{role:'system',content:'You are a build coach. Return JSON {steps:string[], tools:string[], checklist:string[]}'},{role:'user',content:`Create build guide for blueprint: ${JSON.stringify(blueprint)} Query: ${query}` }],
        response_format:{type:'json_object'}
      })
    }).then(r=>r.json());
    const buildGuide = JSON.parse(guideRes.choices?.[0]?.message?.content || '{}');

    return new Response(JSON.stringify({ query, location, summarizer, blueprint, buildGuide }), { headers: cors });
  } catch(e:any) {
    return new Response(JSON.stringify({ error: e.message, query, location }), { headers: cors, status: 500 });
  }
}

export const onRequestOptions = async () => {
  return new Response('', { headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type'} });
}
