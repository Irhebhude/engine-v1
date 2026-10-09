
export const onRequestGet = async ({env}) => {
  try{
    const pending = await env.DB.prepare("SELECT url, depth FROM frontier WHERE status='pending' LIMIT 5").all();
    let crawled = [];
    for(let row of pending.results){
      try{
        const r = await fetch(row.url, {headers:{'User-Agent':'SEARCH-POI-Bot/1.0'}});
        const html = await r.text();
        const title = (html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || row.url).slice(0,200);
        const text = html.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0,3000);
        await env.DB.prepare('INSERT OR REPLACE INTO pages (url, title, snippet, content, domain, crawled_at, rank) VALUES (?,?,?,?,?,?,?)').bind(row.url, title, text.slice(0,400), text, new URL(row.url).hostname, Date.now(), 1.0/(row.depth+1)).run();
        await env.DB.prepare("UPDATE frontier SET status='done' WHERE url=?").bind(row.url).run();
        crawled.push({url: row.url, title});
      }catch(e){ 
        await env.DB.prepare("UPDATE frontier SET status='error' WHERE url=?").bind(row.url).run().catch(()=>{});
        crawled.push({url: row.url, error: e.message});
      }
    }
    return new Response(JSON.stringify({crawled, count: crawled.length}), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
  }catch(e){
    return new Response(JSON.stringify({error: e.message}), {status:500, headers:{'Content-Type':'application/json'}});
  }
};
export const onRequestPost = async (ctx) => { return onRequestGet(ctx); }
