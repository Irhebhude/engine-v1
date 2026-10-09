export const onRequestPost = async ({ request, env }: any) => {
 const { query, clicked_url, dwellTime=0, vertical='web' } = await request.json();
 const cors={'Content-Type':'application/json','Access-Control-Allow-Origin':'*'};
 try{
  if(env.DB){
   await env.DB.prepare(`CREATE TABLE IF NOT EXISTS training (id INTEGER PRIMARY KEY AUTOINCREMENT, query TEXT, url TEXT, vertical TEXT, clicks INTEGER, dwell INTEGER, ics_boost INTEGER, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)`).run();
   const ex=await env.DB.prepare(`SELECT * FROM training WHERE query=? AND url=?`).bind(query,clicked_url).first();
   if(ex){ await env.DB.prepare(`UPDATE training SET clicks=?, dwell=?, ics_boost=?, timestamp=CURRENT_TIMESTAMP WHERE query=? AND url=?`).bind((ex.clicks||0)+1, Math.max(ex.dwell||0,dwellTime), dwellTime>120?20:dwellTime>60?15:dwellTime>20?5:dwellTime<5?-10:0, query, clicked_url).run(); }
   else { await env.DB.prepare(`INSERT INTO training (query,url,vertical,clicks,dwell,ics_boost) VALUES (?,?,?,?,?,?)`).bind(query,clicked_url,vertical,1,dwellTime,dwellTime>60?15:5).run(); }
  }
 }catch{}
 return new Response(JSON.stringify({trained:true, ics_boost:dwellTime>60?15:5, owner:'Prosper Ozoya Irhebhude - 100% owned'}),{headers:cors});
}
export const onRequestGet = async ({request,env}:any)=>{
 const cors={'Content-Type':'application/json','Access-Control-Allow-Origin':'*'};
 if(!env.DB) return new Response(JSON.stringify({note:'Add D1 DB binding in Cloudflare dashboard > Settings > Functions > D1 - Name: DB - Create: poi-training'}),{headers:cors});
 const rows=await env.DB.prepare(`SELECT * FROM training ORDER BY clicks DESC LIMIT 100`).all();
 return new Response(JSON.stringify({training:rows.results,count:rows.results.length,ip:'100% owned'}),{headers:cors});
}
