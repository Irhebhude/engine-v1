export async function onRequest() {
  const headers = { "Content-Type":"application/json", "Access-Control-Allow-Origin":"*" };
  return new Response(JSON.stringify({ success:true, keys:[], message:"No keys yet - generate one", total:0 }), { headers });
}
