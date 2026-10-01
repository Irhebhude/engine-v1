/** Speed cache · Cost reducer · Scalability handler — © POI FOUNDATION LTD */
const mem = new Map<string, { v: unknown; exp: number }>();
let hits = 0, misses = 0;
const inflight = new Map<string, Promise<unknown>>();

/** Cache (memory + session) with TTL, and de-duplicates identical in-flight requests. */
export async function cached<T>(key: string, fn: () => Promise<T>, ttlMs = 5 * 60_000): Promise<T> {
  const now = Date.now();
  const m = mem.get(key);
  if (m && m.exp > now) { hits++; return m.v as T; }
  try {
    const s = JSON.parse(sessionStorage.getItem("poi_c_" + key) || "null");
    if (s && s.exp > now) { hits++; mem.set(key, s); return s.v as T; }
  } catch { /* ignore */ }
  if (inflight.has(key)) return inflight.get(key) as Promise<T>;
  misses++;
  const p = fn().then((v) => {
    const e = { v, exp: Date.now() + ttlMs };
    mem.set(key, e);
    try { sessionStorage.setItem("poi_c_" + key, JSON.stringify(e)); } catch { /* quota */ }
    return v;
  }).finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

export const cacheStats = () => ({ hits, misses, saved: hits, ratio: hits + misses ? Math.round((hits / (hits + misses)) * 100) : 0 });
