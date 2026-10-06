const STORAGE_KEY = "searchpoi_context";
const MAX_HISTORY = 20;
const RESET_FLAG = "searchpoi_history_reset_v2";

// One-time fresh start: everyone's on-device history begins empty.
try {
  if (typeof localStorage !== "undefined" && localStorage.getItem(RESET_FLAG) !== "1") {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(RESET_FLAG, "1");
  }
} catch { /* ignore */ }

export interface SearchHistoryItem {
  query: string;
  mode: string;
  timestamp: number;
}

export function getSearchHistory(): SearchHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addSearchToHistory(query: string, mode: string) {
  const history = getSearchHistory();
  // Deduplicate
  const filtered = history.filter(
    (h) => h.query.toLowerCase() !== query.toLowerCase()
  );
  filtered.unshift({ query, mode, timestamp: Date.now() });
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(filtered.slice(0, MAX_HISTORY))
  );
}

export function getRecentQueries(limit = 5): string[] {
  return getSearchHistory()
    .slice(0, limit)
    .map((h) => h.query);
}

export function deleteSearchFromHistory(query: string): Promise<void> {
  const next = getSearchHistory().filter((h) => h.query.toLowerCase() !== query.toLowerCase());
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return import("@/integrations/supabase/client").then(async ({ supabase }) => {
    const { data } = await supabase.auth.getUser();
    if (data.user) await supabase.from("search_activity").delete().eq("user_id", data.user.id).eq("query", query);
    window.dispatchEvent(new Event("search-history-changed"));
  });
}

export function clearSearchHistory() {
  localStorage.removeItem(STORAGE_KEY);
  // Also delete the signed-in user's saved searches (RLS limits to own rows)
  import("@/integrations/supabase/client").then(async ({ supabase }) => {
    const { data } = await supabase.auth.getUser();
    if (data.user) await supabase.from("search_activity").delete().eq("user_id", data.user.id);
    window.dispatchEvent(new Event("search-history-cleared"));
    window.dispatchEvent(new Event("search-history-changed"));
  });
}
