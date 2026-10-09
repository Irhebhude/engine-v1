import { useEffect, useState } from "react";
import { TrendingUp, Fuel, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const LIVE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/live-data`;
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const CACHE_KEY = "searchpoi_live_data";

const HIGHLIGHT = ["NGN", "GHS", "KES", "ZAR", "EUR", "GBP", "CNY", "INR"];

interface LiveData {
  fetchedAt: string;
  fx: { rates: Record<string, number>; updated: string | null } | null;
  fuel: { items: { country: string; product: string; price: string }[] } | null;
}

const LiveRates = () => {
  const [data, setData] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(LIVE_URL, { headers: { Authorization: `Bearer ${KEY}` } });
      if (!res.ok) throw new Error("failed");
      const json = await res.json();
      setData(json);
      setOffline(false);
      localStorage.setItem(CACHE_KEY, JSON.stringify(json));
    } catch {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        setData(JSON.parse(cached));
        setOffline(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const rates = data?.fx?.rates;
  const fuel = data?.fuel?.items?.slice(0, 6) ?? [];

  return (
    <div className="rounded-[30px] border border-border/70 bg-card/55 p-5 sm:p-8">
      <div className="mb-7 flex items-center gap-3">
        <TrendingUp className="h-6 w-6 text-primary" />
        <h3 className="font-display text-xl font-semibold text-foreground sm:text-2xl">Live Rates &amp; Prices</h3>
        <Button
          onClick={load}
          variant="ghost"
          size="icon"
          className="ml-auto h-12 w-12 rounded-full"
          aria-label="Refresh live rates"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {!rates && !loading && (
        <p className="text-sm text-muted-foreground">Live rates unavailable right now.</p>
      )}

      {rates && (
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {HIGHLIGHT.filter((c) => rates[c] != null).map((c) => (
            <div key={c} className="min-h-[104px] rounded-2xl border border-border/40 bg-secondary/40 p-4">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">USD → {c}</p>
              <p className="mt-3 break-words font-mono text-lg font-semibold text-foreground">
                {rates[c].toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
          ))}
        </div>
      )}

      {fuel.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Fuel className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Fuel prices</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {fuel.map((f, i) => (
              <div key={i} className="min-h-[72px] rounded-xl border border-border/30 bg-secondary/30 px-4 py-3">
                <p className="text-[11px] text-muted-foreground truncate">{f.country}</p>
                <p className="text-xs font-mono text-foreground">{f.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground mt-3">
        {offline ? "Showing last cached values (offline)." : "Free public data sources · no API key required."}
        {data?.fetchedAt && ` As of ${new Date(data.fetchedAt).toLocaleString()}.`}
      </p>
    </div>
  );
};

export default LiveRates;
