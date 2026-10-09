interface Env { DB: D1Database }
export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const { query } = await ctx.request.json() as {query:string};
  if(!query) return Response.json({success:false,data:[]});
  try{
    const r = await ctx.env.DB.prepare("SELECT url,title,description FROM pages WHERE title LIKE ? LIMIT 20").bind(`%${query}%`).all();
    return Response.json({success:true,source:"OWNED_NEWS_INDEX",data:r.results});
  }catch(e){
    return Response.json({success:false,error:String(e),data:[]});
  }
}
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null,{headers:{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"POST,OPTIONS","Access-Control-Allow-Headers":"*"}});
}
