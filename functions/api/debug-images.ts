export const onRequestGet = async ({request, env}) => {
  try{
    // 1. Check table schema
    const schema = await env.DB.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='pages'").first();
    
    // 2. Try insert test image
    const testUrl = 'https://example.com/test_'+Date.now()+'.jpg';
    let insertResult = 'not tried';
    try{
      await env.DB.prepare('INSERT OR REPLACE INTO pages (url, title, snippet, content, domain, crawled_at, rank) VALUES (?,?,?,?,?,?,?)')
        .bind(testUrl, 'Lagos test', 'Image for Lagos', 'Lagos image', 'owned.images', Date.now(), 5).run();
      insertResult = 'insert OK: '+testUrl;
    }catch(e){ insertResult = 'insert FAILED: '+e.message; }

    // 3. Count
    const count = await env.DB.prepare("SELECT COUNT(*) as c FROM pages WHERE domain='owned.images'").first();
    const total = await env.DB.prepare("SELECT COUNT(*) as c FROM pages").first();
    const sample = await env.DB.prepare("SELECT * FROM pages LIMIT 3").all();

    return new Response(JSON.stringify({
      schema: schema?.sql || 'no table',
      insertResult,
      count_owned_images: count?.c || 0,
      total_pages: total?.c || 0,
      sample: sample.results
    }, null, 2), {headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
  }catch(e){
    return new Response(JSON.stringify({error:e.message, stack:e.stack}), {status:500, headers:{'Content-Type':'application/json'}});
  }
};
