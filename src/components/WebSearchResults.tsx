import { motion } from "framer-motion";
import { Globe, ExternalLink, ChevronRight } from "lucide-react";

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
  try {
    const u = new URL(url);
    return u.hostname.replace("www.", "");
  } catch {
    return url;
  }
};

const getBreadcrumb = (url: string) => {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length === 0) return u.hostname.replace("www.", "");
    return `${u.hostname.replace("www.", "")} › ${parts.slice(0, 2).join(" › ")}`;
  } catch {
    return url;
  }
};

const WebSearchResults = ({ results, isLoading }: WebSearchResultsProps) => {
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
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Web Results
        </h2>
      </div>

      {results.map((result, i) => (
        <motion.a
          key={i}
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="block group px-4 py-4 -mx-4 rounded-xl hover:bg-accent/10 transition-colors"
        >
          {/* Breadcrumb / URL */}
          <div className="flex items-center gap-2 mb-1">
            <img
              src={`https://www.google.com/s2/favicons?domain=${getDomain(result.url)}&sz=32`}
              alt=""
              className="w-4 h-4 rounded-sm"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <span className="text-xs text-muted-foreground truncate">
              {getBreadcrumb(result.url)}
            </span>
            <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-medium text-primary group-hover:underline underline-offset-2 leading-snug">
            {result.title || getDomain(result.url)}
          </h3>

          {/* Description */}
          {result.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {result.description}
            </p>
          )}
        </motion.a>
      ))}
    </div>
  );
};

export default WebSearchResults;
