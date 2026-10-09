import React from 'react'
export default function WebResultsExact({ data }: any) {
  const items = data?.web || [];
  return (
    <div className="bg-black text-white">
      <div className="flex gap-2 text-xs text-zinc-400 mb-4">🌐 WEB RESULTS</div>
      {items.map((r:any,i:number)=>(
        <div key={i} className="mb-6">
          <div className="flex gap-2 text-xs text-zinc-500"><img src={r.favicon} className="w-4 h-4 rounded-full"/>{r.breadcrumb}</div>
          <div className="text-cyan-400 font-bold mt-1">{r.title}</div>
          <div className="text-zinc-400 text-sm mt-1">{r.snippet}</div>
          <div className="text-cyan-700 text-xs mt-2">≡ AI Summary</div>
        </div>
      ))}
    </div>
  )
}
