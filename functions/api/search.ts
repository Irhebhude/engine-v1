
export const onRequestGet = async ({request}) => {
  const q = new URL(request.url).searchParams.get('q') || '';
  if(!q) return new Response(JSON.stringify([]), {headers:{'Content-Type':'application/json'}});
  let results = [];
  try{
    const ddg = await fetch('https://api.duckduckgo.com/?q='+encodeURIComponent(q)+'&format=json&no_html=1').then(r=>r.json()).catch(()=>null);
    if(ddg?.AbstractText) results.push({title: ddg.Heading, url: ddg.AbstractURL || 'https://duckduckgo.com/?q='+encodeURIComponent(q), snippet: ddg.AbstractText, source:'duckduckgo'});
    if(ddg?.RelatedTopics){
      for(let t of ddg.RelatedTopics.slice(0,6)){
        if(t.Topics) t = t.Topics[0];
        if(t?.Text && t?.FirstURL) results.push({title: t.Text.slice(0,100), url: t.FirstURL, snippet: t.Text, source:'duckduckgo'});
      }
    }
    const wiki = await fetch('https://en.wikipedia.org/w/api.php?action=opensearch&search='+encodeURIComponent(q)+'&limit=5&format=json').then(r=>r.json()).catch(()=>null);
    if(wiki && wiki[1]) for(let i=0;i<wiki[1].length;i++) results.push({title: wiki[1][i], url: wiki[3][i], snippet: wiki[2][i], source:'wikipedia'});
  }catch(e){}
  return new Response(JSON.stringify(results.slice(0,20)), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
};
