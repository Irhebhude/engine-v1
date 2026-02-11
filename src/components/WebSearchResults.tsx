import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, ExternalLink, FileText, Loader2 } from "lucide-react";
import { summarizeUrl } from "@/lib/search-api";

export interface WebResult {
  url: string;
  title: string;
  description: string;
  markdown?: string;
}

interface WebSearchResultsProps {
  results: WebResult[];
  isLoading: boolean;
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

const WebSearchResults = ({ results, isLoading }: WebSearchResultsProps) => {
  const [summarizing, setSummarizing] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<Record<string, string>>({});

  const handleSummarize = async (url: string) => {
    if (summaries[url]) {
      // Toggle off
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

  return (
    <div className="mt-8 space-y-1">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Web Results</h2>
      </div>

      {results.map((result, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="px-4 py-4 -mx-4 rounded-xl hover:bg-accent/10 transition-colors"
        >
          <a href={result.url} target="_blank" rel="noopener noreferrer" className="group block">
            <div className="flex items-center gap-2 mb-1">
              <img
                src={`https://www.google.com/s2/favicons?domain=${getDomain(result.url)}&sz=32`}
                alt="" className="w-4 h-4 rounded-sm"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <span className="text-xs text-muted-foreground truncate">{getBreadcrumb(result.url)}</span>
              <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0" />
            </div>
            <h3 className="text-lg font-medium text-primary group-hover:underline underline-offset-2 leading-snug">
              {result.title || getDomain(result.url)}
            </h3>
            {result.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{result.description}</p>
            )}
          </a>

          {/* AI Summarize button */}
          <button
            onClick={() => handleSummarize(result.url)}
            className="flex items-center gap-1.5 mt-2 text-xs text-primary/70 hover:text-primary transition-colors"
          >
            {summarizing === result.url ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <FileText className="w-3 h-3" />
            )}
            {summaries[result.url] ? "Hide Summary" : "AI Summary"}
          </button>

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
    </div>
  );
};

export default WebSearchResults;
