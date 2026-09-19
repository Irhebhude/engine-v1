import { useState, useRef, useEffect } from "react";
import { Search, ArrowRight } from "lucide-react";
import SearchAutocomplete from "@/components/SearchAutocomplete";
import VoiceSearchButton from "@/components/VoiceSearchButton";
import { Button } from "@/components/ui/button";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  useEffect(() => {
    if (!compact) inputRef.current?.focus();
  }, [compact]);

  return (
    <div className="relative w-full max-w-3xl mx-auto min-w-0">
      <form onSubmit={handleSubmit}>
        <div
          className={`search-glow relative flex items-center gap-2 glass rounded-2xl border-border/80 transition-all duration-300 min-w-0 ${
            compact ? "px-3 py-2" : "p-1.5 sm:p-2"
          } ${isFocused ? "glow-border" : ""}`}
        >
          <Search className="w-5 h-5 text-primary shrink-0 ml-2" />
          <VoiceSearchButton onTranscript={(text) => { setQuery(text); onSearch(text); }} />
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
            placeholder="Ask SEARCH-POI anything"
            className={`min-w-0 flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-sans ${
              compact ? "text-base" : "text-lg"
            }`}
          />
          {isLoading ? (
            <div className="mr-3 w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <Button
              type="submit"
              disabled={!query.trim()}
              size="icon"
              className="h-12 w-12 shrink-0 rounded-xl"
              aria-label="Search"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
          )}
        </div>
      </form>

      <SearchAutocomplete
        query={query}
        isOpen={showSuggestions}
        onSelect={handleSuggestionSelect}
        onClose={() => setShowSuggestions(false)}
      />
    </div>
  );
};

export default SearchBar;
