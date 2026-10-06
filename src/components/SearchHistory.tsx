import { useCallback, useEffect, useState } from "react";
import { Clock, Trash2, X } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { getSearchHistory, clearSearchHistory, deleteSearchFromHistory } from "@/lib/search-context";

interface SearchHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (query: string) => void;
}

interface Row { query: string; timestamp: number }

const SearchHistory = ({ isOpen, onClose, onSelect }: SearchHistoryProps) => {
  const [rows, setRows] = useState<Row[]>([]);

  const load = useCallback(async () => {
    const merged = new Map<string, Row>();
    getSearchHistory().forEach((h) => merged.set(h.query.toLowerCase(), { query: h.query, timestamp: h.timestamp }));
    const { data: auth } = await supabase.auth.getUser();
    if (auth.user) {
      const { data } = await supabase
        .from("search_activity")
        .select("query, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      (data || []).forEach((r) => {
        const k = r.query.toLowerCase();
        if (!merged.has(k)) merged.set(k, { query: r.query, timestamp: new Date(r.created_at).getTime() });
      });
    }
    setRows([...merged.values()].sort((a, b) => b.timestamp - a.timestamp));
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    load();
    window.addEventListener("search-history-changed", load);
    return () => window.removeEventListener("search-history-changed", load);
  }, [isOpen, load]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass relative z-50 max-h-[70vh] w-full overflow-y-auto rounded-xl"
    >
      <div className="flex items-center justify-between border-b border-border/30 px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent Searches</span>
        <div className="flex items-center gap-2">
          {rows.length > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setRows([]); clearSearchHistory(); }}
              className="flex min-h-12 items-center gap-1 px-2 text-xs text-muted-foreground transition-colors hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" /> Clear all
            </button>
          )}
          <button onClick={onClose} aria-label="Close" className="flex min-h-12 min-w-12 items-center justify-center text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-muted-foreground">No search history yet</div>
      ) : (
        rows.map((item) => (
          <div key={item.query} className="flex items-center transition-colors hover:bg-accent/20">
            <button onClick={() => onSelect(item.query)} className="flex min-h-12 flex-1 items-center gap-3 overflow-hidden px-4 py-2.5 text-left">
              <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate text-sm text-foreground">{item.query}</span>
              <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">{new Date(item.timestamp).toLocaleDateString()}</span>
            </button>
            <button
              onClick={() => { setRows((r) => r.filter((x) => x.query !== item.query)); deleteSearchFromHistory(item.query); }}
              aria-label={`Delete ${item.query} from history`}
              className="flex min-h-12 min-w-12 items-center justify-center text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))
      )}
    </motion.div>
  );
};

export default SearchHistory;
