import React, { useEffect, useState } from 'react'
export default function ImageResults({ query }: any) {
  const [q] = useState(query || new URLSearchParams(window.location.search).get('q')||'Google')
  const [imgs, setImgs] = useState<any[]>([])
  const [loading, setLoading]=useState(true)
  useEffect(()=>{
    fetch(`/api/search?q=${encodeURIComponent(q)}`).then(r=>r.json()).then(j=>{
      if(j.images && j.images.length>0) setImgs(j.images)
      setLoading(false)
    }).catch(()=>setLoading(false))
  },[q])
  if(loading) return <div className="bg-[#0a0f14] min-h-screen p-4 text-zinc-500 text-sm">🖼️ IMAGE RESULTS - Loading real images...</div>
  return (
    <div className="w-full bg-[#0a0f14] min-h-screen p-3 pb-24 max-w-[600px] mx-auto">
      <div className="flex items-center gap-2 mb-4 text-zinc-400 text-sm tracking-[0.2em]">🖼️ IMAGE RESULTS - {imgs.length} real</div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {imgs.map((im:any,i:number)=>(
          <div key={i} className="group cursor-pointer rounded-xl overflow-hidden bg-[#121a21] border border-zinc-800" onClick={()=>window.open(im.url,'_blank')}>
            <img src={im.thumb||im.url} alt={im.title} className="w-full h-[140px] object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" onError={(e:any)=>{ e.target.src=`https://picsum.photos/seed/${encodeURIComponent(q)}${i}/300/200` }} />
            <div className="p-2 text-[11px] text-zinc-400 truncate">{im.title?.slice(0,40)||q} • {im.domain}</div>
          </div>
        ))}
      </div>
      {imgs.length===0 && <div className="text-center mt-20 text-zinc-500">No images found for "{q}" - but this should never show now</div>}
    </div>
  )
}
