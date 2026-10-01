/**
 * Omni-Search Engine — 11 optimization services
 * © POI FOUNDATION LTD. Each service analyses the live query + results.
 */
import type { WebResult } from "@/lib/search-api";

export interface OmniInsight { code: string; name: string; tip: string }
type Svc = (q: string, r: WebResult[]) => OmniInsight;

const host = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; } };
const has = (r: WebResult[], re: RegExp) => r.filter((x) => re.test(x.url + x.title)).length;

export const AEO: Svc = (q) => ({ code: "AEO", name: "Answer Engine", tip: `Lead with a one-sentence answer to "${q}".` });
export const LEO: Svc = (q, r) => ({ code: "LEO", name: "Local Engine", tip: /lagos|abuja|nigeria|near|ph|port harcourt/i.test(q) ? "Local intent — add address, phone and map pin." : `${has(r, /\.ng/)} Nigerian (.ng) sources found.` });
export const SMO: Svc = (_q, r) => ({ code: "SMO", name: "Social Media", tip: `${has(r, /twitter|x\.com|facebook|instagram|linkedin|tiktok/)} social sources in results.` });
export const VSO: Svc = (_q, r) => ({ code: "VSO", name: "Video Search", tip: `${has(r, /youtube|vimeo|tiktok/)} video sources — try the Videos tab.` });
export const ASO: Svc = (_q, r) => ({ code: "ASO", name: "App Store", tip: `${has(r, /play\.google|apps\.apple/)} app-store listings found.` });
export const PSO: Svc = (q) => ({ code: "PSO", name: "Product Search", tip: /price|buy|cost|cheap/i.test(q) ? "Shopping intent — compare prices across sellers." : "No shopping intent detected." });
export const SxO: Svc = (_q, r) => ({ code: "SxO", name: "Search Experience", tip: `${r.filter((x) => x.description?.length > 80).length}/${r.length} results have rich snippets.` });
export const PAA: Svc = (q) => ({ code: "PAA", name: "People Also Ask", tip: `What is ${q}? · How does ${q} work? · ${q} cost in Nigeria?` });
export const UGC: Svc = (_q, r) => ({ code: "UGC", name: "User Content", tip: `${has(r, /reddit|quora|nairaland|forum/)} community discussions found.` });
export const GEO: Svc = (_q, r) => ({ code: "GEO", name: "Generative Engine", tip: `Top cited domains: ${[...new Set(r.slice(0, 3).map((x) => host(x.url)))].join(", ") || "none"}.` });
export const AIO: Svc = (_q, r) => ({ code: "AIO", name: "AI Overview", tip: r.length >= 3 ? "Enough sources for a grounded AI overview." : "Too few sources — overview may be thin." });

export const OMNI_SERVICES: Svc[] = [AEO, LEO, SMO, VSO, ASO, PSO, SxO, PAA, UGC, GEO, AIO];
export const runOmniSearch = (q: string, r: WebResult[]) => OMNI_SERVICES.map((s) => s(q, r));
