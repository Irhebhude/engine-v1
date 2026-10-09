import React, { useEffect, useState } from 'react'
export default function NewsResults({ query }: any) {
  const [q] = useState(query || new URLSearchParams(window.location.search).get('q')||'Google')
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading]=useState(true)
  useEffect(()=>{
    fetch(`/api/search?q=${encodeURIComponent(q)}`).then(r=>r.json()).then(j=>{
      if(j.news && j.news.length>0) setNews(j.news)
      else setNews([])
      setLoading(false)
    }).catch(()=>setLoading(false))
  },[q])
  if(loading) return <div className="bg-[#0a0f14] min-h-screen p-4"><div className="text-zinc-500 text-sm tracking-widest">📰 NEWS RESULTS - Loading real news...</div></div>
  return (
    <div className="w-full bg-[#0a0f14] min-h-screen p-4 pb-24 max-w-[480px] mx-auto">
      <div className="flex items-center gap-2 mb-6 text-zinc-400 text-sm tracking-[0.2em]"><span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center">📰</span> NEWS RESULTS - {news.length} real articles</div>
      <div className="space-y-6">
        {news.map((r:any,i:number)=>(
          <div key={i} className="group cursor-pointer border-b border-zinc-800/50 pb-5" onClick={()=>window.open(r.url,'_blank')}>
            <div className="flex items-center gap-2 text-[11px] text-zinc-500 mb-1.5">
              <img src={r.favicon} className="w-4 h-4 rounded-full bg-white" alt=""/>
              <span>{r.domain}</span><span>•</span><span className="text-cyan-400">{r.freshness||'2h ago'}</span>
              <span className="ml-auto text-[10px] bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-900">{r.ics||85}% ICS</span>
            </div>
            <div className="text-[15px] font-semibold text-white group-hover:text-cyan-400 leading-[1.3]">{r.title}</div>
            <p className="text-[13px] text-zinc-400 mt-1.5 leading-[1.45] line-clamp-2">{r.snippet||r.description}</p>
          </div>
        ))}
        {news.length===0 && <div className="text-zinc-500 text-sm">No news found for "{q}" - try different query</div>}
      </div>
    </div>
  )
}
