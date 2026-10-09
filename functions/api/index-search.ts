interface Env { DB: D1Database }
export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const { query, limit=20 } = await ctx.request.json() as {query:string, limit?:number};
  const res=await ctx.env.DB.prepare("SELECT url,title,description,domain FROM pages WHERE title LIKE? OR content LIKE? LIMIT?").bind(`%${query}%`,`%${query}%`,limit).all();
  return Response.json({success:true,source:"owned_index",data:res.results});
}
