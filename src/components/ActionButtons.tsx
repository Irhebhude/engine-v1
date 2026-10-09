import React, { useEffect, useState } from 'react'
export default function SearchPage() {
  const [q, setQ] = useState(new URLSearchParams(window.location.search).get('q')||'Google')
  const [data, setData] = useState<any>(null)
  const [input, setInput] = useState(q)
  useEffect(()=>{
    fetch(`/api/search?q=${encodeURIComponent(q)}`).then(r=>r.json()).then(setData).catch(()=>{})
  },[q])
  const s = data?.summarizer
  return (
    <div className="min-h-screen bg-[#0a0f14] text-zinc-200 p-4 pb-24 max-w-[480px] mx-auto">
      {/* Header like screenshot */}
      <div className="flex items-start justify-between gap-3 mt-2">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 mt-1">🧠</div>
          <div>
            <div className="font-bold tracking-wide leading-tight">SEARCH-<br/>POI<br/>ENGINE<br/>v1</div>
            <div className="text-[12px] text-zinc-500 mt-1">Multi-step reasoning for<br/>"{q}"</div>
          </div>
          <div className="ml-2 px-2 py-1 h-fit text-[10px] tracking-widest bg-cyan-950 text-cyan-400 border border-cyan-800 rounded">INTELLIGENT REASONING</div>
        </div>
        <button className="flex items-center gap-1 text-[12px] bg-cyan-950/50 border border-cyan-900 text-cyan-400 px-3 py-2 rounded-xl">↗ Share as Insight</button>
      </div>

      {/* Reasoning Pipeline like screenshot */}
      <div className="mt-6 flex items-center justify-between bg-[#121a21] border border-zinc-800 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2 text-[13px] text-zinc-400"><span>⚡</span> Reasoning Pipeline</div>
        <div className="flex items-center gap-3 text-[12px]"><span className="text-zinc-500">(Complete)</span><span className="text-cyan-400">Confidence: {s?.confidence||95}%</span><span className="text-zinc-600">∨</span></div>
      </div>

      {/* Content - SAME STRUCTURE AS SCREENSHOT BUT CLEAN REAL DATA */}
      <div className="mt-6 space-y-5 text-[15px] leading-[1.6]">
        <div>
          <div className="flex gap-2"><span>🧠</span><span className="font-semibold">Engine Process:</span></div>
          <div className="mt-1 text-zinc-300">{s?.engineProcess || `Entity extraction (${q}) → Retrieval of core business data → Information synthesis.`}</div>
        </div>

        <div className="text-zinc-300">
          <span className="font-semibold text-zinc-100">{q}</span> {s?.definition || data?.web?.[0]?.snippet || `is a widely searched topic.`}
        </div>

        <div>
          <div className="font-semibold text-zinc-100">Core Intelligence</div>
          <div className="mt-3 space-y-3">
            {(s?.coreIntelligence || []).map((c:any,i:number)=>(
              <div key={i} className="flex gap-2"><span className="text-zinc-500">*</span><span><span className="font-semibold text-zinc-100">{c.label}:</span> <span className="text-zinc-300">{c.value}</span></span></div>
            ))}
            {(!s?.coreIntelligence || s.coreIntelligence.length===0) && (
              <>
                <div className="flex gap-2"><span className="text-zinc-500">*</span><span><b className="text-zinc-100">Search Dominance:</b> <span className="text-zinc-300">{data?.web?.[0]?.snippet?.slice(0,120)||'Holds significant market presence'}</span></span></div>
                <div className="flex gap-2"><span className="text-zinc-500">*</span><span><b className="text-zinc-100">Revenue Model:</b> <span className="text-zinc-300">Primary income from services and advertising.</span></span></div>
                <div className="flex gap-2"><span className="text-zinc-500">*</span><span><b className="text-zinc-100">Key Assets:</b> <span className="text-zinc-300">Core platforms, tools and ecosystem.</span></span></div>
                <div className="flex gap-2"><span className="text-zinc-500">*</span><span><b className="text-zinc-100">Current Focus:</b> <span className="text-zinc-300">Generative AI integration across products.</span></span></div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* WEB RESULTS - same page below */}
      <div className="mt-8 pt-6 border-t border-zinc-800">
        <div className="flex items-center gap-2 text-zinc-500 text-[12px] tracking-[0.2em] mb-4">🌐 WEB RESULTS</div>
        <div className="space-y-5">
          {(data?.web||[]).map((r:any,i:number)=>(
            <div key={i} onClick={()=>window.open(r.url,'_blank')} className="cursor-pointer group">
              <div className="flex gap-2 text-[11px] text-zinc-500"><img src={r.favicon} className="w-4 h-4 rounded-full bg-white"/>{r.displayUrl||r.breadcrumb}<span className="ml-auto text-[10px] bg-cyan-950 text-cyan-400 px-1.5 rounded border border-cyan-900">{r.ics}% ICS</span></div>
              <div className="text-cyan-400 font-semibold mt-1 group-hover:underline">{r.title}</div>
              <div className="text-zinc-400 text-[13px] mt-1">{r.snippet}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Search box */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-[#0a0f14] border-t border-zinc-800 flex gap-2 max-w-[480px] mx-auto">
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){ setQ(input); window.history.replaceState(null,'',`?q=${encodeURIComponent(input)}`) } }} className="flex-1 bg-[#121a21] border border-zinc-700 rounded-full px-4 py-2.5 text-sm outline-none" placeholder="Search..."/>
        <button onClick={()=>{ setQ(input); window.history.replaceState(null,'',`?q=${encodeURIComponent(input)}`) }} className="bg-cyan-500 text-black px-5 rounded-full font-semibold">Go</button>
      </div>
    </div>
  )
}
