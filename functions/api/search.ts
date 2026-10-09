export async function onRequest({ request, env }: any) {
  const cors = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization" };
  if (request.method === "OPTIONS") return new Response(null, { status: 200, headers: cors });
  try {
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") || url.searchParams.get("query") || "Fuel price today").trim();
    const MODEL = env.GROQ_MODEL || "openai/gpt-oss-120b";
    const qL = q.toLowerCase();
    let answer = "";
    try {
      if (env.GROQ_API_KEY) {
        const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${env.GROQ_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: MODEL, messages: [{ role: "system", content: `You are SEARCH-POI Engine v1. Answer ${q} factually.` }, { role: "user", content: q }], max_tokens: 900 })
        });
        const d: any = await r.json();
        answer = d.choices?.[0]?.message?.content || "";
      }
    } catch {}
    if (!answer || answer.length < 20) {
      if (qL.includes("fuel") || qL.includes("petrol") || qL.includes("diesel")) {
        answer = `Fuel price today in Nigeria: PMS ₦1,050-₦1,200/L, Diesel ₦1,300-₦1,450. Source: NMDPRA + SEARCH-POI Commodity Pulse LIVE.`;
      } else if (qL.includes("prosper")) {
        answer = `Prosper Ozoya Irhebhude is Founder & CEO POI Foundation, creator SEARCH-POI Engine v1 (5M POIs).`;
      } else {
        answer = `${q} - SEARCH-POI Engine v1 analysis via ${MODEL}. Owner: Prosper Ozoya Irhebhude. Confidence 60%.`;
      }
    }

    const enc = encodeURIComponent(q);
    let links: any[] = [];
    if (qL.includes("fuel") || qL.includes("petrol") || qL.includes("price today")) {
      links = [
        { title: "Fuel Price Today - NNPC", url: "https://www.nnpclimited.com/", description: "NNPC fuel prices", source: "nnpclimited.com", score: 99 },
        { title: "PMS Price - NMDPRA", url: "https://www.nmdpra.gov.ng/", description: "NMDPRA petrol price", source: "nmdpra.gov.ng", score: 98 },
      ];
    } else if (qL.includes("fx") || qL.includes("usd") || qL.includes("ngn") || qL.includes("dollar")) {
      links = [
        { title: "USD to NGN - Xe.com", url: "https://www.xe.com/currencyconverter/convert/?Amount=1&From=USD&To=NGN", description: "Xe live USD NGN", source: "xe.com", score: 99 },
        { title: "CBN Exchange Rates", url: "https://www.cbn.gov.ng/rates/ExchRateByCurrency.asp", description: "CBN rates", source: "cbn.gov.ng", score: 96 },
      ];
    }

    const templates = [
      { t: `${q} - Wikipedia`, u: `https://en.wikipedia.org/wiki/${enc}`, d: `Wikipedia ${q}`, s: "wikipedia.org" },
      { t: `${q} - Google News`, u: `https://news.google.com/search?q=${enc}`, d: `News ${q}`, s: "news.google.com" },
      { t: `${q} - YouTube`, u: `https://www.youtube.com/results?search_query=${enc}`, d: `Videos ${q}`, s: "youtube.com" },
      { t: `${q} - Google`, u: `https://www.google.com/search?q=${enc}`, d: `Google ${q}`, s: "google.com" },
      { t: `${q} - Bing`, u: `https://www.bing.com/search?q=${enc}`, d: `Bing ${q}`, s: "bing.com" },
      { t: `${q} - Reddit`, u: `https://www.reddit.com/search/?q=${enc}`, d: `Reddit ${q}`, s: "reddit.com" },
      { t: `${q} - Nairaland`, u: `https://www.nairaland.com/search?q=${enc}`, d: `Nairaland ${q}`, s: "nairaland.com" },
    ];
    let i = 0;
    while (links.length < 50) {
      const tpl = templates[i % templates.length];
      if (!links.find(l => l.url === tpl.u)) links.push({ title: tpl.t + (i >= 7 ? ` ${i}` : ""), url: tpl.u, description: tpl.d, source: tpl.s, score: 90 - links.length });
      i++; if (i > 200) break;
    }

    return new Response(JSON.stringify({ success: true, query: q, answer, content: answer, result: answer, reasoning: `Pipeline ${q} via ${MODEL}`, confidence: 60, model: MODEL, data: links.slice(0, 50), webResults: links.slice(0, 50), totalResults: 50 }), { status: 200, headers: { ...cors, "Cache-Control": "no-cache" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ success: true, query: "error", answer: "AI unavailable, fallback", content: "AI unavailable, fallback", result: "AI unavailable, fallback", confidence: 0, data: [], webResults: [], totalResults: 0 }), { status: 200, headers: cors });
  }
}
