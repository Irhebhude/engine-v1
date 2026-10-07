export async function generateAIResponse(prompt: string, context: string = "") {
  const fullPrompt = context? `${context}\n\nUser query: ${prompt}` : prompt;
  const res = await fetch("/api/groq", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: fullPrompt,
      messages: [
        { role: "system", content: "You are SEARCH-POI ENGINE v1" },
        { role: "user", content: fullPrompt }
      ]
    })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error: ${err}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || JSON.stringify(data);
}
export const getAIResponse = generateAIResponse;
export const aiService = { generateAIResponse, getAIResponse };
export default { generateAIResponse, getAIResponse };
