import { useEffect, useState } from "react";
import { Wifi, WifiOff, RefreshCw, Database } from "lucide-react";
import { seedIfEmpty, poiCount, lastSync, syncPOIs } from "@/lib/offline-db";
import { Button } from "@/components/ui/button";

const REMOTE_DATASET =
  "https://raw.githubusercontent.com/poi-foundation/poi-open-data/main/nigeria-pois.json";

const OfflineStatusBar = () => {
  const [online, setOnline] = useState(navigator.onLine);
  const [count, setCount] = useState(0);
  const [synced, setSynced] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);

  const refresh = async () => {
    setCount(await poiCount());
    setSynced(await lastSync());
  };

  useEffect(() => {
    seedIfEmpty().then(refresh);
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const n = await syncPOIs(REMOTE_DATASET);
      setCount(n);
      setSynced(Date.now());
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs min-w-0 ${
        online
          ? "bg-primary/5 border-primary/20 text-primary"
          : "bg-[hsl(38,92%,50%)]/10 border-[hsl(38,92%,50%)]/30 text-[hsl(38,92%,60%)]"
      }`}
    >
      {online ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
      <span className="font-medium truncate">
        {online ? "Offline ready" : "Offline · local index"}
      </span>
      <span className="hidden xs:flex items-center gap-1 text-muted-foreground whitespace-nowrap">
        <Database className="w-3 h-3" />
        {count} POIs
      </span>
      {synced && (
        <span className="text-muted-foreground hidden sm:inline">
          · synced {new Date(synced).toLocaleString()}
        </span>
      )}
      <Button
        onClick={handleSync}
        disabled={syncing || !online}
        variant="ghost"
        size="sm"
        className="ml-auto h-9 shrink-0 px-2 text-foreground"
      >
        <RefreshCw className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} />
        <span className="hidden sm:inline">{syncing ? "Syncing…" : "Sync now"}</span>
      </Button>
    </div>
  );
};

export default OfflineStatusBar;
