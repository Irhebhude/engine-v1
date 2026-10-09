interface Env { DB: D1Database }
export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const db = ctx.env.DB;
  // AUTO MIGRATE FIX FOR TERMUX
  await db.prepare(`CREATE TABLE IF NOT EXISTS pages (
    id TEXT PRIMARY KEY,
    url TEXT UNIQUE NOT NULL,
    title TEXT,
    description TEXT,
    content TEXT,
    domain TEXT,
    crawled_at INTEGER,
    rank_score REAL DEFAULT 0
  )`).run();

  const { urls } = await ctx.request.json() as {urls:string[]};
  if(!urls?.length) return new Response(JSON.stringify({error:"No urls"}),{status:400});
  const results=[];
  for(const url of urls.slice(0,10)){
    try{
      const res=await fetch(url,{headers:{"User-Agent":"EngineV1-Bot/1.0"}});
      const html=await res.text();
      const title=html.match(/<title>(.*?)<\/title>/i)?.[1]?.slice(0,200)||url;
      const desc=html.match(/<meta name="description" content="(.*?)"/i)?.[1]?.slice(0,500)||"";
      const text=html.replace(/<script[\s\S]*?<\/script>/gi,"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").slice(0,8000);
      const id=btoa(url).replace(/[^a-zA-Z0-9]/g,"").slice(0,32);
      const domain=new URL(url).hostname;
      await db.prepare("INSERT OR REPLACE INTO pages (id,url,title,description,content,domain,crawled_at,rank_score) VALUES (?,?,?,?,?,?,?,?)").bind(id,url,title,desc,text,domain,Date.now(),Math.random()).run();
      results.push({url,title});
    }catch(e){ results.push({url,error:String(e)}); }
  }
  return new Response(JSON.stringify({success:true,crawled:results.length,results}),{headers:{"Content-Type":"application/json"}});
}
