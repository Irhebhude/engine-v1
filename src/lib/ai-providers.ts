export interface AIProvider {
  id: string;
  name: string;
  endpoint: string;
  model: string;
  apiKeyEnv: string;
  getHeaders: (k: string) => Record<string, string>;
  parseResponse: (d: any) => string;
  isQuotaError: (s: number, b: string) => boolean;
}
const isQuota = (status: number, body: string) => {
  if ([429, 402, 403].includes(status)) return true;
  const b = body.toLowerCase();
  return ["quota","rate_limit","rate limit","insufficient","credits","exhausted","limit exceeded","model_not_found","too many requests"].some(k => b.includes(k));
};
export const providers: AIProvider[] = [
  { id: "groq_1", name: "Groq 1", endpoint: "/api/groq", model: "llama-3.1-8b-instant", apiKeyEnv: "GROQ_API_KEY", getHeaders: (k) => ({ "Content-Type": "application/json", "Authorization": `Bearer ${k}` }), parseResponse: (d) => d.choices?.[0]?.message?.content || "", isQuotaError: isQuota },
  { id: "groq_2", name: "Groq 2", endpoint: "/api/groq", model: "llama-3.1-8b-instant", apiKeyEnv: "GROQ_API_KEY_2", getHeaders: (k) => ({ "Content-Type": "application/json", "Authorization": `Bearer ${k}` }), parseResponse: (d) => d.choices?.[0]?.message?.content || "", isQuotaError: isQuota },
  { id: "groq_3", name: "Groq 3", endpoint: "/api/groq", model: "llama-3.1-8b-instant", apiKeyEnv: "GROQ_API_KEY_3", getHeaders: (k) => ({ "Content-Type": "application/json", "Authorization": `Bearer ${k}` }), parseResponse: (d) => d.choices?.[0]?.message?.content || "", isQuotaError: isQuota },
  { id: "openrouter_llama", name: "OpenRouter Llama", endpoint: "https://openrouter.ai/api/v1/chat/completions", model: "meta-llama/llama-3.1-8b-instruct:free", apiKeyEnv: "VITE_OPENROUTER_KEY", getHeaders: (k) => ({ "Content-Type": "application/json", "Authorization": `Bearer ${k}`, "HTTP-Referer": typeof window!== 'undefined'? window.location.origin : "", "X-Title": "SEARCH-POI" }), parseResponse: (d) => d.choices?.[0]?.message?.content || "", isQuotaError: isQuota },
  { id: "gemini_flash", name: "Gemini Flash", endpoint: "GEMINI", model: "gemini-1.5-flash", apiKeyEnv: "VITE_GEMINI_KEY", getHeaders: () => ({ "Content-Type": "application/json" }), parseResponse: (d) => d.candidates?.[0]?.content?.parts?.[0]?.text || "", isQuotaError: isQuota },
  { id: "together", name: "Together AI", endpoint: "https://api.together.xyz/v1/chat/completions", model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo", apiKeyEnv: "VITE_TOGETHER_KEY", getHeaders: (k) => ({ "Content-Type": "application/json", "Authorization": `Bearer ${k}` }), parseResponse: (d) => d.choices?.[0]?.message?.content || "", isQuotaError: isQuota },
  { id: "cohere", name: "Cohere", endpoint: "https://api.cohere.ai/v1/chat", model: "command-r-plus", apiKeyEnv: "VITE_COHERE_KEY", getHeaders: (k) => ({ "Content-Type": "application/json", "Authorization": `Bearer ${k}` }), parseResponse: (d) => d.text || "", isQuotaError: isQuota },
  { id: "hf", name: "HuggingFace", endpoint: "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct", model: "", apiKeyEnv: "VITE_HF_KEY", getHeaders: (k) => ({ "Content-Type": "application/json", "Authorization": `Bearer ${k}` }), parseResponse: (d) => d[0]?.generated_text || d.generated_text || "", isQuotaError: isQuota },
  { id: "deepinfra", name: "DeepInfra", endpoint: "https://api.deepinfra.com/v1/openai/chat/completions", model: "meta-llama/Meta-Llama-3.1-8B-Instruct", apiKeyEnv: "VITE_DEEPINFRA_KEY", getHeaders: (k) => ({ "Content-Type": "application/json", "Authorization": `Bearer ${k}` }), parseResponse: (d) => d.choices?.[0]?.message?.content || "", isQuotaError: isQuota },
  { id: "openrouter_gemma", name: "OpenRouter Gemma", endpoint: "https://openrouter.ai/api/v1/chat/completions", model: "google/gemma-2-9b-it:free", apiKeyEnv: "VITE_OPENROUTER_KEY", getHeaders: (k) => ({ "Content-Type": "application/json", "Authorization": `Bearer ${k}`, "HTTP-Referer": typeof window!== 'undefined'? window.location.origin : "", "X-Title": "SEARCH-POI" }), parseResponse: (d) => d.choices?.[0]?.message?.content || "", isQuotaError: isQuota },
];
function getFailed(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem('ai_failed_providers') || '{}'); } catch { return {}; }
}
function setFailed(id: string) {
  const f = getFailed(); f[id] = Date.now();
  localStorage.setItem('ai_failed_providers', JSON.stringify(f));
}
function isBanned(id: string): boolean {
  const f = getFailed();
  if (!f[id]) return false;
  if (Date.now() - f[id] > 60 * 60 * 1000) {
    delete f[id];
    localStorage.setItem('ai_failed_providers', JSON.stringify(f));
    return false;
  }
  return true;
}
async function callProvider(provider: AIProvider, messages: any[]): Promise<string> {
  const envKey = (import.meta as any).env?.[provider.apiKeyEnv] || "";
  if (!envKey &&!provider.id.startsWith("groq_")) throw new Error(`Missing key ${provider.apiKeyEnv}`);
  let url = provider.endpoint;
  let body: any;
  if (provider.id === "gemini_flash") {
    const prompt = messages.map((m: any) => m.content).join("\n");
    url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${envKey}`;
    body = { contents: [{ parts: [{ text: prompt }] }] };
  } else if (provider.id === "cohere") {
    body = { model: provider.model, message: messages[messages.length - 1]?.content, chat_history: [] };
  } else if (provider.id === "hf") {
    body = { inputs: messages[messages.length - 1]?.content, parameters: { max_new_tokens: 1024 } };
  } else {
    body = { model: provider.model, messages, temperature: 0.7, max_tokens: 1024 };
    if (provider.id.startsWith("groq_")) body.model = "llama-3.1-8b-instant";
  }
  const res = await fetch(url, { method: "POST", headers: provider.getHeaders(envKey), body: JSON.stringify(body) });
  const text = await res.text();
  let data: any; try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!res.ok) {
    if (provider.isQuotaError(res.status, text)) {
      const err: any = new Error(`QUOTA_EXHAUSTED:${provider.id}`);
      err.quota = true; throw err;
    }
    throw new Error(text.slice(0, 300));
  }
  const parsed = provider.parseResponse(data);
  if (!parsed) throw new Error("Empty response");
  return parsed;
}
export async function getAIResponseWithFailover(prompt: string, context: string = "", customMessages?: any[]): Promise<string> {
  const modes: any = {
    default: "You are SEARCH-POI ENGINE v1.",
    deep_research: "You are deep research mode.",
    code: "You are coding expert.",
    academic: "You are academic mode.",
    business: "You are business intelligence mode."
  };
  const mode = (localStorage.getItem('search_mode') as any) || 'default';
  const sys = modes[mode] || modes.default;
  const messages = customMessages || [
    { role: "system", content: context? `${sys}\nContext: ${context}` : sys },
    { role: "user", content: prompt }
  ];
  const available = providers.filter(p =>!isBanned(p.id));
  if (available.length === 0) {
    localStorage.removeItem('ai_failed_providers');
    throw new Error("All 10 providers exhausted. Wait 60 mins.");
  }
  let lastError = "";
  for (const provider of available) {
    for (const delay of [0, 1000, 2000]) {
      if (delay) await new Promise(r => setTimeout(r, delay));
      try {
        console.log(`[AI] Trying ${provider.name}`);
        const result = await callProvider(provider, messages);
        localStorage.setItem('active_ai_provider', provider.id);
        return result;
      } catch (e: any) {
        lastError = e.message;
        if (e.message.includes("QUOTA_EXHAUSTED") || e.quota) {
          setFailed(provider.id);
          break;
        }
      }
    }
  }
  throw new Error(`All failed. Last: ${lastError}`);
}
export const getAIResponse = getAIResponseWithFailover;
export const generateAIResponse = getAIResponseWithFailover;
export function resetFailedProviders() {
  localStorage.removeItem('ai_failed_providers');
  localStorage.removeItem('active_ai_provider');
}
export function getProviderStatus() {
  const failed = getFailed();
  const active = localStorage.getItem('active_ai_provider');
  return providers.map(p => ({
   ...p,
    status: failed[p.id]? (isBanned(p.id)? 'failed' : 'standby') : (p.id === active? 'active' : 'standby'),
    failedAt: failed[p.id] || null
  }));
}
