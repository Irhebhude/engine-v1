
export const onRequestGet = async ({request, env}) => {
  const q = new URL(request.url).searchParams.get('q') || '';
  if(!q) return new Response(JSON.stringify([]), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
  
  // 1. Try YOUR OWN engine-index first (100% owned)
  try{
    const owned = await env.DB.prepare("SELECT url, title, snippet FROM pages WHERE title LIKE ? OR snippet LIKE ? OR content LIKE ? ORDER BY rank DESC LIMIT 20").bind('%'+q+'%','%'+q+'%','%'+q+'%').all();
    if(owned.results && owned.results.length > 0){
      return new Response(JSON.stringify(owned.results.map(r=>({title:r.title, url:r.url, snippet:r.snippet, source:'owned:engine-index'}))), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
    }
  }catch(e){}

  // 2. Fallback to Wikipedia (works on Cloudflare)
  try{
    const wikiRes = await fetch('https://en.wikipedia.org/w/api.php?action=opensearch&search='+encodeURIComponent(q)+'&limit=10&format=json&origin=*', {headers:{'User-Agent':'SEARCH-POI'}});
    const wikiData = await wikiRes.json();
    let results = [];
    if(wikiData[1]) for(let i=0;i<wikiData[1].length;i++) results.push({title: wikiData[1][i], url: wikiData[3][i], snippet: wikiData[2][i]||'Wikipedia: '+wikiData[1][i], source:'wikipedia'});
    return new Response(JSON.stringify(results), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
  }catch(e){
    return new Response(JSON.stringify([]), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
  }
};
