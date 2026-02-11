import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import AIAnswer from "@/components/AIAnswer";
import WebSearchResults from "@/components/WebSearchResults";
import { streamSearch, webSearch } from "@/lib/search-api";
import type { WebResult } from "@/lib/search-api";
import { useToast } from "@/hooks/use-toast";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const query = searchParams.get("q") || "";

  const [answer, setAnswer] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [searchTime, setSearchTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [webResults, setWebResults] = useState<WebResult[]>([]);
  const [isWebLoading, setIsWebLoading] = useState(false);

  const performSearch = useCallback(
    async (q: string) => {
      setAnswer("");
      setIsStreaming(true);
      setError(null);
      setWebResults([]);
      setIsWebLoading(true);
      const start = performance.now();
      let accumulated = "";

      // Fire both searches in parallel
      const webPromise = webSearch(q).then((results) => {
        setWebResults(results);
        setIsWebLoading(false);
      }).catch(() => setIsWebLoading(false));

      const aiPromise = (async () => {
        try {
          await streamSearch({
            query: q,
            onDelta: (chunk) => {
              accumulated += chunk;
              setAnswer(accumulated);
            },
            onDone: () => {
              setIsStreaming(false);
              setSearchTime(Math.round(performance.now() - start));
            },
          });
        } catch (e: any) {
          setIsStreaming(false);
          setError(e.message);
          toast({
            title: "Search Error",
            description: e.message,
            variant: "destructive",
          });
        }
      })();

      await Promise.allSettled([webPromise, aiPromise]);
    },
    [toast]
  );

  useEffect(() => {
    if (query) performSearch(query);
  }, [query, performSearch]);

  const handleNewSearch = (newQuery: string) => {
    navigate(`/search?q=${encodeURIComponent(newQuery)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Search bar area */}
      <div className="pt-20 pb-4 px-4 border-b border-border/30 glass">
        <div className="container mx-auto max-w-4xl">
          <SearchBar onSearch={handleNewSearch} isLoading={isStreaming} compact initialQuery={query} />
        </div>
      </div>

      {/* Results */}
      <main className="container mx-auto max-w-4xl px-4 py-8">
        {searchTime && !isStreaming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-xs text-muted-foreground mb-6"
          >
            <Clock className="w-3 h-3" />
            AI answer generated in {(searchTime / 1000).toFixed(2)}s
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 border-destructive/30 mb-6"
          >
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <p className="font-medium">{error}</p>
            </div>
          </motion.div>
        )}

        <AIAnswer answer={answer} isStreaming={isStreaming} query={query} />

        <WebSearchResults results={webResults} isLoading={isWebLoading} />

        {/* Powered by footer */}
        <div className="text-center mt-12 text-xs text-muted-foreground">
          SEARCH-POI • AI-First Intelligence • POI Foundation
        </div>
      </main>
    </div>
  );
};

export default SearchResults;
