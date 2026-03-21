import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Loader2, Copy, Check } from "lucide-react";
import ShareButtons from "@/components/ShareButtons";
import SourceCitations, { type SourceRef } from "@/components/SourceCitations";

interface AIAnswerProps {
  answer: string;
  isStreaming: boolean;
  query: string;
  sources?: SourceRef[];
  liteMode?: boolean;
}

const AIAnswer = ({ answer, isStreaming, query, sources = [], liteMode }: AIAnswerProps) => {
  const [copied, setCopied] = useState(false);

  if (!answer && !isStreaming) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = answer;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (liteMode) {
    return (
      <div className="border border-border/30 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-muted-foreground">AI ANSWER</span>
          {isStreaming && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
        </div>
        <div className="text-sm text-foreground whitespace-pre-wrap">{answer}</div>
        {!isStreaming && sources.length > 0 && <SourceCitations sources={sources} />}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 glow-box"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Brain className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm">SEARCH-POI AI</h3>
          <p className="text-xs text-muted-foreground">Intelligent answer for "{query}"</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {isStreaming ? (
            <span className="flex items-center gap-2 text-xs text-primary">
              <Loader2 className="w-3 h-3 animate-spin" />
              Thinking...
            </span>
          ) : answer ? (
            <div className="flex items-center gap-2">
              <ShareButtons text={answer} query={query} />
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent/20 transition-colors"
                title="Copy AI response"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[hsl(142,70%,50%)]" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="prose prose-invert prose-sm max-w-none">
        <div className="text-secondary-foreground leading-relaxed whitespace-pre-wrap">
          {answer}
          {isStreaming && (
            <span className="inline-block w-2 h-5 bg-primary ml-0.5 animate-pulse" />
          )}
        </div>
      </div>

      {!isStreaming && sources.length > 0 && <SourceCitations sources={sources} />}
    </motion.div>
  );
};

export default AIAnswer;
