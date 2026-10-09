/**
 * Search API Layer — Retrieval services (NOT AI generation).
 *
 * This module handles web/image/video/news retrieval and URL summarization
 * by calling the corresponding Supabase Edge Functions. AI generation is
 * handled separately in ai-providers.ts.
 *
 * If a provider is not configured, each function returns an honest
 * "unavailable" state rather than fake results.
 */
import { getAIResponseWithFailover } from "@/lib/ai-providers";

export const getAIResponse = getAIResponseWithFailover;

export type SearchMode = "default" | "deep_research" | "code" | "academic" | "business";

export interface WebResult {
  url: string;
  title: string;
  description: string;
  markdown?: string;
  domain?: string;
}
export interface ImageResult {
  url: string;
  title: string;
  thumbnail?: string;
}
export interface VideoResult {
  url: string;
  title: string;
  thumbnail?: string;
}
export interface NewsResult {
  url: string;
  title: string;
  description: string;
  publishedAt?: string;
}

interface RawSearchItem {
  url?: string;
  title?: string;
  description?: string;
  markdown?: string;
  metadata?: { title?: string; description?: string };
}

interface RawImageItem {
  url?: string;
  alt?: string;
  sourceTitle?: string;
  title?: string;
  isThumbnail?: boolean;
}

interface RawVideoItem {
  url?: string;
  title?: string;
  thumbnail?: string;
}

interface RawNewsItem {
  url?: string;
  title?: string;
  description?: string;
  publishedAt?: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const TIMEOUT_MS = 20_000;

function edgeUrl(slug: string): string {
  return `${SUPABASE_URL}/functions/v1/${slug}`;
}

function authHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${SUPABASE_KEY}`,
  };
}

async function fetchWithTimeout(url: string, opts: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function searchWithMode(query: string, mode: SearchMode = "default", context: string = ""): Promise<string> {
  localStorage.setItem("search_mode", mode);
  return await getAIResponseWithFailover(query, context, mode);
}

export async function searchAPI(q: string, m: SearchMode = "default"): Promise<string> {
  return searchWithMode(q, m);
}

/**
 * Web search via the Supabase web-search edge function (Firecrawl-backed).
 * Returns real results or an empty array if the provider is unavailable.
 */
export async function webSearch(query: string, limit = 10, _scrape = true): Promise<WebResult[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  try {
    const res = await fetchWithTimeout(edgeUrl("web-search"), {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ query, limit }),
    });
    if (!res.ok) return [];
    const json = await res.json();
    if (!json.success || !json.data) return [];
    const results: WebResult[] = (json.data as RawSearchItem[]).map((r) => {
      let domain = "";
      try { domain = new URL(r.url || "").hostname.replace("www.", ""); } catch { domain = r.url || ""; }
      return {
        url: r.url || "",
        title: r.title || r.metadata?.title || "",
        description: r.description || r.metadata?.description || "",
        markdown: r.markdown || "",
        domain,
      };
    });
    return results;
  } catch {
    return [];
  }
}

/**
 * Image search via the Supabase image-search edge function.
 */
export async function imageSearch(query: string, limit = 20): Promise<ImageResult[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  try {
    const res = await fetchWithTimeout(edgeUrl("image-search"), {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ query, limit }),
    });
    if (!res.ok) return [];
    const json = await res.json();
    if (!json.success || !json.images) return [];
    return (json.images as RawImageItem[]).map((img) => ({
      url: img.url || "",
      title: img.alt || img.sourceTitle || img.title || "",
      thumbnail: img.isThumbnail ? img.url : undefined,
    }));
  } catch {
    return [];
  }
}

/**
 * Video search via the Supabase video-search edge function.
 */
export async function videoSearch(query: string, limit = 20): Promise<VideoResult[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  try {
    const res = await fetchWithTimeout(edgeUrl("video-search"), {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ query, limit }),
    });
    if (!res.ok) return [];
    const json = await res.json();
    if (!json.success || !json.videos) return [];
    return (json.videos as RawVideoItem[]).map((v) => ({
      url: v.url || "",
      title: v.title || "",
      thumbnail: v.thumbnail || "",
    }));
  } catch {
    return [];
  }
}

/**
 * News search via the Supabase news-search edge function.
 */
export async function newsSearch(query: string, limit = 20): Promise<NewsResult[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  try {
    const res = await fetchWithTimeout(edgeUrl("news-search"), {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ query, limit }),
    });
    if (!res.ok) return [];
    const json = await res.json();
    if (!json.success || !json.news) return [];
    return (json.news as RawNewsItem[]).map((n) => ({
      url: n.url || "",
      title: n.title || "",
      description: n.description || "",
      publishedAt: n.publishedAt || undefined,
    }));
  } catch {
    return [];
  }
}

/**
 * Summarize a URL via the Supabase summarize-url edge function.
 * Returns an honest error message if the service is unavailable.
 */
export async function summarizeUrl(url: string): Promise<string> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return "URL summarization is not configured.";
  }
  try {
    const res = await fetchWithTimeout(edgeUrl("summarize-url"), {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ url }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return data.error || "Could not summarize this page.";
    }
    const data = await res.json();
    return data.summary || "No summary could be generated for this page.";
  } catch {
    return "Failed to reach the summarization service.";
  }
}

/**
 * Streaming search — streams the AI response token by token for the UI.
 * Uses the secure Cloudflare AI function, not a raw provider call.
 */
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
  onDelta: (t: string) => void;
  onDone: () => void;
}) {
  try {
    const ctx = context.length ? context.join("\n") + "\n" : "";
    const answer = await getAIResponseWithFailover(`${ctx}${query}`, "", mode);
    const words = answer.split(/(\s+)/);
    for (const w of words) {
      onDelta(w);
      await new Promise((r) => setTimeout(r, 15));
    }
    onDone();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Search failed.";
    onDelta(`\n\n**Error:** ${msg}`);
    onDone();
  }
}
