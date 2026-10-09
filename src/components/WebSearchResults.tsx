import { useEffect, useState } from "react"
export default function WebSearchResults({ query }: any) {
  const [items, setItems] = useState<any[]>([])
  useEffect(()=>{ if(!query) return; fetch(`/api/search?q=${encodeURIComponent(query)}&_t=${Date.now()}`).then(r=>r.json()).then(d=>setItems(d.webResults||d.data||[])).catch(()=>{}); },[query])
  return (
    <div className="bg-[#0a0a0a] border border-cyan-500/20 rounded-xl p-4 mt-4">
      <h3 className="text-cyan-400 font-bold mb-3">WEB RESULTS ({items.length}) - LIVE REAL</h3>
      <div className="space-y-3 max-h-[800px] overflow-y-auto">
        {items.map((r:any,i:number)=>(<div key={i} className="border-b border-white/10 pb-2"><a href={r.url} target="_blank" className="text-cyan-300 font-semibold block hover:underline">{r.title}</a><a href={r.url} target="_blank" className="text-xs text-green-400 break-all">{r.url}</a><p className="text-sm text-gray-300">{r.description}</p></div>))}
      </div>
    </div>
  )
}
