export async function onRequest({ request, env }: any) {
  const cors = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization" };
  if (request.method === "OPTIONS") return new Response(null, { status: 200, headers: cors });
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") || url.searchParams.get("prompt") || "Lagos businesses";
    let answer = "";
    try {
      if (env.GROQ_API_KEY) {
        const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: "Bearer " + env.GROQ_API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ model: env.GROQ_MODEL || "openai/gpt-oss-120b", messages: [{ role: "system", content: "You are POI Build Guide Engine. Generate build guide." }, { role: "user", content: q }], max_tokens: 1000, temperature: 0.2 })
        });
        const d: any = await r.json();
        answer = d.choices?.[0]?.message?.content || "";
      }
    } catch {}
    if (!answer) answer = `Build Guide for ${q}: 1. Research market 2. Source materials 3. Prototype 4. Test 5. Launch. Owner: Prosper Ozoya Irhebhude - POI Engine v1.`;
    return new Response(JSON.stringify({ success: true, query: q, answer, result: answer, content: answer, guides: [] }), { status: 200, headers: cors });
  } catch (e: any) {
    return new Response(JSON.stringify({ success: true, query: "error", answer: "AI unavailable, fallback", result: "AI unavailable, fallback", content: "AI unavailable, fallback", guides: [] }), { status: 200, headers: cors });
  }
}
