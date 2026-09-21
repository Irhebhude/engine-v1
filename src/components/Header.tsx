import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Brain, Clock, Code, Database, Gift, GraduationCap, Home, Image,
  LocateFixed, LogOut, Menu, Radio, RefreshCw, Search, Shield, Star, Trophy,
  User, Video, Wifi, X, TrendingUp,
} from "lucide-react";
import SearchHistory from "@/components/SearchHistory";
import LiteModeToggle from "@/components/LiteModeToggle";
import POIPointsBadge from "@/components/POIPointsBadge";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { seedIfEmpty, syncPOIs } from "@/lib/offline-db";

const ADMIN_EMAIL = "prosperozoya50@gmail.com";
const REMOTE_DATASET = "https://raw.githubusercontent.com/poi-foundation/poi-open-data/main/nigeria-pois.json";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [now, setNow] = useState(new Date());
  const [gpsStatus, setGpsStatus] = useState("Locating you…");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    seedIfEmpty();
    const clock = window.setInterval(() => setNow(new Date()), 1000);
    if (!navigator.geolocation) setGpsStatus("Location unavailable");
    else {
      const watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          setGpsStatus("GPS Ready");
          const { latitude, longitude } = pos.coords;
          setCoords({ lat: latitude, lon: longitude });
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
              { headers: { Accept: "application/json" } },
            );
            const data = await res.json();
            const a = data?.address ?? {};
            const parts = [
              a.road || a.pedestrian || a.neighbourhood,
              a.suburb || a.village || a.town || a.city_district,
              a.city || a.county,
              a.state,
              a.country,
            ].filter(Boolean);
            setAddress(parts.length ? parts.join(", ") : data?.display_name || "");
          } catch {
            setAddress("");
          }
        },
        () => setGpsStatus("Location permission needed"),
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
      );
      return () => { window.clearInterval(clock); navigator.geolocation.clearWatch(watchId); };
    }
    return () => window.clearInterval(clock);
  }, []);

  const syncLiveData = async () => {
    setSyncing(true);
    try { await syncPOIs(REMOTE_DATASET); }
    finally { setSyncing(false); setNow(new Date()); }
  };

  const watTime = new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos", dateStyle: "long", timeStyle: "medium",
  }).format(now);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className="relative z-50 border-b border-border/70 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-8">
          <Link to="/" className="flex items-center gap-3">
            <img src="/pwa-icon.png" alt="SEARCH-POI" className="h-10 w-10 rounded-xl border border-primary/30 object-cover" />
            <span className="font-display text-lg font-bold text-foreground sm:text-xl">SEARCH<span className="text-primary">-POI</span></span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setMenuOpen(true)} aria-label="Open navigation" className="h-12 w-12 rounded-full border border-border/70 text-foreground hover:border-primary/40 hover:bg-primary/10">
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        <div className="border-t border-border/40 bg-accent/20">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-8">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <div className="flex items-center gap-2 font-medium text-primary"><Wifi className="h-4 w-4" /> Mode: Live Data</div>
              <span className="hidden text-border sm:inline">—</span>
              <div className="flex items-center gap-2 text-primary"><LocateFixed className="h-4 w-4" /> {gpsStatus === "GPS Ready" ? "GPS Ready" : "GPS Active"}</div>
              <Button onClick={syncLiveData} disabled={syncing} variant="outline" size="sm" className="ml-auto h-10 rounded-full border-primary/30 bg-background/50 px-4 text-primary hover:bg-primary/10">
                <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} /> {syncing ? "Syncing…" : "Sync Now"}
              </Button>
            </div>
            <div className="mt-3 grid gap-2 border-t border-border/40 pt-3 text-xs text-muted-foreground sm:grid-cols-2 sm:text-sm">
              <div className="flex min-w-0 items-center gap-2"><Database className="h-4 w-4 shrink-0 text-primary" /><span className="truncate">Live Data: {watTime} WAT</span></div>
              <div className="flex items-center gap-2 sm:justify-end"><Radio className="h-4 w-4 text-primary" /><span>Live GPS</span><span className="text-border">|</span><span>{gpsStatus}</span></div>
            </div>
          </div>
        </div>
      </header>

      <Button onClick={() => setMenuOpen(true)} size="icon" aria-label="Open menu" className="fixed bottom-5 left-5 z-[70] h-16 w-16 rounded-full border border-primary/50 bg-primary text-primary-foreground shadow-[0_0_32px_hsl(var(--primary)/0.38)] hover:bg-primary/90 sm:bottom-8 sm:left-8 sm:h-[72px] sm:w-[72px]">
        <Menu className="h-7 w-7" />
      </Button>

      {menuOpen && (
        <div className="fixed inset-0 z-[80] bg-background/85 backdrop-blur-xl" onClick={closeMenu}>
          <div className="absolute inset-y-3 right-3 w-[min(92vw,440px)] overflow-y-auto rounded-2xl border border-primary/20 bg-card p-5 shadow-[0_0_42px_hsl(var(--primary)/0.12)] sm:inset-y-6 sm:right-6 sm:p-7" onClick={(event) => event.stopPropagation()}>
            <div className="mb-7 flex items-center justify-between">
              <div className="flex items-center gap-3"><img src="/pwa-icon.png" alt="" className="h-10 w-10 rounded-xl" /><strong className="font-display text-lg">SEARCH<span className="text-primary">-POI</span></strong></div>
              <Button variant="ghost" size="icon" onClick={closeMenu} aria-label="Close navigation" className="h-12 w-12 rounded-full"><X className="h-6 w-6" /></Button>
            </div>
            <p className="workspace-label mb-3">Navigate</p>
            <div className="mb-7 grid grid-cols-2 gap-2">
              <Link to="/" onClick={closeMenu} className="flex min-h-12 items-center gap-2 rounded-lg bg-primary/10 px-3 text-primary font-medium"><Home className="h-4 w-4" /> Home</Link>
              {NAV_LINKS.map((link) => <Link key={link.to} to={link.to} onClick={closeMenu} className="flex min-h-12 items-center rounded-lg bg-secondary/60 px-3 text-muted-foreground hover:text-foreground">{link.label}</Link>)}
              <Link to="/referral" onClick={closeMenu} className="flex min-h-12 items-center gap-2 rounded-lg bg-secondary/60 px-3 text-primary"><Gift className="h-4 w-4" /> Refer & Earn</Link>
              <Link to="/developer" onClick={closeMenu} className="flex min-h-12 items-center gap-2 rounded-lg bg-secondary/60 px-3 text-muted-foreground"><Code className="h-4 w-4" /> Developer API</Link>
            </div>
            <p className="workspace-label mb-3">Search modes</p>
            <div className="mb-7 grid grid-cols-2 gap-2">
              {[[Search,"AI Search","default"],[Brain,"Deep Research","deep_research"],[Code,"Code","code"],[GraduationCap,"Academic","academic"],[TrendingUp,"Business","business"],[Image,"Images","images"],[Video,"Videos","videos"]].map(([Icon,label,mode]) => (
                <Link key={String(mode)} to={`/search?mode=${mode}`} onClick={closeMenu} className="flex min-h-12 items-center gap-2 rounded-lg border border-border/70 px-3 text-sm text-muted-foreground hover:border-primary/30 hover:text-foreground"><Icon className="h-4 w-4 text-primary" />{String(label)}</Link>
              ))}
            </div>
            {user?.email === ADMIN_EMAIL && <div className="mb-5 grid gap-2"><Link to="/admin" onClick={closeMenu} className="flex min-h-12 items-center gap-2 text-destructive"><Shield className="h-4 w-4" /> Admin Dashboard</Link><Link to="/admin/acquisition-control" onClick={closeMenu} className="flex min-h-12 items-center gap-2 text-primary"><Star className="h-4 w-4" /> Acquisition Control</Link></div>}
            {user && <div className="mb-4 flex items-center gap-3"><LiteModeToggle enabled={profile?.lite_mode ?? false} onToggle={() => toggleLiteMode()} />{profile && profile.poi_points > 0 && <POIPointsBadge points={profile.poi_points} />}</div>}
            <Button onClick={() => { closeMenu(); setShowHistory(true); }} variant="outline" className="mb-3 min-h-12 w-full justify-start"><Clock className="h-4 w-4" /> Search History</Button>
            {user ? <><div className="mb-2 flex min-h-12 items-center gap-2 text-muted-foreground"><User className="h-4 w-4" /><span className="truncate">{profile?.display_name || user.email}</span>{profile?.is_premium && <Trophy className="h-4 w-4 text-primary" />}</div><Button variant="ghost" onClick={() => { closeMenu(); signOut(); }} className="min-h-12 w-full justify-start"><LogOut className="h-4 w-4" /> Sign Out</Button></> : <Button asChild className="min-h-12 w-full"><Link to="/auth" onClick={closeMenu}>Sign In / Create Account</Link></Button>}
          </div>
        </div>
      )}
      {showHistory && <div className="fixed inset-0 z-[75] bg-background/80 p-4 backdrop-blur-md" onClick={() => setShowHistory(false)}><div className="mx-auto mt-20 max-w-md" onClick={(event) => event.stopPropagation()}><SearchHistory isOpen={showHistory} onClose={() => setShowHistory(false)} onSelect={(query) => { setShowHistory(false); navigate(`/search?q=${encodeURIComponent(query)}`); }} /></div></div>}
    </>
  );
};

export default Header;