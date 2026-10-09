import { useState } from 'react'
import { useSearch } from '../lib/searchContext'
export function MediaGrid(){
  const { media, brain, loading, query, setQuery } = useSearch() as any
  const [input, setInput] = useState(query)
  return (
    <div className="p-4 max-w-6xl mx-auto space-y-8">
      <div className="flex gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Search anything..." className="flex-1 p-3 border rounded-xl" />
        <button onClick={()=>setQuery(input)} className="px-6 py-3 bg-black text-white rounded-xl">Search</button>
      </div>
      {loading && <div className="text-center py-10">Loading videos, images, web results for {query}...</div>}
      {!loading && <>
        <div><h2 className="text-2xl font-bold mb-2">Summary - {query}</h2><p className="p-4 bg-gray-50 rounded-xl">{brain?.summarizer?.summary}</p><div className="flex gap-2 mt-2 flex-wrap">{brain?.summarizer?.keyPoints?.map((k:string,i:number)=><span key={i} className="text-xs px-2 py-1 bg-black text-white rounded-full">{k}</span>)}</div></div>
        <div><h2 className="text-xl font-bold mb-3">Web Results ({media.news?.length})</h2><div className="grid gap-2">{media.news?.map((n:any,i:number)=><a key={i} href={n.url} target="_blank" className="p-3 border rounded-lg hover:bg-gray-50 block"><b>{n.title}</b><br/><span className="text-xs text-gray-500">{n.source}</span></a>)}</div></div>
        <div><h2 className="text-xl font-bold mb-3">Images ({media.images?.length}) - Always Showing</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{media.images?.map((img:any,i:number)=><div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-100"><img src={img.thumb||img.url} alt={img.title} className="w-full h-full object-cover" loading="lazy" /></div>)}</div></div>
        <div><h2 className="text-xl font-bold mb-3">Videos ({media.videos?.length}) - Always Showing</h2><div className="grid md:grid-cols-2 gap-4">{media.videos?.map((v:any,i:number)=><div key={i} className="border rounded-xl overflow-hidden"><iframe src={v.embed_url} className="w-full aspect-video" allowFullScreen /><div className="p-2 text-sm">{v.title}</div></div>)}</div></div>
        <div className="grid md:grid-cols-2 gap-4"><div className="p-4 border rounded-xl"><h3 className="font-bold mb-2">Blueprint</h3><p>Niche: {brain?.blueprint?.niche}</p><p>Audience: {brain?.blueprint?.targetAudience}</p><ul className="mt-2">{brain?.blueprint?.monetization?.map((m:string,i:number)=><li key={i}>• {m}</li>)}</ul></div><div className="p-4 border rounded-xl"><h3 className="font-bold mb-2">Build Guide</h3><ol className="list-decimal pl-5">{brain?.buildGuide?.steps?.map((s:string,i:number)=><li key={i}>{s}</li>)}</ol></div></div>
      </>}
    </div>
  )
}
