import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
export default function SearchResults(){
  const [params]=useSearchParams()
  const qParam=params.get('q')||'Instagram'
  const [query,setQuery]=useState(qParam)
  const [input,setInput]=useState(qParam)
  const [tab,setTab]=useState<'all'|'web'|'images'|'videos'|'news'>('web')
  const [data,setData]=useState<any>(null)
  const [loading,setLoading]=useState(true)
  const [showCount,setShowCount]=useState(15)
  useEffect(()=>{
    setLoading(true)
    fetch(`/api/search?q=${encodeURIComponent(query)}`).then(r=>r.json()).then(j=>{ setData(j); setLoading(false); setShowCount(15); }).catch(()=>setLoading(false))
  },[query])
  if(loading) return <div className="min-h-screen bg-[#0a0f14] flex items-center justify-center text-zinc-500">Fetching MANY results for "{query}" from 5 sources...</div>
  const s=data?.summarizer
  return (
    <div className="min-h-screen bg-[#0a0f14] text-zinc-200">
      <div className="max-w-[600px] mx-auto p-4 pb-24">
        <div className="flex gap-2 mb-4"><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter') setQuery(input)}} className="flex-1 bg-[#121a21] border border-zinc-700 rounded-full px-4 py-2.5 text-sm outline-none" placeholder="Search..."/><button onClick={()=>setQuery(input)} className="bg-cyan-500 text-black px-5 rounded-full font-semibold">Go</button></div>
        <div className="flex gap-2 mb-4 overflow-x-auto">{(['all','web','images','videos','news'] as const).map(t=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-1.5 rounded-full text-sm border ${tab===t?'bg-cyan-500 text-black border-cyan-500':'bg-[#121a21] border-zinc-700 text-zinc-400'}`}>{t.toUpperCase()} {t==='web'?`(${data.web_total||data.web?.length})`:t==='news'?`(${data.news_total||data.news?.length})`:t==='images'?`(${data.images?.length})`:t==='videos'?`(${data.videos?.length})`:''}</button>)}</div>

        {s && (tab==='all'||tab==='web') && (
          <div className="mb-6 p-4 bg-[#121a21] border border-zinc-800 rounded-2xl">
            <div className="flex items-center gap-2 text-[13px] tracking-widest text-cyan-400 mb-3">🧠 INTELLIGENT REASONING • Confidence: {s.confidence}%</div>
            <div className="text-[11px] text-zinc-500 mb-2">{s.engineProcess}</div>
            <div className="text-[15px] leading-[1.6]"><b className="text-white">{s.query}</b> {s.definition}</div>
            <div className="mt-3 space-y-2">{s.coreIntelligence?.map((c:any,i:number)=><div key={i} className="flex gap-2 text-[14px]"><span className="text-zinc-500">*</span><span><b className="text-zinc-100">{c.label}:</b> <span className="text-zinc-300">{c.value}</span></span></div>)}</div>
          </div>
        )}

        {(tab==='all'||tab==='web') && (
          <div className="mb-8">
            <div className="text-zinc-400 text-[12px] tracking-[0.2em] mb-1">🌐 WEB RESULTS - {data.web_total||data.web?.length} real (showing {Math.min(showCount,data.web?.length)}) • From 5 sources like Google</div>
            <div className="text-[11px] text-zinc-600 mb-4">DDG + Bing Page1 + Bing Page2 + Wikipedia API + Mojeek → Deduped & ICS ranked</div>
            <div className="space-y-6">
              {data.web?.slice(0,showCount).map((r:any,i:number)=>(
                <div key={i} onClick={()=>window.open(r.url,'_blank')} className="cursor-pointer group">
                  <div className="flex gap-2 text-[11px] text-zinc-500"><img src={r.favicon} className="w-4 h-4 rounded-full bg-white"/>{r.displayUrl}<span className="ml-auto text-[10px] bg-cyan-950 text-cyan-400 px-1.5 rounded border border-cyan-900">{r.ics}% ICS • {r.source||'web'}</span></div>
                  <div className="text-cyan-400 font-semibold mt-1 group-hover:underline line-clamp-2">{r.title}</div>
                  <div className="text-zinc-400 text-[13px] mt-1 line-clamp-3">{r.snippet}</div>
                </div>
              ))}
            </div>
            {showCount < (data.web?.length||0) && <button onClick={()=>setShowCount(c=>c+10)} className="mt-6 w-full py-3 bg-[#121a21] border border-zinc-700 rounded-xl text-sm text-cyan-400">Load more • {data.web.length - showCount} more results (like Google Next Page)</button>}
          </div>
        )}

        {(tab==='all'||tab==='news') && (
          <div className="mb-8">
            <div className="text-zinc-400 text-[12px] tracking-[0.2em] mb-4">📰 NEWS RESULTS - {data.news_total||data.news?.length} real • Google News RSS x2 + Bing News</div>
            <div className="space-y-5">{data.news?.map((n:any,i:number)=>(<div key={i} onClick={()=>window.open(n.url,'_blank')} className="cursor-pointer border-b border-zinc-800/50 pb-4"><div className="flex gap-2 text-[11px] text-zinc-500"><img src={n.favicon} className="w-4 h-4 rounded-full bg-white"/>{n.domain} • {n.freshness||'2h ago'}</div><div className="font-semibold mt-1">{n.title}</div><div className="text-zinc-400 text-[13px] mt-1 line-clamp-2">{n.snippet}</div></div>))}</div>
          </div>
        )}

        {(tab==='all'||tab==='images') && <div className="mb-8"><div className="text-zinc-500 text-[12px] tracking-[0.2em] mb-4">🖼️ IMAGE RESULTS - {data.images?.length} real</div><div className="grid grid-cols-2 gap-2">{data.images?.slice(0,24).map((im:any,i:number)=>(<div key={i} className="rounded-xl overflow-hidden bg-[#121a21] border border-zinc-800" onClick={()=>window.open(im.url,'_blank')}><img src={im.thumb||im.url} className="w-full h-[140px] object-cover" loading="lazy"/></div>))}</div></div>}
        {(tab==='all'||tab==='videos') && <div className="mb-8"><div className="text-zinc-500 text-[12px] tracking-[0.2em] mb-4">🎬 VIDEO RESULTS - {data.videos?.length} real</div><div className="space-y-4">{data.videos?.slice(0,12).map((v:any,i:number)=>(<div key={i} className="rounded-xl overflow-hidden bg-[#121a21] border border-zinc-800"><div className="relative cursor-pointer" onClick={()=>window.open(v.url,'_blank')}><img src={v.thumbnail} className="w-full h-[190px] object-cover"/><div className="absolute inset-0 flex items-center justify-center"><div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center text-black">▶</div></div></div><div className="p-3 text-[14px] font-semibold">{v.title}</div></div>))}</div></div>}

      </div>
    </div>
  )
}
