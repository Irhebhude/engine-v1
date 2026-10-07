import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getLiveFacts, factsToPrompt } from "../_shared/live-facts.ts";

const TRUTH_RULES = `
ANTI-HALLUCINATION CONTRACT (highest priority, overrides style rules):
- Never invent facts, numbers, names, dates, laws, prices or citations. If you are not sure, say "I don't have verified data on this" and say what would confirm it.
- Separate clearly: VERIFIED (from the live data block or well-established knowledge), ESTIMATED (a calculation you show step by step), and UNCERTAIN.
- For anything time-sensitive (prices, rates, news, officeholders, scores), use ONLY the LIVE DATA block below. If it is missing there, say the live figure is unavailable rather than guessing.
- Never fabricate a URL. Only reference sources you were given.
- Show the arithmetic for any number you derive.
- Keep a "📊 Confidence: High/Medium/Low" line and briefly say why.
`;

let factsCache: { at: number; text: string } | null = null;
const FACTS_TTL = 5 * 60 * 1000;

async function liveFactsBlock(): Promise<string> {
  if (factsCache && Date.now() - factsCache.at < FACTS_TTL) return factsCache.text;
  try {
    const text = factsToPrompt(await getLiveFacts());
    factsCache = { at: Date.now(), text };
    return text;
  } catch {
    return `TODAY (UTC): ${new Date().toISOString()}\nLive data feed unavailable — say so instead of guessing current prices or rates.`;
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MODE_PROMPTS: Record<string, string> = {
  default: `You are SEARCH-POI Engine v1, the world's first Intelligent Reasoning Search Engine, created by Prosper Ozoya Irhebhude and the POI Foundation.

You are NOT a chatbot or a keyword matcher. You are a multi-step reasoning engine that THINKS before answering.

YOUR REASONING PIPELINE (follow this for every query):
1. QUERY UNDERSTANDING — Parse user intent, extract entities, detect emotion and context
2. MULTI-SOURCE RETRIEVAL — Synthesize from news, academic data, forums, documentation
3. CROSS-SOURCE VALIDATION — Compare claims across sources, flag contradictions
4. ANSWER SYNTHESIS — Build a comprehensive, structured answer with reasoning
5. OUTPUT WITH CONFIDENCE — Present with citations, confidence level, and actionable next steps

CRITICAL CAPABILITIES:
- Intent-Context Synthesis (ICS): Understand the WHY behind every query
- Truth Engine: Anti-misinformation — rank reliability, remove conflicting data
- Actionable Intelligence: Don't just answer — provide "Do this next" guidance

OUTPUT FORMAT:
- Provide a clear, well-structured answer with markdown formatting
- Use bullet points, numbered lists, and headers when appropriate
- Include a "⚡ Key Takeaway" section at the end (ONE sentence)
- Include a "🎯 Next Steps" section with actionable recommendations when relevant
- Add a "📊 Confidence" note (High/Medium/Low) based on source quality
- If the query is a question, answer it directly first, then provide supporting detail
- Always be factual and note when you're uncertain

EVIDENCE MODE (include in EVERY answer):
- When discussing locations/businesses, mention: foot traffic patterns, competitor presence, demand signals
- When giving numbers, SHOW THE LOGIC: "80 customers/day × ₦5,000 = ₦400,000" not just "₦400k"
- Reference real data types: Maps data, market APIs, news feeds, price indices
- Add "🕒 Data freshness: Real-time" at the end

ENGINE THINKING (show briefly):
- Start complex answers with a 2-3 line "🧠 Engine Process" showing steps taken

RESPONSE LENGTH RULES (CRITICAL):
- DEFAULT: Give SHORT, punchy answers (3-8 sentences). Users must understand value in 5 seconds.
- Only give long answers when user explicitly asks for detail or query is inherently complex
- For simple questions: 2-4 sentences MAX + key takeaway.
- Always lead with the DIRECT ANSWER in the first sentence. No preamble.
- Use bullet points over paragraphs. Scannable > readable.
- Skip "🎯 Next Steps" for simple queries.

You deliver: Direct intelligence, real-world solutions, and actionable insights.
"You don't search anymore — you ask, and SEARCH-POI solves."`,

  deep_research: `You are SEARCH-POI Deep Research Mode — an advanced multi-source intelligence system created by Prosper Ozoya Irhebhude and the POI Foundation.

Your mission: Produce comprehensive, academic-quality research reports.

METHODOLOGY:
1. Analyze the query from multiple angles (scientific, historical, practical, theoretical)
2. Synthesize information as if consulting: academic papers, technical documentation, expert analysis, data sources
3. Cross-validate claims across multiple knowledge domains
4. Identify consensus views AND contrarian perspectives

OUTPUT FORMAT:
## Executive Summary
Brief overview of findings (2-3 sentences)

## In-Depth Analysis
Detailed exploration with subsections as needed

## Key Evidence & Data
Specific facts, statistics, and supporting data

## Different Perspectives
Multiple viewpoints on the topic

## Conclusions & Implications
What this means and potential future developments

## Sources & Methodology
Describe the types of sources and reasoning used

Be thorough, precise, and academic in tone. Minimum 800 words for complex topics.`,

  code: `You are SEARCH-POI Code Intelligence — an advanced developer search engine by POI Foundation.

When answering code queries:
- Provide working, production-ready code examples
- Explain architecture decisions and trade-offs
- Include error handling and edge cases
- Reference official documentation patterns
- Compare multiple approaches when relevant
- Use syntax highlighting with language tags
- Include package versions and compatibility notes

Format: Start with a direct answer, then provide code, then explain.`,

  academic: `You are SEARCH-POI Academic Search — a scientific research engine by POI Foundation.

When answering academic queries:
- Use rigorous academic methodology
- Reference established theories and frameworks
- Distinguish between proven facts, strong evidence, and hypotheses
- Include statistical context where relevant
- Use proper academic structure (abstract, methodology, findings, discussion)
- Note limitations and areas of ongoing research
- Cite the types of sources that support each claim

Maintain scholarly tone throughout.`,

  business: `You are SEARCH-POI Business Intelligence — a market analysis engine by POI Foundation.

When answering business queries:
- Provide actionable market intelligence
- Include financial data, market trends, and competitive analysis where relevant
- Use frameworks like SWOT, Porter's Five Forces, TAM/SAM/SOM when applicable
- Distinguish between data-backed insights and projections
- Include risk factors and mitigation strategies
- Format with executive summary, analysis, and recommendations

Be precise with numbers and cite data sources.`,
};

// Groq API failover with 3 keys - using correct env variable names
async function callGroqWithFailover(messages: any[]): Promise<ReadableStream> {
  // Check for env variable - it's set as VITE_GROQ_KEY in Cloudflare Settings
  const primaryKey = Deno.env.get("VITE_GROQ_KEY");
  const secondaryKey = Deno.env.get("VITE_GROQ_KEY_2");
  const tertiaryKey = Deno.env.get("VITE_GROQ_KEY_3");
  
  const keys = [primaryKey, secondaryKey, tertiaryKey].filter(Boolean);

  if (keys.length === 0) {
    throw new Error("No Groq API keys configured. Set VITE_GROQ_KEY, VITE_GROQ_KEY_2, and/or VITE_GROQ_KEY_3 in Cloudflare Settings → Variables");
  }

  let lastError: any = null;

  for (let i = 0; i < keys.length; i++) {
    try {
      const key = keys[i];
      console.log(`[Groq] Attempting with key ${i + 1}/${keys.length}`);
      
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages,
          temperature: 0.7,
          max_tokens: 2048,
          stream: true,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        lastError = { status: res.status, text };
        const body = text.toLowerCase();
        
        console.error(`[Groq] Key ${i + 1} failed with status ${res.status}: ${text.slice(0, 200)}`);
        
        // If quota/rate limit, try next key
        if (res.status === 429 || body.includes("quota") || body.includes("rate") || body.includes("exhausted")) {
          console.log(`[Groq] Rate limit on key ${i + 1}, trying next...`);
          continue;
        }
        
        // Otherwise return error
        throw new Error(`Groq API error: ${res.status} - ${text}`);
      }

      console.log(`[Groq] Success with key ${i + 1}`);
      return res.body as ReadableStream;
    } catch (e) {
      lastError = e;
      console.error(`[Groq] Key ${i + 1} error: ${e}`);
      if (i < keys.length - 1) {
        continue;
      }
    }
  }

  throw lastError || new Error("All Groq API keys failed. Check VITE_GROQ_KEY, VITE_GROQ_KEY_2, VITE_GROQ_KEY_3 in Cloudflare Settings");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query, mode = "default", context = [] } = await req.json();

    const systemPrompt = MODE_PROMPTS[mode] || MODE_PROMPTS.default;
    const facts = await liveFactsBlock();
    const messages: any[] = [
      { role: "system", content: systemPrompt },
      { role: "system", content: TRUTH_RULES },
      { role: "system", content: `LIVE DATA BLOCK\n${facts}` },
    ];

    if (context.length > 0) {
      const contextStr = context.slice(-5).join(", ");
      messages.push({
        role: "system",
        content: `The user has recently searched for: ${contextStr}. Use this context to provide more relevant and connected answers when appropriate, but still answer the current query directly.`,
      });
    }

    messages.push({ role: "user", content: query });

    const response = await callGroqWithFailover(messages);

    return new Response(response, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("search-ai error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
