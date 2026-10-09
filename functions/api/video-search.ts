export async function onRequest({ request, env }: any) {
  const cors = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization" };
  if (request.method === "OPTIONS") return new Response(null, { status: 200, headers: cors });
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") || url.searchParams.get("query") || "Lagos businesses";
    const enc = encodeURIComponent(q);

    if (!env.YOUTUBE_API_KEY) {
      return new Response(JSON.stringify({ success: true, query: q, videos: [], total: 0, message: "Configure YouTube API key" }), { status: 200, headers: cors });
    }

    let videos: any[] = [];
    try {
      const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${enc}&type=video&maxResults=20&key=${env.YOUTUBE_API_KEY}`);
      const ytData = await ytRes.json();
      if (ytData.items) {
        videos = ytData.items.map((v: any) => ({
          title: v.snippet?.title || q,
          url: `https://www.youtube.com/watch?v=${v.id?.videoId || ""}`,
          thumbnail: v.snippet?.thumbnails?.medium?.url || "",
          source: "youtube.com",
          description: v.snippet?.description || "",
        }));
      }
    } catch {}

    return new Response(JSON.stringify({ success: true, query: q, videos, total: videos.length }), { status: 200, headers: cors });
  } catch (e: any) {
    return new Response(JSON.stringify({ success: true, query: "error", videos: [], total: 0, message: "Configure API key" }), { status: 200, headers: cors });
  }
}
