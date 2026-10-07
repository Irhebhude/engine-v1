export async function generateAIResponse(prompt: string, context: string = "") {
  const fullPrompt = context? `${context}\n\nUser query: ${prompt}` : prompt;

  const res = await fetch("/api/groq", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: fullPrompt,
      messages: [
        { role: "system", content: "You are SEARCH-POI ENGINE v1 - intelligent reasoning for point-of-interest and business intelligence." },
        { role: "user", content: fullPrompt }
      ]
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error: ${err}`);
  }

  const data = await res.json();
  // Groq returns OpenAI format
  return data.choices?.[0]?.message?.content || data.choices?.[0]?.text || JSON.stringify(data);
}

// Keep old exports for compatibility if other files import them
export const aiService = { generateAIResponse };
export default { generateAIResponse };
