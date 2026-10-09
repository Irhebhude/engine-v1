import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
export default function SearchResults(){
  const [params]=useSearchParams()
  const qParam=params.get('q')||'Instagram'
  const [query,setQuery]=useState(qParam)
  const [input,setInput]=useState(qParam)
  const [tab,setTab]=useState<'all'|'web'|'images'|'videos'|'news'>('videos')
  const [data,setData]=useState<any>(null)
  const [loading,setLoading]=useState(true)
  const [showVids,setShowVids]=useState(12)
  const [playing,setPlaying]=useState<string|null>(null)
  useEffect(()=>{
    setLoading(true)
    fetch(`/api/search?q=${encodeURIComponent(query)}`).then(r=>r.json()).then(j=>{ setData(j); setLoading(false); setShowVids(12); }).catch(()=>setLoading(false))
  },[query])
  if(loading) return <div className="min-h-screen bg-[#0a0f14] flex items-center justify-center text-zinc-500">Fetching MANY videos for "{query}" from 5 sources (like Google)...</div>
  const s=data?.summarizer
  return (
    <div className="min-h-screen bg-[#0a0f14] text-zinc-200">
      <div className="max-w-[600px] mx-auto p-4 pb-24">
        <div className="flex gap-2 mb-4"><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter') setQuery(input)}} className="flex-1 bg-[#121a21] border border-zinc-700 rounded-full px-4 py-2.5 text-sm outline-none" placeholder="Search videos..."/><button onClick={()=>setQuery(input)} className="bg-cyan-500 text-black px-5 rounded-full font-semibold">Go</button></div>
        <div className="flex gap-2 mb-4 overflow-x-auto">{(['all','web','images','videos','news'] as const).map(t=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-1.5 rounded-full text-sm border ${tab===t?'bg-cyan-500 text-black border-cyan-500':'bg-[#121a21] border-zinc-700 text-zinc-400'}`}>{t.toUpperCase()} {t==='videos'?`(${data.videos_total||data.videos?.length})`:t==='web'?`(${data.web_total})`:t==='images'?`(${data.images_total})`:t==='news'?`(${data.news_total})`:''}</button>)}</div>

        {(tab==='all'||tab==='videos') && (
          <div className="mb-8">
            <div className="text-zinc-400 text-[12px] tracking-[0.2em] mb-1">🎬 VIDEO RESULTS - {data.videos_total||data.videos?.length} real videos • Like Google/DuckDuckGo</div>
            <div className="text-[11px] text-zinc-600 mb-4">Bing Videos x3 pages (30) + YouTube (20) + Invidious (15) + Piped (15) → Deduped to {data.videos?.length} • Showing {Math.min(showVids,data.videos?.length)}</div>
            <div className="space-y-4">
              {data.videos?.slice(0,showVids).map((v:any,i:number)=>(
                <div key={i} className="rounded-xl overflow-hidden bg-[#121a21] border border-zinc-800">
                  {playing===v.videoId? <iframe src={v.embed_url} className="w-full h-[210px]" allowFullScreen title={v.title}></iframe> :
                    <div className="relative cursor-pointer group" onClick={()=> v.videoId?setPlaying(v.videoId):window.open(v.url,'_blank')}>
                      <img src={v.thumbnail} className="w-full h-[200px] object-cover" loading="lazy" onError={(e:any)=>e.target.src=`https://picsum.photos/seed/${query}v${i}/640/360`} />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/10"><div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center text-black text-xl shadow-lg">▶</div></div>
                      {v.duration && <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[12px] px-1.5 py-0.5 rounded">{v.duration}</div>}
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">{v.source||'YouTube'}</div>
                    </div>
                  }
                  <div className="p-3"><div className="text-[15px] font-semibold leading-tight line-clamp-2">{v.title}</div><div className="flex gap-2 mt-1.5 text-[11px] text-zinc-500"><span>{v.domain}</span><span>•</span><span>{v.duration||''}</span><span className="ml-auto">{v.ics}% ICS</span></div></div>
                </div>
              ))}
            </div>
            {showVids < (data.videos?.length||0) && <button onClick={()=>setShowVids(c=>c+12)} className="mt-6 w-full py-3 bg-[#121a21] border border-zinc-700 rounded-xl text-sm text-cyan-400">Load more videos • {data.videos.length - showVids} more (like Google infinite scroll)</button>}
          </div>
        )}

        {(tab==='all'||tab==='web') && data.web && <div className="mb-8"><div className="text-zinc-500 text-[12px] tracking-[0.2em] mb-4">🌐 WEB RESULTS - {data.web_total} real</div><div className="space-y-5">{data.web.map((r:any,i:number)=><div key={i} onClick={()=>window.open(r.url,'_blank')} className="cursor-pointer"><div className="flex gap-2 text-[11px] text-zinc-500"><img src={r.favicon} className="w-4 h-4 rounded-full bg-white"/>{r.displayUrl}</div><div className="text-cyan-400 font-semibold mt-1">{r.title}</div><div className="text-zinc-400 text-[13px] mt-1 line-clamp-2">{r.snippet}</div></div>)}</div></div>}
        {(tab==='all'||tab==='images') && <div className="mb-8"><div className="text-zinc-500 text-[12px] tracking-[0.2em] mb-4">🖼️ IMAGE RESULTS - {data.images_total} real</div><div className="grid grid-cols-2 gap-2">{data.images?.slice(0,24).map((im:any,i:number)=><div key={i} className="rounded-xl overflow-hidden bg-[#121a21] border border-zinc-800"><img src={im.thumb||im.url} className="w-full h-[140px] object-cover"/></div>)}</div></div>}
        {(tab==='all'||tab==='news') && <div className="mb-8"><div className="text-zinc-500 text-[12px] tracking-[0.2em] mb-4">📰 NEWS RESULTS - {data.news_total} real</div><div className="space-y-4">{data.news?.map((n:any,i:number)=><div key={i} onClick={()=>window.open(n.url,'_blank')} className="cursor-pointer border-b border-zinc-800/50 pb-3"><div className="text-[11px] text-zinc-500">{n.domain}</div><div className="font-semibold mt-1">{n.title}</div></div>)}</div></div>}

      </div>
    </div>
  )
}
