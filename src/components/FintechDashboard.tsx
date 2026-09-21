import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, RefreshCw, DollarSign, BarChart3, Activity, Rocket, Brain, Shield, ExternalLink, Star, Download } from "lucide-react";

interface MarketData {
  symbol: string;
  name: string;
  price: string;
  change: number;
  category: string;
}

interface ApiStatus {
  status: "online" | "offline" | "loading";
  latency?: number;
  snippet?: string;
}

interface NasaApod {
  title: string;
  explanation: string;
  url: string;
  media_type: string;
  date: string;
}

interface HFModel {
  modelId: string;
  downloads: number;
  likes: number;
  pipeline_tag?: string;
}

interface SpaceWeatherEvent {
  messageType: string;
  messageBody: string;
}

const FintechDashboard = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [apiStatus, setApiStatus] = useState<Record<string, ApiStatus>>({});
  const [nasaApod, setNasaApod] = useState<NasaApod | null>(null);
  const [hfModels, setHfModels] = useState<HFModel[]>([]);
  const [spaceWeather, setSpaceWeather] = useState<string | null>(null);

  const NASA_KEY = "FUdXxV5mVP0YhOaOHG1oAHEMJkXX0Ye9V7tXydDA";

  const fetchAllData = async () => {
    setLoading(true);

    // Fetch all in parallel
    const [marketRes, nasaRes, nasaWeatherRes, hfRes, pingRes, fxRes] = await Promise.allSettled([
      // Market data
      fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=ngn&order=market_cap_desc&per_page=8&page=1&sparkline=false"),
      // NASA APOD
      fetch(`https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}`),
      // NASA DONKI (space weather)
      fetch(`https://api.nasa.gov/DONKI/notifications?startDate=${new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0]}&type=all&api_key=${NASA_KEY}`),
      // HuggingFace trending
      fetch("https://huggingface.co/api/models?limit=6&sort=downloads&direction=-1"),
      // CoinGecko ping
      fetch("https://api.coingecko.com/api/v3/ping"),
      // FX rates
      fetch("https://api.exchangerate-api.com/v4/latest/USD"),
    ]);

    // Process market data
    if (marketRes.status === "fulfilled" && marketRes.value.ok) {
      try {
        const data = await marketRes.value.json();
        setMarketData(data.map((coin: any) => ({
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          price: `₦${Number(coin.current_price).toLocaleString()}`,
          change: coin.price_change_percentage_24h || 0,
          category: "Crypto",
        })));
      } catch { /* fallback */ }
    }

    // Process NASA APOD
    if (nasaRes.status === "fulfilled" && nasaRes.value.ok) {
      try { setNasaApod(await nasaRes.value.json()); } catch {}
    }

    // Process space weather
    if (nasaWeatherRes.status === "fulfilled" && nasaWeatherRes.value.ok) {
      try {
        const events = await nasaWeatherRes.value.json();
        if (Array.isArray(events) && events.length > 0) {
          const latest = events[0];
          const body = latest.messageBody || "";
          setSpaceWeather(body.length > 120 ? body.slice(0, 117) + "…" : body);
        } else {
          setSpaceWeather("No active alerts — conditions nominal.");
        }
      } catch { setSpaceWeather(null); }
    }

    // Process HuggingFace
    if (hfRes.status === "fulfilled" && hfRes.value.ok) {
      try {
        const models = await hfRes.value.json();
        setHfModels(models.slice(0, 6));
      } catch {}
    }

    // Build API status
    const newStatus: Record<string, ApiStatus> = {};
    const checkResult = (key: string, res: PromiseSettledResult<Response>, label: string) => {
      if (res.status === "fulfilled") {
        newStatus[key] = { status: res.value.ok ? "online" : "offline", latency: 0, snippet: label };
      } else {
        newStatus[key] = { status: "offline", snippet: label };
      }
    };
    checkResult("crypto", pingRes, "CoinGecko Live");
    checkResult("space", nasaRes, "NASA Connected");
    checkResult("exchange", fxRes, "ExchangeRate OK");
    checkResult("neural", hfRes, "HuggingFace OK");
    setApiStatus(newStatus);

    setLoading(false);
    setLastUpdate(new Date());
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-[30px] border border-primary/25 bg-card/55 p-5 shadow-[0_0_32px_hsl(var(--primary)/0.06)] sm:p-8">
      <div className="mb-7 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-7 w-7 text-primary" />
          <h3 className="font-display text-xl font-semibold text-foreground sm:text-2xl">Fintech Intelligence</h3>
          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-primary/20 text-primary">LIVE</span>
        </div>
        <button
          onClick={fetchAllData}
          className="flex min-h-12 items-center gap-2 rounded-full px-3 text-xs text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary touch-manipulation"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          {lastUpdate.toLocaleTimeString()}
        </button>
      </div>

      {/* Market Data Grid */}
      <div className="mb-9 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {marketData.slice(0, 8).map((item) => (
          <div key={item.symbol} className="min-h-[168px] rounded-2xl border border-border/40 bg-secondary/45 p-4 transition-colors hover:border-primary/25 hover:bg-secondary/65 sm:p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-base font-bold text-foreground">{item.symbol}</span>
              {item.change >= 0 ? (
                <TrendingUp className="w-3 h-3 text-[hsl(142,70%,50%)]" />
              ) : (
                <TrendingDown className="w-3 h-3 text-destructive" />
              )}
            </div>
             <p className="mt-2 truncate text-sm text-muted-foreground">{item.name}</p>
             <p className="mt-4 break-words text-lg font-semibold text-foreground sm:text-xl">{item.price}</p>
             <p className={`mt-1 text-sm font-medium ${item.change >= 0 ? "text-[hsl(142,70%,50%)]" : "text-destructive"}`}>
              {item.change >= 0 ? "+" : ""}{item.change.toFixed(2)}%
            </p>
          </div>
        ))}
      </div>

      {/* NASA Space Intelligence */}
      <div className="mb-9 border-t border-border/50 pt-8">
        <div className="mb-5 flex items-center gap-3">
          <Rocket className="h-6 w-6 text-primary" />
          <span className="font-display text-xl font-semibold text-foreground">Space Intelligence</span>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          {/* APOD card */}
          {nasaApod && (
            <div className="rounded-2xl border border-border/40 bg-secondary/30 p-4 sm:p-5">
              <p className="mb-3 text-xs uppercase text-muted-foreground">NASA Astronomy Picture</p>
              {nasaApod.media_type === "image" && (
                <img src={nasaApod.url} alt={nasaApod.title} className="mb-4 aspect-[16/8] w-full rounded-xl object-cover" />
              )}
              <p className="text-lg font-semibold text-foreground">{nasaApod.title}</p>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{nasaApod.explanation}</p>
              <p className="mt-3 text-sm text-primary">{nasaApod.date}</p>
            </div>
          )}
          {/* Space weather card */}
          <div className="min-h-[220px] rounded-2xl border border-border/40 bg-secondary/30 p-5">
            <p className="mb-4 text-xs uppercase text-muted-foreground">Space Weather Alert</p>
            <p className="text-sm leading-relaxed text-foreground">
              {spaceWeather || "Checking space conditions…"}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <span className="w-2 h-2 rounded-full bg-[hsl(142,70%,50%)] animate-pulse" />
              <span className="text-[10px] text-muted-foreground">DONKI • Real-time monitoring</span>
            </div>
          </div>
        </div>
      </div>

      {/* HuggingFace Trending AI Models */}
      <div className="mb-9 border-t border-border/50 pt-8">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <Brain className="h-6 w-6 text-primary" />
          <span className="font-display text-xl font-semibold text-foreground">Trending AI Models</span>
          <span className="text-sm text-muted-foreground">via HuggingFace</span>
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {hfModels.map((model) => (
            <a
              key={model.modelId}
              href={`https://huggingface.co/${model.modelId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex min-h-[92px] items-start gap-3 rounded-2xl border border-border/30 bg-secondary/30 p-4 transition-colors hover:border-primary/25 hover:bg-secondary/50"
            >
              <Brain className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground transition-colors group-hover:text-primary sm:text-base">
                  {model.modelId}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                    <Download className="w-2.5 h-2.5" />
                    {model.downloads ? (model.downloads > 1e6 ? `${(model.downloads / 1e6).toFixed(1)}M` : `${(model.downloads / 1e3).toFixed(0)}K`) : "—"}
                  </span>
                  <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                    <Star className="w-2.5 h-2.5" />
                    {model.likes || 0}
                  </span>
                  {model.pipeline_tag && (
                    <span className="text-[9px] px-1 py-0.5 rounded bg-primary/10 text-primary">{model.pipeline_tag}</span>
                  )}
                </div>
              </div>
              <ExternalLink className="w-3 h-3 text-muted-foreground/50 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
        </div>
      </div>

      {/* Live API Status */}
      <div className="border-t border-border/50 pt-8">
        <p className="mb-4 flex items-center gap-2 text-base text-muted-foreground">
          <Activity className="h-5 w-5" />
          Live API Endpoints
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { key: "crypto", label: "Crypto Markets", icon: Shield },
            { key: "space", label: "Space Intel", icon: Rocket },
            { key: "exchange", label: "FX Rates", icon: DollarSign },
            { key: "neural", label: "Neural Net", icon: Brain },
          ].map((ep) => {
            const s = apiStatus[ep.key];
            const Icon = ep.icon;
            return (
              <div key={ep.key} className="flex min-h-[64px] items-center gap-3 rounded-xl border border-border/30 bg-secondary/30 px-4 py-3">
                <Icon className="h-5 w-5 shrink-0 text-primary" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        s?.status === "online"
                          ? "bg-[hsl(142,70%,50%)] shadow-[0_0_6px_hsl(142,70%,50%)] animate-pulse"
                          : s?.status === "loading"
                          ? "bg-yellow-400 animate-pulse"
                          : "bg-destructive shadow-[0_0_6px_hsl(0,70%,50%)] animate-pulse"
                      }`}
                    />
                    <span className="truncate text-xs font-medium text-foreground sm:text-sm">{ep.label}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Engine branding */}
      <div className="mt-3 pt-2 border-t border-border/20 text-center">
        <span className="text-[10px] text-muted-foreground">
          Powered by <span className="text-primary font-semibold">SEARCH-POI Engine v1</span> • Real-time Intelligence Layer
        </span>
      </div>
    </div>
  );
};

export default FintechDashboard;
