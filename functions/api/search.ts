
export const onRequestGet = async ({request}) => {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';
  if(!q) return new Response(JSON.stringify([]), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
  
  let results = [];
  let debug = [];

  // 1. Wikipedia opensearch - works 100% on Cloudflare
  try{
    const wikiRes = await fetch('https://en.wikipedia.org/w/api.php?action=opensearch&search='+encodeURIComponent(q)+'&limit=10&format=json&origin=*', {
      headers:{'User-Agent':'SEARCH-POI/1.0 (Cloudflare Worker)'}
    });
    const wikiData = await wikiRes.json();
    if(wikiData && wikiData[1] && wikiData[1].length>0){
      for(let i=0;i<wikiData[1].length;i++){
        results.push({
          title: wikiData[1][i],
          url: wikiData[3][i],
          snippet: wikiData[2][i] || 'Wikipedia article: ' + wikiData[1][i] + ' - Learn more about ' + q,
          source: 'wikipedia'
        });
      }
      debug.push('wiki:'+wikiData[1].length);
    } else {
      debug.push('wiki:0');
    }
  }catch(e){ debug.push('wiki-error:'+e.message); }

  // 2. Wikipedia REST search - backup
  if(results.length < 5){
    try{
      const restRes = await fetch('https://en.wikipedia.org/w/rest.php/v1/search/title?q='+encodeURIComponent(q)+'&limit=8', {
        headers:{'User-Agent':'SEARCH-POI/1.0'}
      });
      const restData = await restRes.json();
      if(restData.pages){
        for(let p of restData.pages.slice(0,5)){
          if(results.find(r=>r.title===p.title)) continue;
          results.push({
            title: p.title,
            url: 'https://en.wikipedia.org/wiki/'+encodeURIComponent(p.title.replace(/ /g,'_')),
            snippet: p.description || p.excerpt || 'Wikipedia: '+p.title,
            source: 'wikipedia-rest'
          });
        }
        debug.push('rest:'+restData.pages.length);
      }
    }catch(e){ debug.push('rest-error:'+e.message); }
  }

  // 3. If still low, add DuckDuckGo via html (more reliable)
  if(results.length < 3){
    try{
      const ddg = await fetch('https://api.duckduckgo.com/?q='+encodeURIComponent(q)+'&format=json&no_html=1&skip_disambig=1', {
        headers:{'User-Agent':'Mozilla/5.0'}
      });
      const ddgData = await ddg.json();
      if(ddgData.AbstractText){
        results.unshift({
          title: ddgData.Heading || q,
          url: ddgData.AbstractURL || 'https://duckduckgo.com/?q='+encodeURIComponent(q),
          snippet: ddgData.AbstractText,
          source: 'duckduckgo'
        });
        debug.push('ddg:1');
      }
      if(ddgData.RelatedTopics){
        for(let t of ddgData.RelatedTopics.slice(0,4)){
          if(t.Topics) t = t.Topics[0];
          if(t?.Text && t?.FirstURL){
            results.push({title: t.Text.slice(0,120), url: t.FirstURL, snippet: t.Text, source:'duckduckgo'});
          }
        }
      }
    }catch(e){ debug.push('ddg-error:'+e.message); }
  }

  // NEVER return 0 - add helpful links if all fails
  if(results.length===0){
    results = [
      {title: q + ' - Wikipedia', url: 'https://en.wikipedia.org/wiki/Special:Search?search='+encodeURIComponent(q), snippet: 'Search Wikipedia for '+q, source:'search-link'},
      {title: q + ' - DuckDuckGo', url: 'https://duckduckgo.com/?q='+encodeURIComponent(q), snippet: 'Search DuckDuckGo for '+q, source:'search-link'},
      {title: q + ' - Google', url: 'https://google.com/search?q='+encodeURIComponent(q), snippet: 'Search Google for '+q, source:'search-link'}
    ];
    debug.push('fallback-links');
  }

  return new Response(JSON.stringify(results), {
    headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*', 'X-Debug': debug.join(',')}
  });
};
