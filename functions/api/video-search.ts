export const onRequestGet = async ({ request, env }) => {
  const u = new URL(request.url);
  const q = u.searchParams.get('q') || 'Lagos';
  const fetchers = [];

  // 1. ARCHIVE.ORG - 100% FREE NO KEY
  fetchers.push(
    fetch(`https://archive.org/advancedsearch.php?q=${encodeURIComponent(q)}+mediatype:movies&fl[]=identifier&fl[]=title&rows=12&output=json`)
   .then(r=>r.json()).then(d=>(d.response?.docs||[]).map(v=>({
      id:`archive_${v.identifier}`, title:v.title, thumbnail:`https://archive.org/services/img/${v.identifier}`,
      video_url:`https://archive.org/embed/${v.identifier}`, embed_url:`https://archive.org/embed/${v.identifier}`,
      source:'Archive.org', type:'video'
    }))).catch(()=>[])
  );

  // 2. PIXABAY VIDEOS - FREE KEY (optional)
  if (env.PIXABAY_API_KEY) {
    fetchers.push(
      fetch(`https://pixabay.com/api/videos/?key=${env.PIXABAY_API_KEY}&q=${encodeURIComponent(q)}&per_page=12`)
     .then(r=>r.json()).then(d=>(d.hits||[]).map(v=>({
        id:`pixabay_${v.id}`, title:q, thumbnail:v.videos?.tiny?.url,
        video_url:v.videos?.medium?.url, embed_url:v.videos?.medium?.url, source:'Pixabay', type:'video', duration:v.duration
      }))).catch(()=>[])
    );
  }

  // 3. YOUTUBE via Piped API - FREE NO KEY
  fetchers.push(
    fetch(`https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(q)}&filter=videos`)
   .then(r=>r.json()).then(d=>(d.items||[]).slice(0,10).map((v:any)=>({
      id:`yt_${v.url?.split('v=')[1]||v.url}`, title:v.title, thumbnail:v.thumbnail,
      video_url:`https://www.youtube.com${v.url}`, embed_url:`https://www.youtube.com/embed/${v.url?.split('v=')[1]}`, source:'YouTube', author:v.uploaderName, duration:v.duration, type:'video'
    }))).catch(()=>[])
  );

  // 4. INVIDIOUS FALLBACK - FREE NO KEY
  fetchers.push(
    fetch(`https://inv.nadeko.net/api/v1/search?q=${encodeURIComponent(q)}&type=video`)
   .then(r=>r.json()).then(d=>(Array.isArray(d)?d:[]).slice(0,8).map((v:any)=>({
      id:`inv_${v.videoId}`, title:v.title, thumbnail:`https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg`,
      video_url:`https://www.youtube.com/watch?v=${v.videoId}`, embed_url:`https://www.youtube.com/embed/${v.videoId}`, source:'YouTube via Invidious', type:'video'
    }))).catch(()=>[])
  );

  const results = await Promise.allSettled(fetchers);
  let videos = results.flatMap(r=> r.status==='fulfilled'?r.value:[]).filter(Boolean);
  videos = [...new Map(videos.map(v=>[v.id,v])).values()].slice(0,24);

  if (videos.length===0) {
    videos = [{ id:'fallback', title:q, thumbnail:`https://picsum.photos/seed/${q}/640/360`, video_url:`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`, embed_url:`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(q)}`, source:'YouTube Search', type:'video' }];
  }

  return new Response(JSON.stringify({ query:q, count:videos.length, sources:['Archive.org','Pixabay','YouTube Piped','Invidious'], videos }), {
    headers: { 'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Cache-Control':'public, max-age=300' }
  });
}
