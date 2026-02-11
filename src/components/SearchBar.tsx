import { useState, useRef, useEffect } from "react";
import { Search, Mic, Sparkles, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SUGGESTIONS = [
  "What is quantum computing?",
  "Latest AI breakthroughs 2026",
  "How does blockchain work?",
  "Best programming languages to learn",
  "Climate change solutions",
  "History of the internet",
];

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  compact?: boolean;
  initialQuery?: string;
}

const SearchBar = ({ onSearch, isLoading, compact, initialQuery = "" }: SearchBarProps) => {
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = SUGGESTIONS.filter((s) =>
    s.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  useEffect(() => {
    if (!compact) inputRef.current?.focus();
  }, [compact]);

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div
          className={`search-glow relative flex items-center gap-3 glass rounded-2xl transition-all duration-300 ${
            compact ? "px-4 py-3" : "px-6 py-4"
          } ${isFocused ? "glow-border" : ""}`}
        >
          <Search className="w-5 h-5 text-primary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => {
              setIsFocused(true);
              setShowSuggestions(true);
            }}
            onBlur={() => {
              setIsFocused(false);
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            placeholder="Ask anything... SEARCH-POI understands you"
            className={`flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-sans ${
              compact ? "text-base" : "text-lg"
            }`}
          />
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <button
              type="submit"
              disabled={!query.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-30"
            >
              <Sparkles className="w-4 h-4" />
              Search
            </button>
          )}
        </div>
      </form>

      <AnimatePresence>
        {showSuggestions && query.length > 0 && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-full mt-2 w-full glass rounded-xl overflow-hidden z-50"
          >
            {filteredSuggestions.map((suggestion, i) => (
              <button
                key={i}
                onMouseDown={() => handleSuggestionClick(suggestion)}
                className="flex items-center gap-3 w-full px-5 py-3 text-left hover:bg-accent/30 transition-colors text-secondary-foreground"
              >
                <Search className="w-4 h-4 text-muted-foreground" />
                <span>{suggestion}</span>
                <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
