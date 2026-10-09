export const onRequestGet = async ({ request }: any) => {
 const u=new URL(request.url); const q=u.searchParams.get('q')?.trim()||'Instagram';
 const cors={'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Cache-Control':'public, max-age=3600, s-maxage=3600'};
 function clean(s:string){ return s? s.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,100):''; }
 let images:any[]=[];
 try{
  const controller=new AbortController(); setTimeout(()=>controller.abort(),2500);
  const html=await fetch(`https://www.bing.com/images/search?q=${encodeURIComponent(q)}&first=1`,{headers:{'User-Agent':'Mozilla/5.0'},signal:controller.signal}).then(r=>r.text()).catch(()=>'' );
  const bImg=[...html.matchAll(/"murl":"([^"]+)"[\s\S]{0,200}?"turl":"([^"]+)"[\s\S]{0,200}?"t":"([^"]*)"/gi)];
  images=bImg.slice(0,24).map((x:any)=>({url:x[1].replace(/\\u002f/g,'/').replace(/\\/g,''),thumb:x[2].replace(/\\u002f/g,'/').replace(/\\/g,''),title:clean(x[3]||q),domain:'bing.com',ics:85,type:'image',real:true})).filter((i:any)=>i.url.startsWith('http'));
 }catch{}
 if(images.length<6) images=Array.from({length:18}).map((_,i)=>({url:`https://source.unsplash.com/600x400/?${encodeURIComponent(q)}`,thumb:`https://source.unsplash.com/300x200/?${encodeURIComponent(q)}`,title:q,domain:'unsplash.com',ics:75,type:'image'}));
 return new Response(JSON.stringify({query:q, images, images_total:images.length}),{headers:cors});
}
