const fs = require('fs');
const path = require('path');
function walk(dir){
  let out=[];
  if(!fs.existsSync(dir)) return out;
  for(let f of fs.readdirSync(dir)){
    let p=path.join(dir,f);
    if(fs.statSync(p).isDirectory()) out=out.concat(walk(p));
    else out.push(p);
  }
  return out;
}
let files = walk('src');
let target=null;
for(let file of files){
  if(!file.match(/\.(tsx|ts|jsx|js)$/)) continue;
  let c=fs.readFileSync(file,'utf8');
  if(c.includes('VIDEOS -') && c.includes('IMAGES -')){
    console.log('FOUND BROKEN ALL TAB:', file);
    target=file;
  }
}
if(!target){
  console.log('Not found, checking App.tsx');
  if(fs.existsSync('src/App.tsx')) target='src/App.tsx';
  if(fs.existsSync('src/pages/Search.tsx')) target='src/pages/Search.tsx';
}
console.log('Will fix:', target);

const newUI = `
import { useState, useEffect } from 'react';

export default function SearchPage(){
  const [q, setQ] = useState('Lagos businesses');
  const [query, setQuery] = useState('Lagos businesses');
  const [tab, setTab] = useState('ALL');
  const [web, setWeb] = useState([]);
  const [videos, setVideos] = useState([]);
  const [ai, setAi] = useState('');
  const [loading, setLoading] = useState(false);

  const doSearch = async (searchQ) => {
    const searchQuery = searchQ || query;
    if(!searchQuery) return;
    setLoading(true);
    setQ(searchQuery);
    try{
      const [webR, videoR, aiR] = await Promise.all([
        fetch('/api/search?q='+encodeURIComponent(searchQuery)).then(r=>r.json()).catch(()=>[]),
        fetch('/api/videos?q='+encodeURIComponent(searchQuery)).then(r=>r.json()).catch(()=>[]),
        fetch('/api/ai-answer?q='+encodeURIComponent(searchQuery)).then(r=>r.json()).catch(()=>({answer:''}))
      ]);
      setWeb(Array.isArray(webR) ? webR : []);
      setVideos(Array.isArray(videoR) ? videoR : []);
      setAi(aiR.answer || '');
    }catch(e){ console.log(e); }
    setLoading(false);
  };

  useEffect(()=>{ doSearch('Lagos businesses'); }, []);

  return (
    <div style={{background:'#0a0a0a', minHeight:'100vh', color:'white', padding:'10px'}}>
      <div style={{display:'flex', gap:'10px', marginBottom:'15px'}}>
        <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doSearch()} 
          style={{flex:1, padding:'14px 18px', borderRadius:'25px', border:'1px solid #333', background:'#1a1a1a', color:'white'}} placeholder="Search..." />
        <button onClick={()=>doSearch()} style={{padding:'14px 28px', borderRadius:'25px', background:'#00d4ff', color:'black', fontWeight:'bold', border:'none'}}>Go</button>
      </div>

      <div style={{display:'flex', gap:'8px', marginBottom:'15px', overflowX:'auto'}}>
        {['ALL','WEB','VIDEOS','IMAGES'].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:'10px 20px', borderRadius:'20px', border:'1px solid #333', background: tab===t ? '#00d4ff' : '#1a1a1a', color: tab===t ? 'black' : 'white', fontWeight: tab===t ? 'bold' : 'normal'}}>{t}</button>
        ))}
      </div>

      {loading && <div style={{padding:'20px'}}>Searching real sources...</div>}

      {!loading && (
        <>
          {ai && (tab==='ALL' || tab==='WEB') && (
            <div style={{background:'#111a23', border:'1px solid #00d4ff33', borderRadius:'12px', padding:'16px', marginBottom:'16px'}}>
              <div style={{color:'#00d4ff', fontSize:'12px', fontWeight:'bold', marginBottom:'8px'}}>🧠 AI ANSWER • GROQ • Real-time</div>
              <div style={{whiteSpace:'pre-wrap', lineHeight:'1.6'}}>{ai}</div>
            </div>
          )}

          {(tab==='ALL' || tab==='WEB') && (
            <div>
              <div style={{color:'#888', fontSize:'13px', marginBottom:'10px'}}>🌐 WEB - {web.length} results • Real DuckDuckGo + Wikipedia</div>
              {web.map((w,i)=>(
                <div key={i} style={{background:'#141414', borderRadius:'10px', padding:'12px', marginBottom:'10px'}}>
                  <a href={w.url} target="_blank" style={{color:'#4da6ff', fontWeight:'bold', textDecoration:'none'}}>{w.title}</a>
                  <div style={{color:'#0f0', fontSize:'12px', overflow:'hidden', textOverflow:'ellipsis'}}>{w.url}</div>
                  <div style={{color:'#aaa', fontSize:'13px', marginTop:'4px'}}>{w.snippet}</div>
                </div>
              ))}
            </div>
          )}

          {(tab==='ALL' || tab==='VIDEOS') && (
            <div>
              <div style={{color:'#888', fontSize:'13px', margin:'15px 0 10px'}}>🎬 VIDEOS - {videos.length} real YouTube</div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                {videos.map((v,i)=>(
                  <a key={i} href={v.url} target="_blank" style={{textDecoration:'none', color:'white'}}>
                    <div style={{background:'#141414', borderRadius:'10px', overflow:'hidden'}}>
                      <img src={v.thumbnail} style={{width:'100%', aspectRatio:'16/9', objectFit:'cover'}} />
                      <div style={{padding:'8px', fontSize:'13px', fontWeight:'bold'}}>{v.title?.slice(0,60)}</div>
                      <div style={{padding:'0 8px 8px', fontSize:'11px', color:'#888'}}>{v.channel} • {v.duration}</div>
                    </div>
                  </a>
                ))}
              </div>
              {videos.length===0 && !loading && <div style={{color:'#666', padding:'10px'}}>No videos found, try another query</div>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
`;

if(target){
  fs.writeFileSync(target, newUI);
  console.log('FIXED FRONTEND:', target);
} else {
  console.log('Could not find target, creating src/App.tsx');
  fs.writeFileSync('src/App.tsx', newUI);
}
