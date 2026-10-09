export const onRequestPost = async ({ request }: any) => {
  const { url, depth=1 } = await request.json(); const cors={'Content-Type':'application/json','Access-Control-Allow-Origin':'*'};
  const visited=new Set(); const results:any[]=[];
  async function crawl(u:string,d:number){ if(d<0||visited.has(u)||visited.size>50) return; visited.add(u); try{ const html=await fetch(u,{headers:{'User-Agent':'POI-Crawler/1.0 Owned by POI Foundation'}}).then(r=>r.text()); const title=html.match(/<title>([^<]+)<\/title>/)?.[1]||u; results.push({url:u,title,crawled_at:new Date().toISOString()}); const links=[...html.matchAll(/href="(\/[^"]+|https?:\/\/[^"]+)"/g)].map(m=>m[1]).slice(0,20); if(d>0) for(const l of links.slice(0,5)){ const abs=l.startsWith('/')?new URL(l,u).href:l; if(abs.startsWith('http')) await crawl(abs,d-1); } }catch{} }
  await crawl(url,depth);
  return new Response(JSON.stringify({crawled:results.length,results,owner:'100% yours'}),{headers:cors});
}
export const onRequestOptions = async() => new Response('',{headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type'}});
