
export const onRequestGet = async ({request}) => {
  const q = new URL(request.url).searchParams.get('q') || '';
  let results = [];
  try {
    const res = await fetch('https://duckduckgo.com/?q='+encodeURIComponent(q)+'&iax=images&ia=images', {headers:{'User-Agent':'Mozilla/5.0'}}).then(r=>r.text());
    // Extract vqd token needed
    const vqdMatch = res.match(/vqd="([^"]+)"/) || res.match(/vqd=([^&'"]+)/);
    const vqd = vqdMatch ? vqdMatch[1] : '';
    if(vqd){
      const imgJson = await fetch('https://duckduckgo.com/i.js?l=wt-wt&o=json&q='+encodeURIComponent(q)+'&vqd='+vqd+'&f=,,,,,&p=1', {headers:{'User-Agent':'Mozilla/5.0','Referer':'https://duckduckgo.com/'}}).then(r=>r.json()).catch(()=>null);
      if(imgJson?.results){
        results = imgJson.results.slice(0,20).map(i=>({title: i.title, url: i.image, thumbnail: i.thumbnail, source: i.url, sourcePage: 'duckduckgo'}));
      }
    }
  } catch(e){}
  return new Response(JSON.stringify(results), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
};
