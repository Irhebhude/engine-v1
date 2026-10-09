'use client';
import { useEffect, useState } from 'react';

export default function AIAnswer({ query }: { query: string }) {
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    fetch('/api/ai-answer?q=' + encodeURIComponent(query))
      .then(r => r.json())
      .then(data => {
        setAnswer(data.answer || '');
        setLoading(false);
      })
      .catch(() => {
        setAnswer('Could not load AI answer. Try again.');
        setLoading(false);
      });
  }, [query]);

  if (loading) return <div className="glass p-4 rounded-xl animate-pulse">AI is thinking...</div>;
  if (!answer) return null;

  return (
    <div className="glass p-5 rounded-xl border border-cyan-500/20">
      <div className="flex items-center gap-2 mb-3">
        <span className="bg-[#00F0FF] text-black text-xs px-2 py-1 rounded font-bold">INTELLIGENT REASONING</span>
        <span className="text-[#00F0FF] text-xs">AI Answer</span>
      </div>
      <div className="prose prose-invert text-sm whitespace-pre-wrap leading-relaxed">
        {answer}
      </div>
    </div>
  );
}
