/**
 * ICS v2 — Next Genius
 * © POI FOUNDATION LTD — Owner: Prosper Ozoya Irhebhude. All rights reserved.
 * Additive layer over existing ICS. Validates incoming data, keeps a
 * SHA-256 hash-chained audit log (tamper-evident ledger) in local storage.
 */
import type { WebResult } from "@/lib/search-api";

export const ICS_LAYERS = ["Memory", "Process", "Data", "API", "Deployment", "Key", "Lineage"] as const;
export const COPYRIGHT = "© POI FOUNDATION LTD — SEARCH-POI Engine v1. Owner: Prosper Ozoya Irhebhude.";
export const TRADEMARK = "SEARCH-POI™ / POI Foundation™";

const BLOCKED = /(porn|xxx|casino-bonus|crack-download|warez|phishing)/i;
const LEDGER_KEY = "ics_v2_ledger";

export interface ValidationReport { accepted: WebResult[]; blocked: { url: string; reason: string }[] }

/** Zero-Trust Data Gateway + self-healing compliance validator. */
export function zeroTrustGateway(results: WebResult[]): ValidationReport {
  const accepted: WebResult[] = [];
  const blocked: ValidationReport["blocked"] = [];
  const seen = new Set<string>();
  for (const r of results) {
    let reason = "";
    try {
      const u = new URL(r.url);
      if (u.protocol !== "https:" && u.protocol !== "http:") reason = "Unsupported protocol";
      else if (BLOCKED.test(u.hostname + u.pathname)) reason = "Non-compliant domain";
      else if (seen.has(u.hostname + u.pathname)) reason = "Duplicate source";
      seen.add(u.hostname + u.pathname);
    } catch { reason = "Malformed URL"; }
    if (!reason && !r.title?.trim()) reason = "Missing title";
    if (reason) blocked.push({ url: r.url, reason }); else accepted.push(r);
  }
  return { accepted, blocked };
}

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export interface LedgerEntry { ts: string; query: string; decision: string; prevHash: string; hash: string }

export function readLedger(): LedgerEntry[] {
  try { return JSON.parse(localStorage.getItem(LEDGER_KEY) || "[]"); } catch { return []; }
}

/** Append a hash-chained audit entry; each hash covers the previous one. */
export async function auditDecision(query: string, decision: string): Promise<LedgerEntry> {
  const ledger = readLedger();
  const prevHash = ledger.at(-1)?.hash ?? "GENESIS";
  const ts = new Date().toISOString();
  const hash = await sha256(`${prevHash}|${ts}|${query}|${decision}`);
  const entry = { ts, query, decision, prevHash, hash };
  localStorage.setItem(LEDGER_KEY, JSON.stringify([...ledger, entry].slice(-200)));
  return entry;
}

/** Recompute every hash to prove the ledger hasn't been altered. */
export async function verifyLedger(): Promise<boolean> {
  const ledger = readLedger();
  let prev = ledger[0]?.prevHash ?? "GENESIS";
  for (const e of ledger) {
    if (e.prevHash !== prev) return false;
    if ((await sha256(`${e.prevHash}|${e.ts}|${e.query}|${e.decision}`)) !== e.hash) return false;
    prev = e.hash;
  }
  return true;
}
