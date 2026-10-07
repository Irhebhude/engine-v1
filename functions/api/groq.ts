export const onRequestPost: PagesFunction<{
  GROQ_API_KEY: string;
  GROQ_API_KEY_2: string;
  GROQ_API_KEY_3: string;
}> = async ({ request, env }) => {
  try {
    const { messages } = await request.json() as any;
    const keys = [env.GROQ_API_KEY, (env as any).GROQ_API_KEY_2, (env as any).GROQ_API_KEY_3].filter(Boolean);
    if (!keys.length) return new Response(JSON.stringify({ error: "GROQ_API_KEY not set in Cloudflare" }), { status: 500, headers: { "Content-Type": "application/json" } });
    const finalMessages = messages || [{ role: "user", content: "hello" }];
    let lastErr = "";
    for (const apiKey of keys) {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "llama-3.1-8b-instant", messages: finalMessages, temperature: 0.7, max_tokens: 2048 })
      });
      const data = await res.json();
      if (res.ok) return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
      lastErr = JSON.stringify(data);
      const t = lastErr.toLowerCase();
      if (res.status === 429 || t.includes("quota") || t.includes("rate") || t.includes("limit")) continue;
      return new Response(JSON.stringify(data), { status: res.status, headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ error: lastErr || "All Groq keys failed" }), { status: 429, headers: { "Content-Type": "application/json" } });
  } catch (e: any) { return new Response(JSON.stringify({ error: e.message }), { status: 500 }); }
};
