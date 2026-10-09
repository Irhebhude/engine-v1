export function detectIntent(q:string){
 q=q.toLowerCase();
 if(q.includes('how to')||q.includes('video')||q.includes('watch')||q.includes('tutorial')) return 'video';
 if(q.includes('news')||q.includes('today')||q.includes('latest')||q.includes('breaking')) return 'news';
 if(q.includes('image')||q.includes('photo')||q.includes('picture')||q.includes('wallpaper')) return 'image';
 if(q.includes('near me')||q.includes('shop')||q.includes('lagos')||q.includes('abuja')||q.includes('barbing')) return 'local';
 return 'web';
}
export function icsBoost(url:string,snippet:string,clicks=0,dwell=0,intent='web'){
 let s=50;
 if(url.includes('wikipedia')) s+=22;
 if(url.includes('mapbox')||url.includes('osmand')||url.includes('aws.amazon')) s+=16;
 if(url.includes('jiji')||url.includes('nairaland')) s+=12;
 if(url.startsWith('https')) s+=8; if(snippet.length>60) s+=8;
 s+=Math.min(15,clicks*2); if(dwell>60) s+=12; if(dwell<5&&clicks>2) s-=15;
 if(intent==='local'&&(url.includes('jiji')||url.includes('mapbox'))) s+=15;
 return Math.min(95,Math.max(15,s));
}
