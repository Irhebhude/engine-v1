/**
 * AI Provider Layer — calls the secure Cloudflare Function only.
 * Never calls Groq or any AI provider directly from the browser.
 */

const AI_ENDPOINT = "/api/groq";
const TIMEOUT_MS = 30_000;

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Build mode-appropriate system messages so different search modes
 * actually behave differently at the AI layer.
 */
function buildSystemMessages(context: string, mode?: string): AIMessage[] {
  const base = context || "You are SEARCH-POI Engine v1, a reasoning search assistant. Provide direct, factual answers.";
  const messages: AIMessage[] = [{ role: "system", content: base }];

  if (mode === "deep_research") {
    messages.push({
      role: "system",
      content: "DEEP RESEARCH MODE: Produce a comprehensive, academic-quality report with executive summary, in-depth analysis, key evidence, multiple perspectives, and conclusions. Minimum 800 words for complex topics.",
    });
  } else if (mode === "code") {
    messages.push({
      role: "system",
      content: "CODE MODE: Provide working, production-ready code examples with explanations, error handling, and architecture decisions. Use syntax highlighting and language tags.",
    });
  } else if (mode === "academic") {
    messages.push({
      role: "system",
      content: "ACADEMIC MODE: Use rigorous academic methodology. Distinguish proven facts, strong evidence, and hypotheses. Reference established theories. Use scholarly tone.",
    });
  } else if (mode === "business") {
    messages.push({
      role: "system",
      content: "BUSINESS MODE: Provide actionable market intelligence with financial data, trends, competitive analysis. Use frameworks like SWOT, Porter's Five Forces where applicable.",
    });
  }

  return messages;
}

/**
 * Call the secure Cloudflare AI function with timeout and graceful failure.
 * This is the ONLY AI generation path. Search retrieval is handled separately
 * in search-api.ts — they must not be conflated.
 */
export async function getAIResponseWithFailover(
  prompt: string,
  context: string = "",
  mode?: string
): Promise<string> {
  const messages = [...buildSystemMessages(context, mode), { role: "user", content: prompt }];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, mode }),
      signal: controller.signal,
    });

    const data = await res.json();

    if (!res.ok) {
      const errMsg = typeof data.error === "string" ? data.error : "AI request failed.";
      throw new Error(errMsg);
    }

    const content =
      data?.choices?.[0]?.message?.content ||
      data?.content ||
      data?.response ||
      "";

    if (!content) {
      throw new Error("AI provider returned an empty response.");
    }

    return content;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("AI request timed out. Please try again.");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getAIResponse(prompt: string, context: string = "", mode?: string): Promise<string> {
  return getAIResponseWithFailover(prompt, context, mode);
}
