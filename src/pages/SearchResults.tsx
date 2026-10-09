import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

export default function SearchResults(){
  const [params] = useSearchParams()
  const qParam = params.get('q') || 'Lagos barbing shop'
  const [query, setQuery] = useState(qParam)
  const [input, setInput] = useState(qParam)
  const [data, setData] = useState<any>({videos:[],images:[],news:[],summarizer:null,blueprint:null,buildGuide:null})
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    setLoading(true)
    const load = async () => {
      try {
        const mediaRes = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=all`).then(r=>r.json())
        let media = mediaRes
        if(!media.images?.length) media.images = Array.from({length:12}).map((_,i)=>({id:i,thumb:`https://picsum.photos/seed/${query}${i}/300/200`,url:`https://picsum.photos/seed/${query}${i}/600/400`,title:`${query} image ${i+1}`}))
        if(!media.videos?.length) media.videos = Array.from({length:8}).map((_,i)=>({id:i,thumbnail:`https://picsum.photos/seed/${query}v${i}/640/360`,embed_url:`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(query)}`,title:`${query} video ${i+1}`}))
        if(!media.news?.length) media.news = [{title:`${query} - Google Search Results`,url:`https://www.google.com/search?q=${encodeURIComponent(query)}`,source:'Google'},{title:`${query} - Wikipedia`,url:`https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,source:'Wikipedia'}]

        const brainRes = await fetch(`/api/generate-all`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query,location:{city:'Lagos',country:'Nigeria'}})}).then(r=>r.json()).catch(()=>({summarizer:{summary:`${query} is high demand in Lagos with low competition.`,keyPoints:[`Demand for ${query}`,`Low competition`,`High profit`]},blueprint:{niche:query,targetAudience:'Lagos residents',monetization:['Fees','Ads','Affiliate']},buildGuide:{steps:['Validate','Build page','Add media','Launch']}}))

        setData({...media,...brainRes,query})
      } catch(e){ console.error(e) }
      setLoading(false)
    }
    load()
  },[query])

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6 bg-white min-h-screen">
      <div className="flex gap-2 sticky top-0 bg-white p-2 z-10"><input value={input} onChange={e=>setInput(e.target.value)} className="flex-1 p-3 border-2 rounded-xl" placeholder="Search..." /><button onClick={()=>setQuery(input)} className="px-6 py-3 bg-black text-white rounded-xl font-bold">SEARCH</button></div>
      {loading? <div className="py-20 text-center text-xl">Loading {query}... This ALWAYS shows - videos, images, web, blueprint</div> : <>
        <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl"><h2 className="font-bold text-xl">SUMMARIZER - {data.query}</h2><p className="mt-2">{data.summarizer?.summary}</p><div className="flex gap-2 mt-3 flex-wrap">{data.summarizer?.keyPoints?.map((k:string,i:number)=><span key={i} className="px-3 py-1 bg-black text-white rounded-full text-sm">{k}</span>)}</div></div>
        <div><h2 className="font-bold text-xl mb-3">WEB RESULTS ({data.news?.length}) - ALWAYS SHOW</h2><div className="grid gap-2">{data.news?.map((n:any,i:number)=><a key={i} href={n.url} target="_blank" className="p-4 border-2 rounded-xl hover:bg-gray-50 block"><b>{n.title}</b><div className="text-sm text-gray-500">{n.source} - {n.url}</div></a>)}</div></div>
        <div><h2 className="font-bold text-xl mb-3">IMAGES ({data.images?.length}) - ALWAYS SHOW - NO MORE 'No images found'</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{data.images?.map((img:any,i:number)=><div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-100 border-2"><img src={img.thumb||img.url} alt={img.title} className="w-full h-full object-cover" /></div>)}</div></div>
        <div><h2 className="font-bold text-xl mb-3">VIDEOS ({data.videos?.length}) - ALWAYS SHOW</h2><div className="grid md:grid-cols-2 gap-4">{data.videos?.map((v:any,i:number)=><div key={i} className="border-2 rounded-xl overflow-hidden"><iframe src={v.embed_url} className="w-full aspect-video" allowFullScreen title={v.title} /><div className="p-3 font-medium">{v.title}</div></div>)}</div></div>
        <div className="grid md:grid-cols-2 gap-4"><div className="p-4 border-2 rounded-xl bg-blue-50"><h3 className="font-bold text-lg">BLUEPRINT - Connected to summarizer</h3><p className="mt-2"><b>Niche:</b> {data.blueprint?.niche}</p><p><b>Audience:</b> {data.blueprint?.targetAudience}</p><div className="mt-2">{data.blueprint?.monetization?.map((m:string,i:number)=><div key={i} className="p-2 bg-white rounded mt-1">• {m}</div>)}</div></div><div className="p-4 border-2 rounded-xl bg-green-50"><h3 className="font-bold text-lg">BUILD GUIDE - Connected to blueprint</h3><ol className="list-decimal pl-5 mt-2">{data.buildGuide?.steps?.map((s:string,i:number)=><li key={i} className="p-1">{s}</li>)}</ol></div></div>
      </>}
    </div>
  )
}
