export async function onRequest({ request, env }: any) {
  const cors = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization" };
  if (request.method === "OPTIONS") return new Response(null, { status: 200, headers: cors });
  try {
    const url = new URL(request.url);
    const target = url.searchParams.get("url") || url.searchParams.get("q") || "https://facebook.com";
    let summary = "";
    try {
      if (env.GROQ_API_KEY) {
        const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: "Bearer " + env.GROQ_API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ model: env.GROQ_MODEL || "openai/gpt-oss-120b", messages: [{ role: "system", content: "You are a website summarizer." }, { role: "user", content: "Summarize: " + target }], max_tokens: 600, temperature: 0.2 })
        });
        const d: any = await r.json();
        summary = d.choices?.[0]?.message?.content || "";
      }
    } catch {}
    if (!summary) summary = `${target} - Official site. AI unavailable, fallback. Verify at ${target}. Owner: Prosper Ozoya Irhebhude - POI Engine v1.`;
    return new Response(JSON.stringify({ success: true, url: target, summary, engine: "POI v1" }), { status: 200, headers: cors });
  } catch (e: any) {
    return new Response(JSON.stringify({ success: true, summary: "AI unavailable, fallback", url: "unknown" }), { status: 200, headers: cors });
  }
}
