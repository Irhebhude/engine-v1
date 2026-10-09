export async function onRequest({ request }: any) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") || url.searchParams.get("query") || "Lagos";
    let places:any[] = [];
    try {
      const osm = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=10&countrycodes=ng`, {
        headers:{ "User-Agent":"SEARCH-POI Engine v1 by Prosper Ozoya Irhebhude - contact@poifoundation.com", "Accept":"application/json" }
      });
      const data:any = await osm.json();
      places = data.map((p:any)=>({ name: p.display_name, lat: p.lat, lon: p.lon, type: p.type, importance: p.importance, source:"OpenStreetMap" }));
    } catch {}
    if (places.length===0 && q.toLowerCase().includes("lagos")) {
      places = [
        { name:"Lagos, Nigeria", lat:"6.5244", lon:"3.3792", type:"city", source:"POI Fallback" },
        { name:"Ikeja, Lagos", lat:"6.6018", lon:"3.3511", type:"suburb", source:"POI Fallback" },
        { name:"Lekki, Lagos", lat:"6.4456", lon:"3.4826", type:"suburb", source:"POI Fallback" },
      ];
    }
    return new Response(JSON.stringify({ success:true, query:q, places, total:places.length }), { headers:{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*" } });
  } catch (e:any) {
    return new Response(JSON.stringify({ success:true, query:"Lagos", places:[{name:"Lagos Nigeria", lat:"6.5244", lon:"3.3792"}], total:1 }), { headers:{ "Content-Type":"application/json", "Access-Control-Allow-Origin":"*" } });
  }
}
