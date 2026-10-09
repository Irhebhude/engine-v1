import React, { useEffect, useState } from 'react'
export default function VideoResults({ query }: any) {
  const [q] = useState(query || new URLSearchParams(window.location.search).get('q')||'Google')
  const [vids, setVids] = useState<any[]>([])
  const [loading, setLoading]=useState(true)
  const [playing, setPlaying]=useState<string|null>(null)
  useEffect(()=>{
    fetch(`/api/search?q=${encodeURIComponent(q)}`).then(r=>r.json()).then(j=>{
      if(j.videos && j.videos.length>0) setVids(j.videos)
      setLoading(false)
    }).catch(()=>setLoading(false))
  },[q])
  if(loading) return <div className="bg-[#0a0f14] min-h-screen p-4 text-zinc-500 text-sm">🎬 VIDEO RESULTS - Loading real videos...</div>
  return (
    <div className="w-full bg-[#0a0f14] min-h-screen p-3 pb-24 max-w-[600px] mx-auto">
      <div className="flex items-center gap-2 mb-4 text-zinc-400 text-sm tracking-[0.2em]">🎬 VIDEO RESULTS - {vids.length} real videos</div>
      <div className="space-y-4">
        {vids.map((v:any,i:number)=>(
          <div key={i} className="rounded-xl overflow-hidden bg-[#121a21] border border-zinc-800">
            {playing===v.videoId? (
              <iframe src={v.embed_url} className="w-full h-[200px]" allowFullScreen title={v.title}></iframe>
            ) : (
              <div className="relative cursor-pointer group" onClick={()=> v.videoId?setPlaying(v.videoId):window.open(v.url,'_blank')}>
                <img src={v.thumbnail} alt={v.title} className="w-full h-[190px] object-cover" loading="lazy" onError={(e:any)=>e.target.src=`https://picsum.photos/seed/${encodeURIComponent(q)}v${i}/640/360`} />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/10 transition"><div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center text-black text-xl">▶</div></div>
                {v.duration && <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] px-1.5 py-0.5 rounded">{v.duration}</div>}
              </div>
            )}
            <div className="p-3">
              <div className="text-[14px] font-semibold text-white line-clamp-2 leading-tight">{v.title}</div>
              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-zinc-500"><img src={v.favicon||`https://www.google.com/s2/favicons?domain=${v.domain}&sz=32`} className="w-4 h-4 rounded-full bg-white"/>{v.domain} • {v.source||'YouTube'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
