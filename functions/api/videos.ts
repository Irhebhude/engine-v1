export const onRequestGet = async ({ request }: any) => {
 const u=new URL(request.url); const q=u.searchParams.get('q')?.trim()||'FX rate USD/NGN';
 const cors={'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Cache-Control':'public, max-age=600, s-maxage=1800'};
 function clean(s:string){ return s? s.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,200):''; }
 let videos:any[]=[];
 try{
  const controller=new AbortController(); setTimeout(()=>controller.abort(),3000);
  const [bV1, inv]=await Promise.allSettled([
    fetch(`https://www.bing.com/videos/search?q=${encodeURIComponent(q)}&first=1`,{headers:{'User-Agent':'Mozilla/5.0'},signal:controller.signal}).then(r=>r.text()).catch(()=>'' ),
    fetch(`https://vid.puffyan.us/api/v1/search?q=${encodeURIComponent(q)}`,{headers:{'User-Agent':'Mozilla/5.0'},signal:controller.signal}).then(r=>r.json()).catch(()=>[] )
  ]);
  if(bV1.status==='fulfilled' && typeof bV1.value==='string'){
   const bV=[...bV1.value.matchAll(/"contentUrl":"([^"]+)"[\s\S]{0,300}?"thumbnailUrl":"([^"]+)"[\s\S]{0,300}?"name":"([^"]+)"/gi)];
   videos=[...videos,...bV.slice(0,12).map((x:any)=>{ let url=x[1].replace(/\\u002f/g,'/').replace(/\\/g,''); let thumb=x[2].replace(/\\u002f/g,'/').replace(/\\/g,''); let title=clean(x[3]||q); let vid=''; try{if(url.includes('v=')) vid=url.split('v=')[1].split('&')[0];}catch{} return {title,url,thumbnail:thumb,embed_url:vid?`https://www.youtube.com/embed/${vid}`:url,videoId:vid||Math.random().toString(36).slice(2),domain:'youtube.com',duration:'',ics:85,type:'video',real:true}; }).filter((v:any)=>v.url.startsWith('http'))];
  }
  if(inv.status==='fulfilled' && Array.isArray(inv.value)){
   (inv.value as any[]).slice(0,12).forEach((v:any)=>{ if(v.videoId) videos.push({title:clean(v.title||q),url:`https://www.youtube.com/watch?v=${v.videoId}`,thumbnail:v.videoThumbnails?.[0]?.url||`https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,embed_url:`https://www.youtube.com/embed/${v.videoId}`,videoId:v.videoId,domain:'youtube.com',ics:86,type:'video',real:true}); });
  }
 }catch{}
 if(videos.length<5) videos=Array.from({length:12}).map((_,i)=>({title:`${q} video ${i+1}`,thumbnail:`https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg`,embed_url:`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(q)}`,domain:'youtube.com',ics:70,type:'video'}));
 const seen=new Set(); videos=videos.filter((v:any)=>{ if(seen.has(v.videoId)) return false; seen.add(v.videoId); return true; }).slice(0,24);
 return new Response(JSON.stringify({query:q, videos, videos_total:videos.length}),{headers:cors});
}
