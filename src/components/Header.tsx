import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clock, Menu, X, Gift, LogOut, User, Shield, Star, Trophy, Code, Home, Search, Brain, Image, Video, GraduationCap, TrendingUp } from "lucide-react";
import SearchHistory from "@/components/SearchHistory";
import LiteModeToggle from "@/components/LiteModeToggle";
import POIPointsBadge from "@/components/POIPointsBadge";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const ADMIN_EMAIL = "prosperozoya50@gmail.com";

const NAV_LINKS = [
  { to: "/about", label: "About" },
  { to: "/pricing", label: "Pricing" },
  { to: "/insights", label: "Insights" },
  { to: "/contact", label: "Contact" },
];

const Header = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, toggleLiteMode } = useAuth();
  const [showHistory, setShowHistory] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30">
      <div className="container mx-auto flex items-center justify-between h-14 px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/pwa-icon.png" alt="SEARCH-POI" className="h-8 w-8 rounded-lg object-cover border border-primary/30" />
          <span className="font-bold text-lg text-foreground">
            SEARCH<span className="text-primary">-POI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-3 text-sm relative">
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="text-muted-foreground hover:text-foreground transition-colors">{l.label}</Link>
          ))}

          <Link
            to="/referral"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
          >
            <Gift className="w-3.5 h-3.5" />
            Refer & Earn
          </Link>

          <Link
            to="/developer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 text-foreground hover:bg-accent/20 transition-colors font-medium"
          >
            <Code className="w-3.5 h-3.5" />
            API
          </Link>

          {user?.email === ADMIN_EMAIL && (
            <>
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors font-medium"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </Link>
              <Link
                to="/admin/acquisition-control"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(45,90%,50%)]/10 text-[hsl(45,90%,55%)] hover:bg-[hsl(45,90%,50%)]/20 transition-colors font-medium"
              >
                <Star className="w-3.5 h-3.5" />
                Acquisition
              </Link>
            </>
          )}

          {/* Lite Mode Toggle */}
          {user && (
            <LiteModeToggle
              enabled={profile?.lite_mode ?? false}
              onToggle={() => toggleLiteMode()}
            />
          )}

          {/* POI Points */}
          {profile && (
            <Link to="/points" className="flex items-center gap-1 text-xs text-[hsl(45,90%,55%)] hover:text-[hsl(45,90%,65%)] transition-colors font-medium">
              <Trophy className="w-3.5 h-3.5" />
              {profile.poi_points} pts
            </Link>
          )}

          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            title="Search History"
          >
            <Clock className="w-4 h-4" />
            <span>History</span>
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/referral" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors" title="My Profile">
                <User className="w-4 h-4" />
                <span className="max-w-[80px] truncate">{profile?.display_name || "Account"}</span>
              </Link>
              {profile?.is_premium && (
                <span className="px-1.5 py-0.5 rounded-full bg-[hsl(45,90%,50%)]/15 text-[hsl(45,90%,55%)] text-[9px] font-bold uppercase">PRO</span>
              )}
              <button
                onClick={signOut}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Sign In
            </Link>
          )}

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

        {/* Mobile hamburger */}
        <Button
          className="sm:hidden !fixed !top-auto !bottom-5 !left-5 z-[70] h-14 w-14 rounded-full shadow-[0_0_28px_hsl(var(--primary)/0.45)]"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          size="icon"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="sm:hidden fixed inset-0 z-[60] bg-background/80 backdrop-blur-md" onClick={() => setMobileOpen(false)}>
          <div className="absolute left-4 right-4 bottom-20 max-h-[72vh] overflow-y-auto workspace-panel p-4" onClick={(event) => event.stopPropagation()}>
            <p className="workspace-label mb-3">Navigate</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Link to="/" onClick={() => setMobileOpen(false)} className="flex min-h-12 items-center gap-2 rounded-lg bg-primary/10 px-3 text-primary font-medium"><Home className="w-4 h-4" /> Home</Link>
              {NAV_LINKS.map((l) => (
                <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} className="flex min-h-12 items-center rounded-lg bg-secondary/50 px-3 text-muted-foreground">{l.label}</Link>
              ))}
              <Link to="/referral" onClick={() => setMobileOpen(false)} className="flex min-h-12 items-center gap-2 rounded-lg bg-secondary/50 px-3 text-primary font-medium"><Gift className="w-4 h-4" /> Refer</Link>
              <Link to="/developer" onClick={() => setMobileOpen(false)} className="flex min-h-12 items-center gap-2 rounded-lg bg-secondary/50 px-3 text-muted-foreground"><Code className="w-4 h-4" /> API</Link>
            </div>
            <p className="workspace-label mb-3">Search modes</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                [Search, "AI Search", "default"], [Brain, "Deep Research", "deep_research"],
                [Code, "Code", "code"], [GraduationCap, "Academic", "academic"],
                [TrendingUp, "Business", "business"], [Image, "Images", "images"], [Video, "Videos", "videos"],
              ].map(([Icon, label, mode]) => (
                <Link key={String(mode)} to={`/search?mode=${mode}`} onClick={() => setMobileOpen(false)} className="flex min-h-12 items-center gap-2 rounded-lg border border-border/60 px-3 text-muted-foreground">
                  <Icon className="w-4 h-4 text-primary" /> {String(label)}
                </Link>
              ))}
            </div>
          {user?.email === ADMIN_EMAIL && (
            <>
              <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-1.5 text-destructive font-medium">
                <Shield className="w-4 h-4" /> Admin Dashboard
              </Link>
              <Link to="/admin/acquisition-control" onClick={() => setMobileOpen(false)} className="flex items-center gap-1.5 text-[hsl(45,90%,55%)] font-medium">
                <Star className="w-4 h-4" /> Acquisition Control
              </Link>
            </>
          )}
          {user && (
            <div className="flex items-center gap-2">
              <LiteModeToggle enabled={profile?.lite_mode ?? false} onToggle={() => toggleLiteMode()} />
              {profile && profile.poi_points > 0 && <POIPointsBadge points={profile.poi_points} />}
            </div>
          )}
          <Button
            onClick={() => { setMobileOpen(false); setShowHistory(!showHistory); }}
            variant="ghost"
            className="w-full justify-start min-h-12 text-muted-foreground"
          >
            <Clock className="w-4 h-4" /> History
          </Button>
          {user ? (
            <>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{profile?.display_name || user.email}</span>
                {profile?.is_premium && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[hsl(45,90%,50%)]/15 text-[hsl(45,90%,55%)] text-[9px] font-bold uppercase">PRO</span>
                )}
              </div>
              <Button variant="ghost" onClick={() => { setMobileOpen(false); signOut(); }} className="w-full justify-start min-h-12 text-muted-foreground">
                <LogOut className="w-4 h-4" /> Sign Out
              </Button>
            </>
          ) : (
            <Link to="/auth" onClick={() => setMobileOpen(false)} className="text-primary font-medium">
              Sign In / Sign Up
            </Link>
          )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
