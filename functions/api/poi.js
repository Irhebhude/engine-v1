export async function onRequest(context) {
  const url = new URL(context.request.url);
  const q = url.searchParams.get("q") || "test";
  const supa = await fetch("https://gnmliljrkkkomnbraqkp.supabase.co/functions/v1/poi-api", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": "poi_6855a17a24484d6fb8641a7fb38868f4" },
    body: JSON.stringify({ query: q, mode: "business", gps: { lat: 4.8156, lng: 7.0498 } })
  });
  const data = await supa.text();
  return new Response(data, { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
}
