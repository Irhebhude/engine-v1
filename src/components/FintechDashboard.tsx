import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, RefreshCw, DollarSign, BarChart3, Activity } from "lucide-react";

interface MarketData {
  symbol: string;
  name: string;
  price: string;
  change: number;
  category: string;
}

const ENDPOINTS = {
  quantum: "https://quantum.cybertron.ai/api/v1/compute",
  neuromorphic: "https://neuromorphic.cybertronsecurity.com/api/v1/neuralnet",
  crypto: "https://cryptography.cybertronsecurity.ai/api/v1/encrypt",
  alien: "https://zorvath.aliens.tech/api/v1/gravitywaves",
};

const FintechDashboard = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [apiStatus, setApiStatus] = useState<Record<string, "online" | "offline">>({});

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      // Fetch real crypto data from CoinGecko (no API key needed)
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
      // Fallback data
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
    const status: Record<string, "online" | "offline"> = {};
    for (const [key, url] of Object.entries(ENDPOINTS)) {
      try {
        const ctrl = new AbortController();
        setTimeout(() => ctrl.abort(), 3000);
        await fetch(url, { method: "HEAD", signal: ctrl.signal });
        status[key] = "online";
      } catch {
        status[key] = "offline";
      }
    }
    setApiStatus(status);
  };

  useEffect(() => {
    fetchMarketData();
    checkApiStatus();
    const interval = setInterval(fetchMarketData, 60000);
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
          onClick={fetchMarketData}
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

      {/* API Status Indicators */}
      <div className="border-t border-border/30 pt-3">
        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
          <Activity className="w-3 h-3" />
          Advanced API Endpoints
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(ENDPOINTS).map(([key]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  apiStatus[key] === "online"
                    ? "bg-green-400 shadow-[0_0_4px_hsl(120,60%,50%)]"
                    : "bg-muted-foreground/50"
                }`}
              />
              <span className="text-muted-foreground capitalize">{key}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FintechDashboard;
