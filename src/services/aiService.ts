const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;
export async function getAIResponse(prompt: string) {
  if (!GROQ_KEY) throw new Error("Missing GROQ key");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_KEY}` },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are SEARCH-POI v1 reasoning search engine" },
        { role: "user", content: prompt }
      ]
    })
  });
  const data = await res.json();
  return data.choices[0]?.message?.content || "No response";
}
