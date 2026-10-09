export async function onRequest({ request, env }: any) {
  const cors = { "Content-Type":"application/json", "Access-Control-Allow-Origin":"*", "Access-Control-Allow-Methods":"GET,POST,OPTIONS", "Access-Control-Allow-Headers":"Content-Type, Authorization" };
  if (request.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    let body:any = {};
    try { body = await request.json(); } catch { const u = new URL(request.url); body.name = u.searchParams.get("name") || "Default"; }
    const apiKey = `poi_sk_live_${crypto.randomUUID().replace(/-/g,"").slice(0,20)}${Date.now().toString(36)}`;
    return new Response(JSON.stringify({ success:true, key: apiKey, apiKey, data:{ name: body.name || "Default", key: apiKey, created_at: new Date().toISOString() } }), { headers: cors });
  } catch (e:any) {
    const fallback = `poi_sk_live_${crypto.randomUUID().replace(/-/g,"").slice(0,24)}`;
    return new Response(JSON.stringify({ success:true, key: fallback, apiKey: fallback }), { headers: cors });
  }
}
