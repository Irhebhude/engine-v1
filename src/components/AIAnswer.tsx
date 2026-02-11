import { motion } from "framer-motion";
import { Sparkles, Brain, Loader2 } from "lucide-react";

interface AIAnswerProps {
  answer: string;
  isStreaming: boolean;
  query: string;
}

const AIAnswer = ({ answer, isStreaming, query }: AIAnswerProps) => {
  if (!answer && !isStreaming) return null;

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
        {isStreaming && (
          <div className="ml-auto flex items-center gap-2 text-xs text-primary">
            <Loader2 className="w-3 h-3 animate-spin" />
            Thinking...
          </div>
        )}
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
