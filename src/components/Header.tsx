import { Link, useLocation } from "react-router-dom";
import { Zap } from "lucide-react";

const Header = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

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

        <nav className="flex items-center gap-6 text-sm">
          <span className="text-muted-foreground hidden sm:block">
            by <span className="text-foreground font-medium">POI Foundation</span>
          </span>
        </nav>
      </div>
    </header>
  );
};

export default Header;
