export function calculateICS(url:string,snippet:string,clicks=0,dwell=0){
  let s=50;
  if(url.includes('wikipedia')) s+=20;
  if(url.includes('mapbox')||url.includes('osmand')||url.includes('aws.amazon')) s+=15;
  if(url.includes('jiji')||url.includes('nairaland')) s+=15;
  if(url.startsWith('https')) s+=10;
  if(snippet.length>60) s+=10;
  if(clicks>5) s+=15; if(dwell>60) s+=15; if(dwell<5 && clicks>2) s-=20;
  return Math.min(95,Math.max(20,s));
}
