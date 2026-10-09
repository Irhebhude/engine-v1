'use client';
import { useEffect, useState } from 'react';
export default function AIAnswer({ query }: { query: string }) {
  const [ans, setAns] = useState('');
  const [load, setLoad] = useState(true);
  useEffect(() => {
    if(!query) return;
    setLoad(true);
    fetch('/api/ai-answer?q='+encodeURIComponent(query))
     .then(r=>r.json())
     .then(d=>{ setAns(d.answer); setLoad(false); })
     .catch(()=>{ setAns('Failed to load'); setLoad(false); });
  }, [query]);
  if(load) return <div className="p-4 rounded-xl border border-white/10 animate-pulse">GROQ AI is thinking...</div>;
  return (
    <div className="p-5 rounded-xl bg-[#0f172a] border border-cyan-500/20">
      <div className="text-xs text-cyan-400 mb-2 font-bold">🧠 AI ANSWER • GROQ • Instant</div>
      <div className="text-sm whitespace-pre-wrap leading-relaxed text-white">{ans}</div>
    </div>
  );
}
