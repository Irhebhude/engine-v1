import { useState, useRef } from "react";
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

  return (
    <div className="relative w-full max-w-3xl mx-auto min-w-0">
      <form onSubmit={handleSubmit}>
        <div
          className={`search-glow relative flex min-h-[72px] items-center gap-2 bg-card/75 backdrop-blur-xl rounded-[24px] border border-border/80 transition-all duration-300 min-w-0 ${
            compact ? "px-3 py-2" : "p-2 sm:min-h-[82px] sm:p-3"
          } ${isFocused ? "glow-border" : ""}`}
        >
          <Search className="ml-2 h-6 w-6 shrink-0 text-primary" />
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
            placeholder="Ask anything..."
            className={`min-w-0 flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-sans ${
              compact ? "text-base" : "text-base sm:text-xl"
            }`}
          />
          {isLoading ? (
            <div className="mr-3 w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <Button
              type="submit"
              disabled={!query.trim()}
              size="icon"
              className="h-14 w-14 shrink-0 rounded-2xl sm:w-28"
              aria-label="Search"
            >
              <ArrowRight className="h-5 w-5" />
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
