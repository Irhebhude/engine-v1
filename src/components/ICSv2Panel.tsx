import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, ChevronDown, ChevronUp, Download, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WebResult } from "@/lib/search-api";
import { ICS_LAYERS, COPYRIGHT, TRADEMARK, zeroTrustGateway, auditDecision, verifyLedger, readLedger, type LedgerEntry } from "@/lib/ics-v2";
import { runValidationChain } from "@/lib/reasoning-v2";
import { runOmniSearch } from "@/omni-search-engine";
import { cacheStats } from "@/lib/platform-optimizer";

interface Props { query: string; answer: string; results: WebResult[]; isStreaming: boolean }

const ICSv2Panel = ({ query, answer, results, isStreaming }: Props) => {
  const [open, setOpen] = useState(false);
  const [entry, setEntry] = useState<LedgerEntry | null>(null);
  const [intact, setIntact] = useState<boolean | null>(null);

  const gate = useMemo(() => zeroTrustGateway(results), [results]);
  const chain = useMemo(() => runValidationChain(query, answer, gate.accepted), [query, answer, gate.accepted]);
  const omni = useMemo(() => runOmniSearch(query, gate.accepted), [query, gate.accepted]);

  useEffect(() => {
    if (isStreaming || !query || !answer) return;
    auditDecision(query, `verdict=${chain.verdict};accepted=${gate.accepted.length};blocked=${gate.blocked.length}`)
      .then(setEntry).then(verifyLedger).then(setIntact);
  }, [isStreaming, query, answer]); // eslint-disable-line react-hooks/exhaustive-deps

  const transfer = () => {
    const pkg = {
      asset: "SEARCH-POI Engine v1", owner: "Prosper Ozoya Irhebhude — POI FOUNDATION LTD",
      copyright: COPYRIGHT, trademark: TRADEMARK, generated: new Date().toISOString(),
      modules: ["ICS v2 (7-layer)", "Zero-Trust Data Gateway", "Hash-chained audit ledger", "POI Proprietary Reasoning Pipeline (12-step)", "Omni-Search Engine (11 services)", "Platform Optimizer"],
      live_url: "https://engine-v1.lovable.app", audit_ledger: readLedger(),
    };
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(pkg, null, 2)], { type: "application/json" }));
    a.download = "search-poi-transfer-package.json"; a.click();
  };

  const stats = cacheStats();
  return (
    <div className="mt-4 rounded-xl border border-primary/30 bg-card/60">
      <button onClick={() => setOpen(!open)} className="flex min-h-12 w-full items-center gap-2 px-4 text-left text-sm">
        <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
        <span className="font-semibold text-primary">ICS v2 - NEXT GENIUS - ACTIVE</span>
        <span className="hidden text-muted-foreground sm:inline">· Enterprise Fortress Mode</span>
        <span className="ml-auto text-xs text-foreground">Verdict {chain.verdict}%</span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && (
        <div className="space-y-4 border-t border-border/40 p-4 text-xs">
          <div className="flex flex-wrap gap-1.5">{ICS_LAYERS.map((l) => <span key={l} className="rounded-full border border-primary/30 px-2 py-1 text-primary"><Lock className="mr-1 inline h-3 w-3" />{l}</span>)}</div>
          <p className="text-muted-foreground">Zero-Trust Gateway: {gate.accepted.length} sources accepted, {gate.blocked.length} blocked{gate.blocked.length ? ` (${gate.blocked.map((b) => b.reason).join(", ")})` : ""}.</p>

          <div>
            <p className="mb-2 font-semibold text-foreground"><Sparkles className="mr-1 inline h-3 w-3 text-primary" />POI Proprietary Reasoning Pipeline <span className="font-normal text-muted-foreground">({chain.ms}ms)</span></p>
            <ol className="space-y-1">{chain.steps.map((s, i) => (
              <li key={s.step} className="flex gap-2"><span className="w-5 text-muted-foreground">{i + 1}.</span><span className="w-40 shrink-0 text-foreground">{s.step}</span><span className="w-10 shrink-0 text-primary">{s.score}%</span><span className="text-muted-foreground">{s.why}</span></li>
            ))}</ol>
          </div>

          <div>
            <p className="mb-2 font-semibold text-foreground">Omni-Search Engine</p>
            <div className="grid gap-1.5 sm:grid-cols-2">{omni.map((o) => <div key={o.code} className="rounded-lg bg-secondary/40 p-2"><span className="font-semibold text-primary">{o.code}</span> <span className="text-foreground">{o.name}</span><p className="text-muted-foreground">{o.tip}</p></div>)}</div>
          </div>

          <p className="text-muted-foreground">Speed cache: {stats.hits} hits / {stats.misses} misses ({stats.ratio}% saved).</p>
          {entry && <p className="break-all text-muted-foreground">Audit proof (SHA-256 chain {intact ? "verified ✓" : intact === false ? "TAMPERED ✗" : "…"}): <span className="text-foreground">{entry.hash}</span></p>}
          <div className="flex flex-wrap items-center gap-3 border-t border-border/40 pt-3">
            <Button size="sm" variant="outline" onClick={transfer} className="min-h-12"><Download className="h-4 w-4" /> Transfer Package</Button>
            <span className="text-[10px] text-muted-foreground">{COPYRIGHT} {TRADEMARK}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ICSv2Panel;
