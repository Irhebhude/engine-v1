export const onRequestPost: PagesFunction<{ GROQ_API_KEY: string }> = async ({ request, env }) => {
  const { prompt, messages } = await request.json() as any;
  const apiKey = env.GROQ_API_KEY;
  if (!apiKey) return new Response(JSON.stringify({ error: "GROQ_API_KEY not set" }), { status: 500, headers: { "Content-Type": "application/json" } });
  
  const finalMessages = messages || [{ role: "user", content: prompt }];
  
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: finalMessages,
      temperature: 0.7,
    })
  });
  const data = await res.json();
  return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
}
