import { getAIResponse } from "@/services/aiService";

export type SearchMode = "default" | "deep_research" | "code" | "academic" | "business";

export interface WebResult {
  url: string;
  title: string;
  description: string;
  markdown?: string;
}

export async function webSearch(query: string, limit = 10, scrape = true): Promise<WebResult[]> {
  // Free mode: no Supabase web search (needs credits), return empty to skip
  // You can add free Serper/Brave search later
  return [];
}

export async function streamSearch({
  query,
  mode = "default",
  context = [],
  onDelta,
  onDone,
}: {
  query: string;
  mode?: SearchMode;
  context?: string[];
  onDelta: (text: string) => void;
  onDone: () => void;
}) {
  try {
    const contextStr = context.length ? `\nContext:\n${context.join("\n")}\n` : "";
    const fullPrompt = `${contextStr}\nUser query (${mode}): ${query}\n\nYou are SEARCH-POI v1 reasoning search engine. Answer helpfully.`;

    const answer = await getAIResponse(fullPrompt);

    // Simulate streaming for UI
    const words = answer.split(/(\s+)/);
    for (const w of words) {
      onDelta(w);
      await new Promise(r => setTimeout(r, 15));
    }
    onDone();
  } catch (e: any) {
    onDelta(`Error: ${e.message}. Check VITE_GROQ_API_KEY is set in Cloudflare.`);
    onDone();
  }
}

// Keep these for compatibility
export async function summarizeUrl(url: string): Promise<string> { return ""; }
export async function imageSearch(q: string) { return []; }
export async function videoSearch(q: string) { return []; }
export async function newsSearch(q: string) { return []; }
