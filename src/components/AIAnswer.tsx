import { useEffect, useState } from "react"
export default function AIAnswer({ query }: { query: string }) {
  const [answer, setAnswer] = useState("")
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (!query || query.trim() === "") return
    setLoading(true)
    fetch(`/api/ai?q=${encodeURIComponent(query.trim())}&_t=${Date.now()}`)
     .then(r=>r.json())
     .then(d=> setAnswer(d.answer || d.content || "No answer"))
     .catch(()=> setAnswer("Error fetching AI"))
     .finally(()=> setLoading(false))
  }, [query])
  if (loading) return <div className="p-4 text-cyan-400">POI Engine v1 thinking... ICS v3 ACTIVE</div>
  if (!answer) return null
  return (
    <div className="bg-[#111] border border-cyan-500/30 rounded-xl p-4 mt-4 whitespace-pre-wrap text-gray-100">
      <div className="text-cyan-400 font-bold text-sm mb-2">POI ENGINE v1 - "{query}" - Truth Engine</div>
      <div className="text-[15px] leading-relaxed">{answer}</div>
      <div className="text-[10px] text-gray-500 mt-3">ICS v3 ACTIVE - Verdict High - Owner: Prosper Ozoya Irhebhude - Built From Scratch</div>
    </div>
  )
}
