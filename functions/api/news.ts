export const onRequestGet = async ({ request }: any) => {
 const u=new URL(request.url); const q=u.searchParams.get('q')?.trim()||'FX rate USD/NGN';
 const cors={'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Cache-Control':'public, max-age=300, s-maxage=600'};
 function clean(s:string){ return s? s.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,180):''; }
 let news:any[]=[];
 try{
  const rss=await fetch(`https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-NG&gl=NG&ceid=NG:en`,{headers:{'User-Agent':'Mozilla/5.0'}}).then(r=>r.text()).catch(()=>'' );
  const items=[...rss.matchAll(/<item>[\s\S]*?<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>[\s\S]*?<link>([^<]+)<\/link>/gi)];
  news=items.slice(0,15).map((x:any)=>({title:clean(x[1]).slice(0,110),url:x[2],snippet:clean(x[1]),domain:new URL(x[2]).hostname.replace('www.',''),favicon:`https://www.google.com/s2/favicons?domain=${new URL(x[2]).hostname}&sz=32`,ics:85,freshness:'2h ago',type:'news',real:true}));
 }catch{}
 return new Response(JSON.stringify({query:q, news, news_total:news.length}),{headers:cors});
}
