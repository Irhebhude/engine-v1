import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Loader2, Copy, Check } from "lucide-react";
import ShareButtons from "@/components/ShareButtons";

interface AIAnswerProps {
  answer: string;
  isStreaming: boolean;
  query: string;
}

const AIAnswer = ({ answer, isStreaming, query }: AIAnswerProps) => {
  const [copied, setCopied] = useState(false);

  if (!answer && !isStreaming) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
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
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent/20 transition-colors"
              title="Copy AI response"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
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
    </motion.div>
  );
};

export default AIAnswer;
