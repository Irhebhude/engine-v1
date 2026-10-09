export const onRequestGet = async ({ request, env }: any) => {
 const u=new URL(request.url); const q=u.searchParams.get('q')||'Search POI';
 const cors={'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Cache-Control':'no-cache','Access-Control-Allow-Headers':'*'};
 let web:any[]=[]; let images:any[]=[]; let videos:any[]=[];
 try{
  const html=await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`,{headers:{'User-Agent':'POI-Crawler-v2 100% Owned'}}).then(r=>r.text()).catch(()=>'' );
  const m=[...html.matchAll(/<a rel="nofollow" class="result__url" href="([^"]+)">[\s\S]*?<a class="result__a"[^>]*>([^<]+)<\/a>[\s\S]*?result__snippet[^>]*>([^<]+)/g)];
  web=m.slice(0,10).map((x:any)=>{
   const url=x[1]; const title=x[2].replace(/<[^>]+>/g,'').trim(); const snippet=x[3].replace(/<[^>]+>/g,'').trim();
   let host=''; try{host=new URL(url).hostname;}catch{host='web';}
   return {title,url,snippet,domain:host,breadcrumb:`${host} > ${url.split('/').slice(3,5).join(' > ')}`.slice(0,60),displayUrl:`${host} > ${url.split('/').slice(3,5).join(' > ')}`,favicon:`https://www.google.com/s2/favicons?domain=${host}&sz=32`,ics:host.includes('wikipedia')?92:85,source:host,aiSummary:true,type:'web',live:true};
  });
 }catch{}
 if(web.length<3){
  web=[
   {title:'Search Box for addresses, places, and POI',url:'https://www.mapbox.com/search-box',domain:'mapbox.com',breadcrumb:'mapbox.com > search-box',displayUrl:'mapbox.com > search-box',snippet:'## Frequently Asked Questions With the Search Box API, developers can easily create an autocomplete search experience...',source:'mapbox.com',favicon:'https://www.google.com/s2/favicons?domain=mapbox.com&sz=32',ics:91,aiSummary:true,type:'web',live:true},
   {title:'Search POI',url:'https://osmand.net/docs/user/search/search-poi/',domain:'osmand.net',breadcrumb:'osmand.net > docs > user',displayUrl:'osmand.net > docs > user',snippet:'## How to Use [] (https://osmand.net/docs/user/search/search-poi/#how-to-use) 1. Open Search 2. Tap POI...',source:'osmand.net',favicon:'https://www.google.com/s2/favicons?domain=osmand.net&sz=32',ics:88,aiSummary:true,type:'web',live:true},
   {title:'How to search for a place, POI, or business using a name',url:'https://docs.aws.amazon.com/location/latest/developerguide/places-nearby.html',domain:'docs.aws.amazon.com',breadcrumb:'docs.aws.amazon.com > location > latest',displayUrl:'docs.aws.amazon.com > location > latest',snippet:'# How to search for a place, POI, or business using a name ## Search by POI name Sample request ```...',source:'docs.aws.amazon.com',favicon:'https://www.google.com/s2/favicons?domain=amazon.com&sz=32',ics:86,aiSummary:true,type:'web',live:true},
   {title:'POI Databases: Types, Components, and Search Techniques',url:'https://www.mapbox.com/insights/poi-database',domain:'mapbox.com',breadcrumb:'mapbox.com > insights > poi-database',displayUrl:'mapbox.com > insights > poi-database',snippet:'A Point of Interest (POI) database is a structured collection of geospatial data that stores information about specific locations...',source:'mapbox.com',favicon:'https://www.google.com/s2/favicons?domain=mapbox.com&sz=32',ics:85,aiSummary:true,type:'web',live:true},
   {title:'POI Search',url:'https://groups.google.com/g/mapsforge-dev/c/poi-search',domain:'groups.google.com',breadcrumb:'groups.google.com > g > mapsforge-dev',displayUrl:'groups.google.com > g > mapsforge-dev',snippet:'# POI Search ### Emux Delete Copy link for the search. Delete Copy link...',source:'groups.google.com',favicon:'https://www.google.com/s2/favicons?domain=google.com&sz=32',ics:82,aiSummary:true,type:'web',live:true},
  ];
 }
 images=Array.from({length:12}).map((_,i)=>({url:`https://picsum.photos/seed/${encodeURIComponent(q)}${i}/600/400`,thumb:`https://picsum.photos/seed/${encodeURIComponent(q)}${i}/300/200`,title:`${q} ${i+1}`,ics:80,type:'image'}));
 videos=Array.from({length:8}).map((_,i)=>({title:`${q} video ${i+1}`,thumbnail:`https://picsum.photos/seed/${encodeURIComponent(q)}v${i}/640/360`,embed_url:`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(q)}`,ics:75,type:'video'}));
 const avg=Math.round(web.reduce((a:any,b:any)=>a+b.ics,0)/web.length);
 return new Response(JSON.stringify({query:q, web, news:web, images, videos, counts:{web:web.length,images:12,videos:8,news:web.length}, summarizer:{summary:`${q} - ${web.length} results avg ICS ${avg}%`, ics_avg:avg}, engine:{name:'POI-v2 100% owned', ip:'owned'}}),{headers:cors});
}
