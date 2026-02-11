import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MODE_PROMPTS: Record<string, string> = {
  default: `You are SEARCH-POI, a next-generation AI search engine created by Prosper Ozoya Irhebhude and the POI Foundation.

CRITICAL CAPABILITIES:
- You are an intelligent reasoning engine, not a keyword matcher
- Analyze user intent, emotion, and context behind every query
- If the query is vague or unclear, interpret what the user most likely means and provide the best possible answer
- Cross-reference multiple knowledge domains to synthesize comprehensive answers
- Detect misinformation patterns and prioritize verified, accurate information

When answering:
- Provide a clear, well-structured answer with markdown formatting
- Use bullet points, numbered lists, and headers when appropriate
- Include relevant facts, data, and context
- If the query is a question, answer it directly first, then provide supporting detail
- Always be factual and note when you're uncertain
- End with a brief "Key Takeaway" when appropriate
- If the user's query could be improved, silently rewrite it internally for better results

You are NOT a chatbot. You are an intelligent discovery engine.`,

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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query, mode = "default", context = [] } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = MODE_PROMPTS[mode] || MODE_PROMPTS.default;

    // Build contextual messages
    const messages: any[] = [{ role: "system", content: systemPrompt }];

    // Add session context if provided (recent searches for smarter results)
    if (context.length > 0) {
      const contextStr = context.slice(-5).join(", ");
      messages.push({
        role: "system",
        content: `The user has recently searched for: ${contextStr}. Use this context to provide more relevant and connected answers when appropriate, but still answer the current query directly.`,
      });
    }

    messages.push({ role: "user", content: query });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: mode === "deep_research" ? "google/gemini-2.5-flash" : "google/gemini-3-flash-preview",
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
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
