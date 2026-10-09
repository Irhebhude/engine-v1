
export const onRequestGet = async ({request, env}) => {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || 'Lagos businesses';
  const num = 20;

  try{
    // Fetch Google HTML (like a browser)
    const googleHtml = await fetch('https://www.google.com/search?q='+encodeURIComponent(q)+'&num='+num+'&hl=en', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    }).then(r=>r.text());

    let results = [];
    // Parse Google HTML - extract <a href="/url?q=..."> and snippets
    const regex = /<div class="[^"]*g[^"]*">.*?<a href="\/url\?q=([^&"]+)[^>]*><h3[^>]*>(.*?)<\/h3>.*?<div class="[^"]*VwiC3b[^"]*">.*?<span[^>]*>(.*?)<\/span>/gs;
    let match;
    while((match = regex.exec(googleHtml)) !== null && results.length < num){
      try{
        const rawUrl = decodeURIComponent(match[1]);
        if(rawUrl.includes('google.com') || rawUrl.includes('youtube.com')) continue;
        const title = match[2].replace(/<[^>]+>/g,'').trim();
        const snippet = match[3].replace(/<[^>]+>/g,'').trim();
        if(title && rawUrl.startsWith('http')){
          results.push({url: rawUrl, title, snippet});
          // SAVE 100% OWNED to engine-index
          await env.DB.prepare(
            'INSERT OR REPLACE INTO pages (url, title, snippet, content, domain, crawled_at, rank) VALUES (?,?,?,?,?,?,?)'
          ).bind(rawUrl, title, snippet, title+' '+snippet, new URL(rawUrl).hostname, Date.now(), 10).run().catch(()=>{});
        }
      }catch(e){}
    }

    // Backup parser - if Google changed HTML
    if(results.length===0){
      const fallbackRegex = /<a href="\/url\?q=(https[^&"]+)[^>]*>(.*?)<\/a>/g;
      while((match = fallbackRegex.exec(googleHtml)) !== null && results.length < 15){
        try{
          const u = decodeURIComponent(match[1]);
          if(u.includes('google')) continue;
          const t = match[2].replace(/<[^>]+>/g,'').slice(0,150);
          if(t.length>10 && u.startsWith('http')){
            results.push({url: u, title: t, snippet: 'Google result for '+q});
            await env.DB.prepare('INSERT OR REPLACE INTO pages (url, title, snippet, domain, crawled_at, rank) VALUES (?,?,?,?,?,?)')
              .bind(u, t, 'Google: '+t, new URL(u).hostname, Date.now(), 10).run().catch(()=>{});
          }
        }catch(e){}
      }
    }

    return new Response(JSON.stringify({
      message: 'Crawled Google HTML and stored 100% owned in engine-index',
      query: q,
      crawled_count: results.length,
      owned_results: results
    }), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});

  }catch(e){
    return new Response(JSON.stringify({error: e.message, query: q}), {status:500, headers:{'Content-Type':'application/json'}});
  }
};
