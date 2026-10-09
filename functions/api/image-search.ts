export async function onRequest({ request, env }: any) {
  const cors = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization" };
  if (request.method === "OPTIONS") return new Response(null, { status: 200, headers: cors });
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") || url.searchParams.get("query") || "Lagos";
    const enc = encodeURIComponent(q);

    if (!env.PEXELS_API_KEY) {
      return new Response(JSON.stringify({ success: true, query: q, images: [], total: 0, message: "Configure Pexels API key" }), { status: 200, headers: cors });
    }

    let images: any[] = [];
    try {
      const pexelsRes = await fetch(`https://api.pexels.com/v1/search?query=${enc}&per_page=20`, {
        headers: { Authorization: env.PEXELS_API_KEY }
      });
      const pexelsData = await pexelsRes.json();
      if (pexelsData.photos) {
        images = pexelsData.photos.map((p: any) => ({
          url: p.src?.large || p.src?.medium || "",
          alt: p.alt || q,
          sourceUrl: p.url || "",
          sourceTitle: p.photographer ? `Photo by ${p.photographer}` : q,
          domain: "pexels.com",
          isThumbnail: true,
        }));
      }
    } catch {}

    return new Response(JSON.stringify({ success: true, query: q, images, total: images.length }), { status: 200, headers: cors });
  } catch (e: any) {
    return new Response(JSON.stringify({ success: true, query: "error", images: [], total: 0, message: "Configure API key" }), { status: 200, headers: cors });
  }
}
