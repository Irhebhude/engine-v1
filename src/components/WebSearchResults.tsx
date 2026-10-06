import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Globe, FileText, Loader2 } from "lucide-react";
import { summarizeUrl } from "@/lib/search-api";
import BusinessBadge from "@/components/BusinessBadge";
import ActionButtons from "@/components/ActionButtons";
import { Button } from "@/components/ui/button";
import { cleanWebDescription, cleanWebText } from "@/lib/clean-web-result";

export interface WebResult {
  url: string;
  title: string;
  description: string;
  markdown?: string;
  // Business enrichment (optional)
  isVerified?: boolean;
  phone?: string;
  whatsapp?: string;
  memberDiscount?: number;
  businessName?: string;
}

const getDomain = (url: string) => {
  try { return new URL(url).hostname.replace("www.", ""); } catch { return url; }
};

const getBreadcrumb = (url: string) => {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length === 0) return u.hostname.replace("www.", "");
    return `${u.hostname.replace("www.", "")} › ${parts.slice(0, 2).join(" › ")}`;
  } catch { return url; }
};

interface WebSearchResultsProps {
  results: WebResult[];
  isLoading: boolean;
  isPremiumUser?: boolean;
  liteMode?: boolean;
  query?: string;
  canLoadMore?: boolean;
  onLoadMore?: () => Promise<void>;
}

const PAGE_SIZE = 10;

const WebSearchResults = ({ results, isLoading, isPremiumUser, liteMode, query, canLoadMore, onLoadMore }: WebSearchResultsProps) => {
  const [summarizing, setSummarizing] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => { setVisible(PAGE_SIZE); }, [query]);

  const handleSeeMore = async () => {
    if (results.length <= visible && canLoadMore && onLoadMore) {
      setLoadingMore(true);
      try { await onLoadMore(); } finally { setLoadingMore(false); }
    }
    setVisible((v) => v + PAGE_SIZE);
  };

  const handleSummarize = async (url: string) => {
    if (summaries[url]) {
      setSummaries((prev) => { const n = { ...prev }; delete n[url]; return n; });
      return;
    }
    setSummarizing(url);
    try {
      const summary = await summarizeUrl(url);
      setSummaries((prev) => ({ ...prev, [url]: summary }));
    } catch {
      setSummaries((prev) => ({ ...prev, [url]: "Failed to summarize this page." }));
    } finally {
      setSummarizing(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 mt-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse space-y-2">
            <div className="h-3 bg-muted/30 rounded w-48" />
            <div className="h-5 bg-muted/20 rounded w-3/4" />
            <div className="h-4 bg-muted/10 rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) return null;

  const visibleResults = results.slice(0, visible);
  const hasMore = results.length > visible || !!canLoadMore;

  return (
    <section className="mt-8" aria-labelledby="web-results-heading">
      <div className="mb-6 flex items-center gap-2">
        <Globe className="w-4 h-4 text-primary" />
        <h2 id="web-results-heading" className="text-xs font-semibold uppercase tracking-[1px] text-muted-foreground">Web Results</h2>
      </div>

      {visibleResults.map((result, i) => (
        <motion.div
          key={`${result.url}-${i}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="mb-6"
        >
          <a href={result.url} target="_blank" rel="noopener noreferrer" className="group block">
            <div className="mb-1 flex items-center gap-2">
              <img
                src={`https://www.google.com/s2/favicons?domain=${getDomain(result.url)}&sz=32`}
                alt="" className="w-4 h-4 rounded-sm"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <span className="truncate text-[13px] text-muted-foreground/60">{getBreadcrumb(result.url)}</span>
            </div>
            <h3 className="text-lg font-bold leading-[1.3] text-primary group-hover:underline underline-offset-2">
              {cleanWebText(result.title) || getDomain(result.url)}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{cleanWebDescription(result.description)}</p>
          </a>

          {/* Business badges */}
          {result.isVerified && (
            <div className="mt-2">
              <BusinessBadge isVerified memberDiscount={result.memberDiscount} isPremiumUser={isPremiumUser} />
            </div>
          )}

          {/* Action buttons for businesses */}
          {(result.phone || result.whatsapp) && (
            <ActionButtons phone={result.phone} whatsapp={result.whatsapp} businessName={result.businessName} query={query} />
          )}

          {/* AI Summarize button */}
          <Button
            onClick={() => handleSummarize(result.url)}
            variant="ghost"
            className="mt-1 min-h-12 justify-start px-0 text-[13px] text-primary hover:bg-transparent hover:text-primary"
          >
            {summarizing === result.url ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <FileText className="w-3 h-3" />
            )}
            {summaries[result.url] ? "Hide Summary" : "AI Summary"}
          </Button>

          {summaries[result.url] && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/10 text-sm text-secondary-foreground whitespace-pre-wrap leading-relaxed"
            >
              {summaries[result.url]}
            </motion.div>
          )}
        </motion.div>
      ))}

      {hasMore && (
        <div className="mt-2 flex justify-center">
          <Button
            onClick={handleSeeMore}
            disabled={loadingMore}
            variant="outline"
            className="min-h-12 rounded-full border-primary/40 px-6 text-primary hover:bg-primary/10 hover:text-primary"
          >
            {loadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            See more web results
          </Button>
        </div>
      )}
    </section>
  );
};

export default WebSearchResults;
