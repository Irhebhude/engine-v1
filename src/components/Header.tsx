import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Zap, Clock } from "lucide-react";
import SearchHistory from "@/components/SearchHistory";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showHistory, setShowHistory] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30">
      <div className="container mx-auto flex items-center justify-between h-14 px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-lg text-foreground">
            SEARCH<span className="text-primary">-POI</span>
          </span>
        </Link>

        <nav className="flex items-center gap-4 text-sm relative">
          <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors hidden sm:inline">About</Link>
          <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors hidden sm:inline">Contact</Link>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            title="Search History"
          >
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
          </button>
          {showHistory && (
            <div className="absolute right-0 top-full mt-2 w-80">
              <SearchHistory
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
                onSelect={(q) => {
                  setShowHistory(false);
                  navigate(`/search?q=${encodeURIComponent(q)}`);
                }}
              />
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
