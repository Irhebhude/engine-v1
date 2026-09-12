import { openDB, type IDBPDatabase } from "idb";
import { POI_SEED, type POI } from "@/data/poi-seed";

const DB_NAME = "searchpoi-offline";
const DB_VERSION = 1;
const POI_STORE = "pois";
const ANSWER_STORE = "answers";
const META_STORE = "meta";

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(POI_STORE)) {
          db.createObjectStore(POI_STORE, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(ANSWER_STORE)) {
          db.createObjectStore(ANSWER_STORE);
        }
        if (!db.objectStoreNames.contains(META_STORE)) {
          db.createObjectStore(META_STORE);
        }
      },
    });
  }
  return dbPromise;
}

export async function seedIfEmpty(): Promise<number> {
  const db = await getDB();
  const count = await db.count(POI_STORE);
  if (count === 0) {
    const tx = db.transaction(POI_STORE, "readwrite");
    await Promise.all(POI_SEED.map((p) => tx.store.put(p)));
    await tx.done;
    await db.put(META_STORE, Date.now(), "lastSync");
    return POI_SEED.length;
  }
  return count;
}

export async function poiCount(): Promise<number> {
  const db = await getDB();
  return db.count(POI_STORE);
}

export async function lastSync(): Promise<number | null> {
  const db = await getDB();
  return (await db.get(META_STORE, "lastSync")) ?? null;
}

/** Re-seed / refresh the local POI cache from the bundled dataset plus any live source. */
export async function syncPOIs(remoteUrl?: string): Promise<number> {
  const db = await getDB();
  let incoming: POI[] = POI_SEED;
  if (remoteUrl && navigator.onLine) {
    try {
      const res = await fetch(remoteUrl);
      if (res.ok) {
        const json = await res.json();
        const list: POI[] = Array.isArray(json) ? json : json.pois || [];
        if (list.length) incoming = [...POI_SEED, ...list];
      }
    } catch {
      /* keep bundled seed */
    }
  }
  const tx = db.transaction(POI_STORE, "readwrite");
  await Promise.all(incoming.map((p) => tx.store.put(p)));
  await tx.done;
  await db.put(META_STORE, Date.now(), "lastSync");
  return db.count(POI_STORE);
}

function score(p: POI, terms: string[]): number {
  const hay = `${p.name} ${p.category} ${p.city} ${p.state} ${p.address} ${p.tags.join(" ")}`.toLowerCase();
  let s = 0;
  for (const t of terms) {
    if (!t) continue;
    if (p.name.toLowerCase().includes(t)) s += 5;
    if (p.tags.some((tag) => tag.includes(t))) s += 3;
    if (hay.includes(t)) s += 1;
  }
  return s;
}

export async function searchPOIs(query: string, limit = 20): Promise<POI[]> {
  const db = await getDB();
  const all: POI[] = await db.getAll(POI_STORE);
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return all.slice(0, limit);
  return all
    .map((p) => ({ p, s: score(p, terms) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.p);
}

/** Cache an AI answer so the same question works offline later. */
export async function cacheAnswer(query: string, answer: string) {
  if (!answer.trim()) return;
  const db = await getDB();
  await db.put(ANSWER_STORE, { answer, at: Date.now() }, query.trim().toLowerCase());
}

export async function getCachedAnswer(query: string): Promise<string | null> {
  const db = await getDB();
  const rec = await db.get(ANSWER_STORE, query.trim().toLowerCase());
  return rec?.answer ?? null;
}

/** Build a readable offline answer from the local POI index. */
export function formatOfflineAnswer(query: string, pois: POI[]): string {
  if (!pois.length) {
    return `**Offline mode** — no internet connection detected.\n\nI could not find anything matching "${query}" in the on-device index. Connect to the internet for full AI answers, or try a place, market, hospital, university or government agency name.`;
  }
  const lines = pois
    .slice(0, 8)
    .map(
      (p, i) =>
        `${i + 1}. **${p.name}** — ${p.category}, ${p.city}, ${p.state}\n   ${p.address}${p.phone ? `\n   📞 ${p.phone}` : ""}`,
    )
    .join("\n");
  return `**Offline mode** — answered from the on-device SEARCH-POI index.\n\nHere is what matches "${query}":\n\n${lines}\n\n⚡ Key Takeaways\n- ${pois.length} local match${pois.length === 1 ? "" : "es"} found without any internet connection.\n- Phone numbers work over the normal mobile network.\n- Reconnect for live AI reasoning, web results and current prices.`;
}
