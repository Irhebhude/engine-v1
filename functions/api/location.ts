export async function onRequest({ request, env }: any) {
  const cors = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization" };
  if (request.method === "OPTIONS") return new Response(null, { status: 200, headers: cors });
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") || url.searchParams.get("query") || "Lagos";
    let places: any[] = [];
    try {
      const osm = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=10&countrycodes=ng`, {
        headers: { "User-Agent": "SearchPOI/1.0", "Accept-Language": "en", "Accept": "application/json" }
      });
      const data: any = await osm.json();
      places = data.map((p: any) => ({ name: p.display_name, lat: p.lat, lon: p.lon, type: p.type, importance: p.importance, source: "OpenStreetMap" }));
    } catch {}
    if (places.length === 0) {
      places = [{ name: "Lagos, Nigeria", lat: "6.5244", lon: "3.3792", type: "city", source: "POI Fallback" }];
    }
    return new Response(JSON.stringify({ success: true, query: q, places, total: places.length }), { status: 200, headers: cors });
  } catch (e: any) {
    return new Response(JSON.stringify({ success: true, query: "Lagos", places: [{ name: "Lagos, Nigeria", lat: "6.5244", lon: "3.3792" }], total: 1 }), { status: 200, headers: cors });
  }
}
