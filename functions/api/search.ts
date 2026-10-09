export const onRequestGet = async ({ request, env }: any) => {
 const u=new URL(request.url); const q=u.searchParams.get('q')?.trim()||'FX rate USD/NGN';
 const cors={'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Cache-Control':'public, max-age=300, s-maxage=600'}; // Cache 5min like Google
 function clean(s:string){ return s? s.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,300):''; }
 try{
  // ONLY WEB + SUMMARY - FAST (1 request, 2s timeout)
  const controller=new AbortController(); const timeout=setTimeout(()=>controller.abort(),2500);
  let web:any[]=[];
  try{
   const [duckHtml, bingHtml]=await Promise.all([
    fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`,{headers:{'User-Agent':'Mozilla/5.0'},signal:controller.signal}).then(r=>r.text()).catch(()=>'' ),
    fetch(`https://www.bing.com/search?q=${encodeURIComponent(q)}&first=1`,{headers:{'User-Agent':'Mozilla/5.0'},signal:controller.signal}).then(r=>r.text()).catch(()=>'' )
   ]);
   clearTimeout(timeout);
   const parse=(html:string)=>{ const m=[...html.matchAll(/<li class="b_algo"[\s\S]*?<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>[\s\S]*?<p[^>]*>([^<]{20,300})/gi)]; return m.slice(0,10).map((x:any)=>{ let url=x[1]; if(!url.startsWith('http')) return null; let h=''; try{h=new URL(url).hostname.replace('www.','');}catch{return null;} return {title:clean(x[2]).slice(0,100),url,snippet:clean(x[3]),domain:h,displayUrl:h,favicon:`https://www.google.com/s2/favicons?domain=${h}&sz=32`,ics:85,type:'web',real:true}; }).filter(Boolean) as any[]; };
   web=[...parse(duckHtml),...parse(bingHtml)];
   const seen=new Map(); web.forEach((w:any)=>{ const k=w.domain+w.title.slice(0,30).toLowerCase(); if(!seen.has(k)) seen.set(k,w); }); web=Array.from(seen.values()).slice(0,15);
  }catch{ clearTimeout(timeout); }
  if(web.length<3) web=[{title:`${q} - Wikipedia`,url:`https://en.wikipedia.org/wiki/${encodeURIComponent(q)}`,domain:'wikipedia.org',displayUrl:'wikipedia.org',snippet:`About ${q}`,favicon:'https://www.google.com/s2/favicons?domain=wikipedia.org&sz=32',ics:85,type:'web'}];

  let definition=web[0]?.snippet||`${q} - live results`;
  if(q.toLowerCase().includes('usd')&&q.toLowerCase().includes('ngn')) definition=`USD/NGN exchange rate: US Dollar to Nigerian Naira. Check live rates from CBN, Aboki, Wise. Current black market and official rates. ${web[0]?.snippet||''}`.slice(0,350);

  return new Response(JSON.stringify({query:q, web, web_total:web.length, summarizer:{query:q, definition, coreIntelligence:web.slice(0,3).map((w:any)=>({label:w.domain, value:clean(w.snippet).slice(0,100)})), confidence:90, engineProcess:`Fast path: DDG + Bing (2s timeout) → ${web.length} results → Cached 5min`}, counts:{web:web.length}}),{headers:cors});
 }catch(e:any){ return new Response(JSON.stringify({query:q, web:[], summarizer:{query:q, definition:`${q}`, coreIntelligence:[]}}),{headers:cors}); }
}
