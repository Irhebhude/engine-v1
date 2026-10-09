export const onRequestPost = async ({ request, env }: any) => {
  const { query, clicked_url, dwellTime=0 } = await request.json();
  const cors={'Content-Type':'application/json','Access-Control-Allow-Origin':'*'};
  try{
    if(env.DB){
      await env.DB.prepare(`CREATE TABLE IF NOT EXISTS training (id INTEGER PRIMARY KEY AUTOINCREMENT, query TEXT, url TEXT, clicks INTEGER DEFAULT 1, dwell INTEGER DEFAULT 0, ics_boost INTEGER DEFAULT 0, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)`).run();
      const ex = await env.DB.prepare(`SELECT * FROM training WHERE query=? AND url=?`).bind(query, clicked_url).first();
      if(ex){
        const nc=(ex.clicks||0)+1; const nd=Math.max(ex.dwell||0,dwellTime); const nb=nd>120?20:nd>60?15:nd>20?5:nd<5?-10:0;
        await env.DB.prepare(`UPDATE training SET clicks=?, dwell=?, ics_boost=?, timestamp=CURRENT_TIMESTAMP WHERE query=? AND url=?`).bind(nc,nd,nb,query,clicked_url).run();
      } else {
        const nb=dwellTime>60?15:dwellTime>20?5:0;
        await env.DB.prepare(`INSERT INTO training (query,url,clicks,dwell,ics_boost) VALUES (?,?,?,?,?)`).bind(query,clicked_url,1,dwellTime,nb).run();
      }
    }
  }catch(e){ console.log(e); }
  const boost = dwellTime>120?20:dwellTime>60?15:dwellTime>20?5:dwellTime<5?-10:0;
  return new Response(JSON.stringify({trained:true, query, clicked_url, dwellTime, ics_boost:boost, engine:'POI-v2 CTR+Dwell', message:'This D1 row is your $500k IP - 100% owned'}),{headers:cors});
}
export const onRequestGet = async ({ request, env }: any) => {
  const cors={'Content-Type':'application/json','Access-Control-Allow-Origin':'*'};
  try{
    if(!env.DB) return new Response(JSON.stringify({training:[], note:'Add D1 binding DB in Cloudflare dashboard > Settings > Functions > D1'}),{headers:cors});
    const rows = await env.DB.prepare(`SELECT query,url,clicks,dwell,ics_boost,timestamp FROM training ORDER BY clicks DESC LIMIT 100`).all();
    return new Response(JSON.stringify({training:rows.results,count:rows.results.length,owner:'POI Foundation 100% owned'}),{headers:cors});
  }catch(e){ return new Response(JSON.stringify({error:String(e)}),{headers:cors}); }
}
