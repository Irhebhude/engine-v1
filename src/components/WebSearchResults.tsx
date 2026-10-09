import React from 'react'
export default function WebResults({ results, query }: any) {
  const items = results?.web || results || [];
  return (
    <div className="w-full bg-black min-h-screen p-4">
      <div className="flex items-center gap-2 mb-6 text-gray-400 text-sm tracking-widest">
        <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center">🌐</span> WEB RESULTS
      </div>
      <div className="space-y-6">
        {items.map((r:any,i:number)=>(
          <div key={i} className="group cursor-pointer">
            <div className="flex items-center gap-2 text-[12px] text-gray-500 mb-1">
              <img src={r.favicon||`https://www.google.com/s2/favicons?domain=${r.domain||'example.com'}&sz=16`} className="w-4 h-4 rounded-full bg-white" alt=""/>
              <span className="truncate">{r.displayUrl||r.breadcrumb||`${r.domain} > ${r.url?.split('/')[3]||''}`}</span>
              <span className="ml-auto text-[10px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded">{r.ics||85}% ICS</span>
            </div>
            <a href={r.url} target="_blank" className="text-[16px] font-semibold text-cyan-400 group-hover:underline line-clamp-2 leading-tight block">{r.title}</a>
            <p className="text-[13px] text-gray-400 mt-1 line-clamp-2 leading-snug">{r.snippet}</p>
            <div className="flex items-center gap-1.5 mt-2 text-[12px] text-cyan-700/80">
              <span className="w-4 h-4 border border-cyan-800 rounded flex items-center justify-center">≡</span> AI Summary
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
