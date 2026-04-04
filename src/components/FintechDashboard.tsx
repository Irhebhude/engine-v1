import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, RefreshCw, DollarSign, BarChart3, Activity, Atom, Brain, Shield, Rocket } from "lucide-react";

interface MarketData {
  symbol: string;
  name: string;
  price: string;
  change: number;
  category: string;
}

interface ApiEndpoint {
  key: string;
  label: string;
  url: string;
  icon: typeof Atom;
  description: string;
  dataKey: string;
}

const LIVE_ENDPOINTS: ApiEndpoint[] = [
  {
    key: "crypto",
    label: "Crypto Markets",
    url: "https://api.coingecko.com/api/v3/ping",
    icon: Shield,
    description: "CoinGecko Live",
    dataKey: "gecko_says",
  },
  {
    key: "space",
    label: "Space Intel",
    url: "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY",
    icon: Rocket,
    description: "NASA APOD",
    dataKey: "title",
  },
  {
    key: "exchange",
    label: "FX Rates",
    url: "https://api.exchangerate-api.com/v4/latest/USD",
    icon: DollarSign,
    description: "Exchange Rates",
    dataKey: "provider",
  },
  {
    key: "neural",
    label: "Neural Net",
    url: "https://huggingface.co/api/models?limit=1&sort=downloads&direction=-1",
    icon: Brain,
    description: "HuggingFace Models",
    dataKey: "modelId",
  },
];

interface ApiStatus {
  status: "online" | "offline" | "loading";
  latency?: number;
  snippet?: string;
}

const FintechDashboard = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [apiStatus, setApiStatus] = useState<Record<string, ApiStatus>>({});

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      const resp = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=ngn&order=market_cap_desc&per_page=8&page=1&sparkline=false"
      );
      if (resp.ok) {
        const data = await resp.json();
        setMarketData(
          data.map((coin: any) => ({
            symbol: coin.symbol.toUpperCase(),
            name: coin.name,
            price: `₦${Number(coin.current_price).toLocaleString()}`,
            change: coin.price_change_percentage_24h || 0,
            category: "Crypto",
          }))
        );
      }
    } catch {
      setMarketData([
        { symbol: "BTC", name: "Bitcoin", price: "₦105,200,000", change: 2.4, category: "Crypto" },
        { symbol: "ETH", name: "Ethereum", price: "₦5,800,000", change: -1.2, category: "Crypto" },
        { symbol: "BNB", name: "BNB", price: "₦450,000", change: 0.8, category: "Crypto" },
        { symbol: "SOL", name: "Solana", price: "₦280,000", change: 5.1, category: "Crypto" },
      ]);
    }
    setLoading(false);
    setLastUpdate(new Date());
  };

  const checkApiStatus = async () => {
    const initialStatus: Record<string, ApiStatus> = {};
    LIVE_ENDPOINTS.forEach((ep) => {
      initialStatus[ep.key] = { status: "loading" };
    });
    setApiStatus(initialStatus);

    const results = await Promise.allSettled(
      LIVE_ENDPOINTS.map(async (ep) => {
        const start = performance.now();
        const ctrl = new AbortController();
        const timeout = setTimeout(() => ctrl.abort(), 8000);
        try {
          const resp = await fetch(ep.url, { signal: ctrl.signal });
          clearTimeout(timeout);
          const latency = Math.round(performance.now() - start);
          let snippet = "";
          if (resp.ok) {
            try {
              const json = await resp.json();
              if (Array.isArray(json) && json.length > 0) {
                snippet = json[0]?.modelId || json[0]?.id || "Connected";
              } else {
                snippet = json[ep.dataKey] || json?.title || "Connected";
              }
              if (typeof snippet === "string" && snippet.length > 40) {
                snippet = snippet.slice(0, 37) + "…";
              }
            } catch {
              snippet = "Connected";
            }
          }
          return { key: ep.key, status: resp.ok ? "online" : "offline", latency, snippet } as { key: string } & ApiStatus;
        } catch {
          clearTimeout(timeout);
          return { key: ep.key, status: "offline", latency: undefined, snippet: "" } as { key: string } & ApiStatus;
        }
      })
    );

    const newStatus: Record<string, ApiStatus> = {};
    results.forEach((r) => {
      if (r.status === "fulfilled") {
        const { key, ...rest } = r.value;
        newStatus[key] = rest;
      }
    });
    setApiStatus(newStatus);
  };

  useEffect(() => {
    fetchMarketData();
    checkApiStatus();
    const interval = setInterval(() => {
      fetchMarketData();
      checkApiStatus();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass rounded-2xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Fintech Intelligence</h3>
        </div>
        <button
          onClick={() => { fetchMarketData(); checkApiStatus(); }}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors touch-manipulation"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          {lastUpdate.toLocaleTimeString()}
        </button>
      </div>

      {/* Market Data Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
        {marketData.slice(0, 8).map((item) => (
          <div key={item.symbol} className="bg-secondary/50 rounded-xl p-3 hover:bg-secondary/70 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-foreground">{item.symbol}</span>
              {item.change >= 0 ? (
                <TrendingUp className="w-3 h-3 text-green-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-400" />
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{item.name}</p>
            <p className="text-sm font-semibold text-foreground mt-1">{item.price}</p>
            <p className={`text-xs font-medium mt-0.5 ${item.change >= 0 ? "text-green-400" : "text-red-400"}`}>
              {item.change >= 0 ? "+" : ""}{item.change.toFixed(2)}%
            </p>
          </div>
        ))}
      </div>

      {/* Live API Status */}
      <div className="border-t border-border/30 pt-3">
        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
          <Activity className="w-3 h-3" />
          Live API Endpoints
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {LIVE_ENDPOINTS.map((ep) => {
            const s = apiStatus[ep.key];
            const Icon = ep.icon;
            return (
              <div key={ep.key} className="flex items-center gap-2 bg-secondary/30 rounded-lg px-3 py-2">
                <Icon className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        s?.status === "online"
                          ? "bg-green-400 shadow-[0_0_6px_hsl(142,70%,50%)] animate-pulse"
                          : s?.status === "loading"
                          ? "bg-yellow-400 animate-pulse"
                          : "bg-red-400 shadow-[0_0_6px_hsl(0,70%,50%)] animate-pulse"
                      }`}
                    />
                    <span className="text-xs font-medium text-foreground truncate">{ep.label}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {s?.status === "loading"
                      ? "Connecting…"
                      : s?.status === "online"
                      ? `${s.snippet || "OK"} • ${s.latency}ms`
                      : "Unreachable"}
                  </p>
                </div>
                <span className={`text-[10px] font-semibold uppercase ${
                  s?.status === "online" ? "text-green-400" : s?.status === "loading" ? "text-yellow-400" : "text-red-400"
                }`}>
                  {s?.status || "…"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FintechDashboard;
