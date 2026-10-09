export const onRequestGet = async ({ request, env }: any) => {
  const u = new URL(request.url);
  const q = u.searchParams.get('q') || 'Lagos';
  const key = env?.PIXABAY_API_KEY || '52173678-0a3d7481896b2907d890ab06b';
  let images: any[] = [];
  try {
    const r = await fetch(`https://pixabay.com/api/?key=${key}&q=${encodeURIComponent(q)}&per_page=20&safesearch=true`);
    const d: any = await r.json();
    images = (d.hits||[]).map((h:any)=>({
      id:h.id, url:h.largeImageURL, thumb:h.webformatURL, title:h.tags, source:'Pixabay', pageURL:h.pageURL
    }));
  } catch(e){}

  if(images.length===0){
    images = Array.from({length:12}).map((_,i)=>({
      id:i, url:`https://picsum.photos/seed/${q}${i}/600/400`, thumb:`https://picsum.photos/seed/${q}${i}/300/200`, title:`${q} ${i+1}`, source:'Picsum'
    }));
  }
  return new Response(JSON.stringify({query:q, count:images.length, images, key_exists:!!env?.PIXABAY_API_KEY }), {
    headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}
  });
}
