import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Users, Fingerprint, Radio, Archive, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";

export const ANALYTICS_ADMIN_EMAIL = "poifoundationunlimited@gmail.com";

type Stats = {
  registered_users: number; unique_visitors: number; live_sessions: number;
  legacy_users: number; legacy_visitors: number; tracking_started_at: string;
};

const VisitorAnalytics = () => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isAdmin = user?.email?.toLowerCase() === ANALYTICS_ADMIN_EMAIL;

  const load = async () => {
    setBusy(true);
    const { data, error } = await supabase.rpc("get_visitor_analytics");
    if (error) setError(error.message);
    else { setError(""); setStats((data as Stats[])?.[0] ?? null); }
    setBusy(false);
  };

  useEffect(() => {
    if (!isAdmin) return;
    load();
    const t = window.setInterval(load, 30_000);
    return () => window.clearInterval(t);
  }, [isAdmin]);

  if (authLoading) return null;
  if (!isAdmin) return <Navigate to="/" replace />;

  const cards = [
    { icon: Users, label: "Total Registered Users", value: stats?.registered_users, note: "Unique accounts" },
    { icon: Fingerprint, label: "Total Unique Visitors", value: stats?.unique_visitors, note: "Devices not signed in" },
    { icon: Radio, label: "Live Active Sessions", value: stats?.live_sessions, note: "Devices active in last 2 min" },
    { icon: Archive, label: "Legacy Data", value: stats ? stats.legacy_users + stats.legacy_visitors : undefined,
      note: stats ? `Users before ${new Date(stats.tracking_started_at).toLocaleDateString()}: ${stats.legacy_users} · visitors: ${stats.legacy_visitors}` : "" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SEOHead title="Visitor Analytics — SEARCH-POI" description="Admin-only analytics" path="/admin/analytics" />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Visitor <span className="text-primary">Analytics</span></h1>
          <Button variant="outline" onClick={load} disabled={busy} className="min-h-12">
            <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((c) => (
            <div key={c.label} className="rounded-2xl border border-border/40 bg-card p-6">
              <c.icon className="mb-3 h-6 w-6 text-primary" />
              <div className="text-4xl font-bold text-foreground">{c.value ?? "—"}</div>
              <div className="mt-1 font-medium text-foreground">{c.label}</div>
              <div className="mt-1 text-xs text-muted-foreground">{c.note}</div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-muted-foreground">One device = one visitor. Refreshes and repeat visits from the same device are never counted twice.</p>
      </main>
    </div>
  );
};

export default VisitorAnalytics;
