import { createContext, useContext, useState, useEffect } from 'react'
const SearchContext = createContext<any>(null)
export function SearchProvider({ children }: any) {
  const [query, setQuery] = useState('Lagos barbing shop')
  const [location] = useState({ city: 'Lagos', country: 'Nigeria', lat: 6.5244, lng: 3.3792 })
  const [media, setMedia] = useState({ videos: [], images: [], news: [] })
  const [brain, setBrain] = useState<any>({ summarizer: {summary:''}, blueprint: {monetization:[]}, buildGuide: {steps:[]} })
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setLoading(true)
    fetch(`/api/search?q=${encodeURIComponent(query)}&type=all`).then(r=>r.json()).then(m=>{ setMedia(m); return fetch(`/api/generate-all`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query,location})}).then(r=>r.json()) }).then(b=>{ setBrain(b); setLoading(false) }).catch(()=>setLoading(false))
  }, [query])
  return <SearchContext.Provider value={{ query, setQuery, location, media, brain, loading }}>{children}</SearchContext.Provider>
}
export const useSearch = () => useContext(SearchContext)
