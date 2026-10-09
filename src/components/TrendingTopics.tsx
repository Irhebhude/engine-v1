import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, Flame, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TrendingItem {
  query: string;
  search_count: number;
  last_searched_at: string;
}

const TrendingTopics = () => {
  const navigate = useNavigate();
  const [trending, setTrending] = useState<TrendingItem[]>([]);

  useEffect(() => {
    const fetchTrending = async () => {
      const { data } = await supabase
        .from("trending_searches" as any)
        .select("query, search_count, last_searched_at")
        .order("search_count", { ascending: false })
        .limit(8);
      if (data) setTrending(data as any);
    };
    fetchTrending();

    // Real-time updates
    const channel = supabase
      .channel("trending-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "trending_searches" }, () => {
        fetchTrending();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (trending.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-[28px] border border-border/70 bg-card/55">
      <div className="flex items-center gap-3 border-b border-border/50 p-5 sm:p-6">
        <Flame className="h-6 w-6 text-primary" />
        <h3 className="font-display text-xl font-semibold text-foreground">Trending Searches</h3>
      </div>
      <div className="divide-y divide-border/20">
        {trending.slice(0, 5).map((item, i) => (
          <motion.button
            key={item.query}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate(`/search?q=${encodeURIComponent(item.query)}`)}
            className="group flex min-h-[92px] w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-secondary/25 sm:px-6"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="truncate text-base text-foreground transition-colors group-hover:text-primary sm:text-lg">{item.query}</p>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <TrendingUp className="w-3 h-3" />
                {item.search_count} searches
              </p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default TrendingTopics;
