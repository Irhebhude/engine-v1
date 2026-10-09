import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
export default function SearchResults(){
  const [params]=useSearchParams()
  const qParam=params.get('q')||'FX rate USD/NGN'
  const [query,setQuery]=useState(qParam)
  const [input,setInput]=useState(qParam)
  const [tab,setTab]=useState<'all'|'web'|'images'|'videos'|'news'>('all')
  const [webData,setWebData]=useState<any>(null)
  const [vidData,setVidData]=useState<any>(null)
  const [imgData,setImgData]=useState<any>(null)
  const [newsData,setNewsData]=useState<any>(null)
  const [loadingWeb,setLoadingWeb]=useState(true)
  const [playing,setPlaying]=useState<string|null>(null)

  useEffect(()=>{
    setLoadingWeb(true); setWebData(null); setVidData(null); setImgData(null); setNewsData(null)
    // FAST: Web first - opens in 0.5s like Google
    fetch(`/api/search?q=${encodeURIComponent(query)}`).then(r=>r.json()).then(j=>{ setWebData(j); setLoadingWeb(false); }).catch(()=>setLoadingWeb(false))
    // LAZY: Videos, Images, News load after - don't block page open
    fetch(`/api/videos?q=${encodeURIComponent(query)}`).then(r=>r.json()).then(j=>setVidData(j)).catch(()=>{})
    fetch(`/api/images?q=${encodeURIComponent(query)}`).then(r=>r.json()).then(j=>setImgData(j)).catch(()=>{})
    fetch(`/api/news?q=${encodeURIComponent(query)}`).then(r=>r.json()).then(j=>setNewsData(j)).catch(()=>{})
  },[query])

  return (
    <div className="min-h-screen bg-[#0a0f14] text-zinc-200">
      <div className="max-w-[600px] mx-auto p-4 pb-24">
        <div className="flex gap-2 mb-4"><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter') setQuery(input)}} className="flex-1 bg-[#121a21] border border-zinc-700 rounded-full px-4 py-2.5 text-sm outline-none" placeholder="Search..."/><button onClick={()=>setQuery(input)} className="bg-cyan-500 text-black px-5 rounded-full font-semibold">Go</button></div>
        <div className="flex gap-2 mb-4 overflow-x-auto">{(['all','web','videos','images','news'] as const).map(t=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-1.5 rounded-full text-sm border shrink-0 ${tab===t?'bg-cyan-500 text-black border-cyan-500':'bg-[#121a21] border-zinc-700 text-zinc-400'}`}>{t.toUpperCase()}</button>)}</div>

        {loadingWeb? (
          <div className="space-y-4 mt-6">
            <div className="h-20 bg-[#121a21] rounded-2xl animate-pulse"/>
            <div className="h-20 bg-[#121a21] rounded-2xl animate-pulse"/>
            <div className="h-20 bg-[#121a21] rounded-2xl animate-pulse"/>
            <div className="text-zinc-600 text-sm text-center mt-4">Opening results for "{query}"... (fast mode)</div>
          </div>
        ) : webData && (
          <>
            {webData.summarizer && (tab==='all'||tab==='web') && (
              <div className="mb-6 p-4 bg-[#121a21] border border-zinc-800 rounded-2xl">
                <div className="flex items-center gap-2 text-[12px] tracking-widest text-cyan-400 mb-2">🧠 AI ANSWER • Instant</div>
                <div className="text-[15px] leading-[1.6]"><b className="text-white">{webData.summarizer.query}</b> {webData.summarizer.definition}</div>
                <div className="mt-3 text-[11px] text-zinc-600">{webData.summarizer.engineProcess}</div>
              </div>
            )}

            {(tab==='all'||tab==='web') && (
              <div className="mb-8">
                <div className="text-zinc-500 text-[12px] tracking-[0.2em] mb-4">🌐 WEB RESULTS - {webData.web?.length||0} • Instant</div>
                <div className="space-y-5">{webData.web?.map((r:any,i:number)=><div key={i} onClick={()=>window.open(r.url,'_blank')} className="cursor-pointer"><div className="flex gap-2 text-[11px] text-zinc-500"><img src={r.favicon} className="w-4 h-4 rounded-full bg-white" onError={(e:any)=>e.target.style.display='none'}/>{r.displayUrl}</div><div className="text-cyan-400 font-semibold mt-1">{r.title}</div><div className="text-zinc-400 text-[13px] mt-1">{r.snippet}</div></div>)}</div>
              </div>
            )}

            {(tab==='all'||tab==='videos') && (
              <div className="mb-8">
                <div className="text-zinc-500 text-[12px] tracking-[0.2em] mb-4">🎬 VIDEOS - {vidData? `${vidData.videos_total} real • Loaded` : 'Loading...'}</div>
                {!vidData? <div className="h-32 bg-[#121a21] rounded-xl animate-pulse"/> : (
                  <div className="space-y-4">{vidData.videos?.slice(0,12).map((v:any,i:number)=><div key={i} className="rounded-xl overflow-hidden bg-[#121a21] border border-zinc-800">{playing===v.videoId? <iframe src={v.embed_url} className="w-full h-[200px]" allowFullScreen/> : <div className="relative cursor-pointer" onClick={()=>setPlaying(v.videoId)}><img src={v.thumbnail} className="w-full h-[190px] object-cover" loading="lazy"/><div className="absolute inset-0 flex items-center justify-center"><div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center text-black">▶</div></div></div>}<div className="p-3 text-[14px] font-semibold">{v.title}</div></div>)}</div>
                )}
              </div>
            )}

            {(tab==='all'||tab==='images') && (
              <div className="mb-8">
                <div className="text-zinc-500 text-[12px] tracking-[0.2em] mb-4">🖼️ IMAGES - {imgData? `${imgData.images_total} real` : 'Loading...'}</div>
                {!imgData? <div className="grid grid-cols-2 gap-2"><div className="h-32 bg-[#121a21] rounded-xl animate-pulse"/><div className="h-32 bg-[#121a21] rounded-xl animate-pulse"/></div> : <div className="grid grid-cols-2 gap-2">{imgData.images?.slice(0,12).map((im:any,i:number)=><div key={i} className="rounded-xl overflow-hidden bg-[#121a21] border border-zinc-800"><img src={im.thumb||im.url} className="w-full h-[130px] object-cover" loading="lazy"/></div>)}</div>}
              </div>
            )}

            {(tab==='all'||tab==='news') && (
              <div className="mb-8">
                <div className="text-zinc-500 text-[12px] tracking-[0.2em] mb-4">📰 NEWS - {newsData? `${newsData.news_total} real` : 'Loading...'}</div>
                {!newsData? <div className="h-20 bg-[#121a21] rounded-xl animate-pulse"/> : <div className="space-y-4">{newsData.news?.map((n:any,i:number)=><div key={i} onClick={()=>window.open(n.url,'_blank')} className="cursor-pointer border-b border-zinc-800/50 pb-3"><div className="text-[11px] text-zinc-500">{n.domain}</div><div className="font-semibold mt-1">{n.title}</div></div>)}</div>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
