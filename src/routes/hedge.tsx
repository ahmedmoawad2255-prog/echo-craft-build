import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { PageHeader, Section, Badge } from "@/components/ui-bits";
import { AlertTriangle, Plus, Search, ChevronRight, Link2, Upload, X } from "lucide-react";

export const Route = createFileRoute("/hedge")({ component: Hedge });

type Coverage = "full" | "partial" | "none";
type Phys = {
  id: string; commodity: string; origin: string; port: string; qty: number;
  coverage: Coverage; covered: number; ratio: number; mtm: number; pl: number;
  hedgeId: string | null; delivery: string;
};
type Hedge = {
  id: string; ref: string; exchange: "CBOT" | "MATIF"; instrument: string;
  lots: number; qty: number; refPrice: number; current: number; pl: number;
  delivery: string; physIds: string[];
};

const PHYS: Phys[] = [
  { id: "PHY-WHEAT-Q3", commodity: "Wheat", origin: "Romania", port: "Constantza", qty: 12000, coverage: "full", covered: 12000, ratio: 0.98, mtm: 158400, pl: 196875, hedgeId: "HDG-ZW-01", delivery: "Sep '24" },
  { id: "PHY-CORN-Q4", commodity: "Corn", origin: "Brazil", port: "Santos", qty: 8000, coverage: "partial", covered: 5500, ratio: 0.69, mtm: -8200, pl: -13200, hedgeId: "HDG-EMA-01", delivery: "Nov '24" },
  { id: "PHY-WHEAT-08", commodity: "Wheat", origin: "France", port: "Rouen", qty: 25000, coverage: "none", covered: 0, ratio: 0, mtm: 0, pl: 0, hedgeId: null, delivery: "Oct '24" },
  { id: "PHY-SOY-Q4", commodity: "Soybeans", origin: "USA", port: "New Orleans", qty: 10000, coverage: "full", covered: 10000, ratio: 1.0, mtm: 42100, pl: 62125, hedgeId: "HDG-ZC-01", delivery: "Dec '24" },
];

const HEDGES: Hedge[] = [
  { id: "HDG-ZW-01", ref: "ZW Sep '24", exchange: "CBOT", instrument: "Wheat", lots: 240, qty: 12000, refPrice: 642.5, current: 658.25, pl: 196875, delivery: "Sep '24", physIds: ["PHY-WHEAT-Q3"] },
  { id: "HDG-EMA-01", ref: "EMA Nov '24", exchange: "MATIF", instrument: "Corn", lots: 110, qty: 5500, refPrice: 228.75, current: 227.10, pl: -13200, delivery: "Nov '24", physIds: ["PHY-CORN-Q4"] },
  { id: "HDG-ZC-01", ref: "ZC Dec '24", exchange: "CBOT", instrument: "Soybeans", lots: 200, qty: 10000, refPrice: 485.25, current: 491.50, pl: 62125, delivery: "Dec '24", physIds: ["PHY-SOY-Q4"] },
];

const COV_COLOR: Record<Coverage, string> = {
  full: "border-success/40 bg-success/10 hover:bg-success/15",
  partial: "border-accent/40 bg-accent/10 hover:bg-accent/15",
  none: "border-destructive/40 bg-destructive/10 hover:bg-destructive/15",
};
const COV_DOT: Record<Coverage, string> = {
  full: "bg-success", partial: "bg-accent", none: "bg-destructive",
};
const COV_LABEL: Record<Coverage, string> = {
  full: "FULLY HEDGED", partial: "PARTIAL", none: "UNHEDGED",
};

const FOCUS = ["Portfolio", "Wheat", "Corn", "Soybeans", "Soymeal", "Soy Oil"] as const;
type Focus = typeof FOCUS[number];

const FOCUS_DATA: Record<Focus, { ratio: number; delta: number; uncovered: number; variance: number }> = {
  "Portfolio": { ratio: 84, delta: 1240, uncovered: 25000, variance: -1.0 },
  "Wheat": { ratio: 67, delta: 980, uncovered: 25000, variance: -3.2 },
  "Corn": { ratio: 69, delta: 240, uncovered: 2500, variance: -2.1 },
  "Soybeans": { ratio: 100, delta: 320, uncovered: 0, variance: 0.5 },
  "Soymeal": { ratio: 92, delta: 80, uncovered: 600, variance: -0.3 },
  "Soy Oil": { ratio: 88, delta: 110, uncovered: 1200, variance: -0.8 },
};

function Hedge() {
  const [selectedPhy, setSelectedPhy] = useState<string | null>("PHY-WHEAT-Q3");
  const [hover, setHover] = useState<Phys | null>(null);
  const [focus, setFocus] = useState<Focus>("Portfolio");
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [pSeries, setPSeries] = useState<"realized" | "unrealized" | "futures" | "basis">("unrealized");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof Hedge>("pl");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [exch, setExch] = useState<"All" | "CBOT" | "MATIF">("All");
  const [cbot, setCbot] = useState(0);
  const [fx, setFx] = useState(0);
  const [basis, setBasis] = useState(0);
  const [linkOpen, setLinkOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const selected = PHYS.find((p) => p.id === selectedPhy) ?? null;
  const linkedHedge = selected?.hedgeId ? HEDGES.find((h) => h.id === selected.hedgeId) : null;

  const focusD = FOCUS_DATA[focus];

  const series = useMemo(() => {
    const base: Record<typeof period, number[]> = {
      daily: [40, 55, 35, 60, 48, 70, 62, 85, 80, 78, 92, 88],
      weekly: [120, 180, 140, 220, 260, 240, 310],
      monthly: [600, 740, 820, 690, 910, 1020],
    };
    const mult = pSeries === "realized" ? 0.4 : pSeries === "futures" ? 0.7 : pSeries === "basis" ? 0.2 : 1;
    return base[period].map((v) => v * mult);
  }, [period, pSeries]);

  const filteredHedges = useMemo(() => {
    return [...HEDGES]
      .filter((h) => exch === "All" || h.exchange === exch)
      .filter((h) => !search || h.ref.toLowerCase().includes(search.toLowerCase()) || h.id.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        const av = a[sortKey] as number; const bv = b[sortKey] as number;
        return typeof av === "number" ? (av - bv) * sortDir : 0;
      });
  }, [search, sortKey, sortDir, exch]);

  const sort = (k: keyof Hedge) => {
    if (sortKey === k) setSortDir(sortDir === 1 ? -1 : 1);
    else { setSortKey(k); setSortDir(-1); }
  };

  // Stress
  const stressMtm = (h: Hedge) => Math.round(h.pl + (h.qty * cbot * 0.5) + (fx * 1500) - (basis * h.qty * 0.1));
  const totalStress = filteredHedges.reduce((s, h) => s + stressMtm(h), 0);
  const baselineTotal = filteredHedges.reduce((s, h) => s + h.pl, 0);
  const effectiveness = baselineTotal === 0 ? 0 : Math.max(0, Math.min(100, 100 - Math.abs((totalStress - baselineTotal) / Math.max(1, Math.abs(baselineTotal))) * 100));
  const residual = focusD.uncovered + Math.abs(cbot) * 200 + Math.abs(fx) * 150;

  return (
    <>
      <PageHeader
        title="Hedge Tracking"
        subtitle="Interactive mapping of physical exposures and exchange-traded hedges with live stress controls."
        actions={
          <>
            <button onClick={() => setLinkOpen(true)} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-xs font-medium hover:bg-secondary">
              <Link2 className="h-3.5 w-3.5" /> Link Physical → Hedge
            </button>
            <button onClick={() => toast.success("Settlement instructions submitted to clearing")} className="rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">⇄ Settle Positions</button>
          </>
        }
      />

      {/* Unhedged alert */}
      <div className="mb-6 flex items-center justify-between rounded-md border border-destructive/30 bg-destructive/5 p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <div>
            <div className="text-sm font-semibold text-destructive">Critical: Unhedged Exposure</div>
            <div className="text-xs text-muted-foreground">25,000 MT of Wheat (PHY-WHEAT-08) detected without exchange coverage.</div>
          </div>
        </div>
        <button onClick={() => { setSelectedPhy("PHY-WHEAT-08"); toast.success("Cover order routed: 500 ZW Sep '24 lots"); }} className="rounded-md bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90 transition-colors">Cover Now</button>
      </div>

      {/* Focus + analytics */}
      <Section
        title="Hedge Analytics"
        actions={
          <div className="flex flex-wrap gap-1">
            {FOCUS.map((f) => (
              <button
                key={f}
                onClick={() => setFocus(f)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  focus === f ? "bg-primary text-primary-foreground" : "border border-border hover:bg-secondary"
                }`}
              >{f}</button>
            ))}
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-4">
          <Metric label="Hedge Ratio" value={`${focusD.ratio}%`} tone={focusD.ratio >= 90 ? "success" : focusD.ratio >= 70 ? "warning" : "destructive"} />
          <Metric label="Delta Exposure" value={`$${focusD.delta.toLocaleString()}K`} />
          <Metric label="Uncovered Qty" value={`${focusD.uncovered.toLocaleString()} MT`} tone={focusD.uncovered > 0 ? "destructive" : "success"} />
          <Metric label="Hedge Variance" value={`${focusD.variance > 0 ? "+" : ""}${focusD.variance.toFixed(1)}%`} tone={focusD.variance >= 0 ? "success" : "destructive"} />
        </div>
      </Section>

      {/* P&L chart + Stress */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Section
          title="P&L Chart"
          actions={
            <div className="flex gap-1">
              {(["daily", "weekly", "monthly"] as const).map((p) => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`rounded-md px-2 py-1 text-[10px] font-medium uppercase transition-colors ${period === p ? "bg-primary text-primary-foreground" : "border border-border hover:bg-secondary"}`}>
                  {p}
                </button>
              ))}
            </div>
          }
        >
          <div className="mb-3 flex flex-wrap gap-1">
            {(["realized", "unrealized", "futures", "basis"] as const).map((s) => (
              <button key={s} onClick={() => setPSeries(s)}
                className={`rounded-md px-2 py-1 text-[10px] font-medium uppercase transition-colors ${pSeries === s ? "bg-accent text-accent-foreground" : "border border-border hover:bg-secondary"}`}>
                {s}
              </button>
            ))}
          </div>
          <ChartBars data={series} />
        </Section>

        <Section title="Stress Testing">
          <div className="space-y-4">
            <Slider label="CBOT Move" value={cbot} setValue={setCbot} min={-20} max={20} unit="¢" />
            <Slider label="FX Move (USD/EGP)" value={fx} setValue={setFx} min={-15} max={15} unit="%" />
            <div>
              <div className="mb-1 flex justify-between text-[11px]">
                <span className="font-medium uppercase tracking-wide text-muted-foreground">Basis Widening</span>
                <span className="font-mono-num">{basis} ¢</span>
              </div>
              <input type="number" value={basis} onChange={(e) => setBasis(Number(e.target.value) || 0)}
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm font-mono-num" />
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
              <Metric label="Effectiveness" value={`${effectiveness.toFixed(0)}%`} tone={effectiveness > 80 ? "success" : "warning"} dense />
              <Metric label="Stressed MTM" value={`$${(totalStress / 1000).toFixed(1)}K`} tone={totalStress >= 0 ? "success" : "destructive"} dense />
              <Metric label="Residual Exp." value={`${residual.toLocaleString()} MT`} tone={residual > 5000 ? "destructive" : "warning"} dense />
            </div>
          </div>
        </Section>
      </div>

      {/* Physical ↔ Futures interactive map */}
      <Section title="Physical ↔ Futures Mapping" className="mt-6"
        actions={
          <div className="flex gap-3 text-[10px] uppercase">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success" />Full</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-accent" />Partial</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive" />Unhedged</span>
          </div>
        }>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-[11px] font-semibold uppercase text-muted-foreground">Physical Contracts</div>
            {PHYS.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedPhy(p.id)}
                onMouseEnter={() => setHover(p)}
                onMouseLeave={() => setHover(null)}
                className={`relative cursor-pointer rounded-md border p-3 transition-all ${COV_COLOR[p.coverage]} ${
                  selectedPhy === p.id ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm">{p.id}</div>
                    <div className="text-[11px] text-muted-foreground">{p.origin} • {p.port} • {p.qty.toLocaleString()} MT</div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${
                    p.coverage === "full" ? "text-success" : p.coverage === "partial" ? "text-accent-foreground" : "text-destructive"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${COV_DOT[p.coverage]}`} />
                    {COV_LABEL[p.coverage]}
                  </span>
                </div>
                {hover?.id === p.id && (
                  <div className="absolute left-full top-0 z-10 ml-2 w-56 rounded-md border border-border bg-popover p-3 text-xs shadow-lg">
                    <div className="grid grid-cols-2 gap-1.5">
                      <span className="text-muted-foreground">Hedge ratio</span><span className="font-mono-num font-semibold text-right">{(p.ratio * 100).toFixed(0)}%</span>
                      <span className="text-muted-foreground">MT covered</span><span className="font-mono-num text-right">{p.covered.toLocaleString()}</span>
                      <span className="text-muted-foreground">MTM</span><span className={`font-mono-num text-right ${p.mtm >= 0 ? "text-success" : "text-destructive"}`}>${p.mtm.toLocaleString()}</span>
                      <span className="text-muted-foreground">Gain/Loss</span><span className={`font-mono-num text-right ${p.pl >= 0 ? "text-success" : "text-destructive"}`}>${p.pl.toLocaleString()}</span>
                      <span className="text-muted-foreground">Delivery</span><span className="font-mono-num text-right">{p.delivery}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-semibold uppercase text-muted-foreground">
              Linked Hedge {selected ? `· ${selected.id}` : ""}
            </div>
            {linkedHedge ? (
              <div className="rounded-md border border-primary/40 bg-primary/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{linkedHedge.ref}</div>
                    <div className="text-[11px] text-muted-foreground">{linkedHedge.exchange} • {linkedHedge.instrument} • {linkedHedge.delivery}</div>
                  </div>
                  <Badge variant="info">{linkedHedge.lots} LOTS</Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div><div className="text-[10px] uppercase text-muted-foreground">Ref Price</div><div className="font-mono-num font-semibold">{linkedHedge.refPrice.toFixed(2)}</div></div>
                  <div><div className="text-[10px] uppercase text-muted-foreground">Current</div><div className="font-mono-num font-semibold">{linkedHedge.current.toFixed(2)}</div></div>
                  <div><div className="text-[10px] uppercase text-muted-foreground">Qty Hedged</div><div className="font-mono-num font-semibold">{linkedHedge.qty.toLocaleString()} MT</div></div>
                  <div><div className="text-[10px] uppercase text-muted-foreground">Unrealized P&L</div><div className={`font-mono-num font-semibold ${linkedHedge.pl >= 0 ? "text-success" : "text-destructive"}`}>${linkedHedge.pl.toLocaleString()}</div></div>
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-destructive/40 bg-destructive/5 p-6 text-center">
                <AlertTriangle className="mx-auto h-6 w-6 text-destructive" />
                <div className="mt-2 text-sm font-semibold text-destructive">No hedge linked</div>
                <div className="text-[11px] text-muted-foreground">Click "Link Physical → Hedge" to assign coverage.</div>
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* Open exchange contracts table */}
      <Section title="Open Exchange Contracts" className="mt-6"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…"
                className="w-40 rounded-md border border-border bg-background py-1 pl-7 pr-2 text-xs" />
            </div>
            <select value={exch} onChange={(e) => setExch(e.target.value as "All" | "CBOT" | "MATIF")} className="rounded-md border border-border bg-background px-2 py-1 text-xs">
              <option>All</option><option>CBOT</option><option>MATIF</option>
            </select>
            <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-secondary">
              <Upload className="h-3 w-3" /> Bulk Excel
            </button>
            <input ref={fileRef} type="file" accept=".csv,.xlsx" className="hidden"
              onChange={(e) => { const n = e.target.files?.length ?? 0; if (n) toast.success(`${n} hedge file(s) queued — running validation`); e.target.value = ""; }} />
            <button onClick={() => toast.success("New trade form ready")} className="inline-flex items-center gap-1 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground hover:bg-accent/90">
              <Plus className="h-3 w-3" /> Add Trade
            </button>
          </div>
        }>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-3 font-medium w-6"></th>
                <SortTh label="Contract" k="ref" sortKey={sortKey} sortDir={sortDir} onClick={sort} />
                <th className="py-2 pr-3 font-medium">Exchange</th>
                <SortTh label="Lots" k="lots" sortKey={sortKey} sortDir={sortDir} onClick={sort} align="right" />
                <SortTh label="Ref Price" k="refPrice" sortKey={sortKey} sortDir={sortDir} onClick={sort} align="right" />
                <SortTh label="Current" k="current" sortKey={sortKey} sortDir={sortDir} onClick={sort} align="right" />
                <SortTh label="Unreal P&L" k="pl" sortKey={sortKey} sortDir={sortDir} onClick={sort} align="right" />
                <th className="py-2 pr-3 text-right font-medium">Stress MTM</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredHedges.map((h) => {
                const linked = PHYS.filter((p) => h.physIds.includes(p.id));
                const sm = stressMtm(h);
                return (
                  <Fragment key={h.id}>
                    <tr className="hover:bg-muted/30 cursor-pointer" onClick={() => setExpanded(expanded === h.id ? null : h.id)}>
                      <td className="py-3 pl-3"><ChevronRight className={`h-3 w-3 transition-transform ${expanded === h.id ? "rotate-90" : ""}`} /></td>
                      <td className="py-3 pr-3"><div className="font-medium">{h.ref}</div><div className="text-[11px] text-muted-foreground">{h.id}</div></td>
                      <td className="py-3 pr-3"><Badge variant="neutral">{h.exchange}</Badge></td>
                      <td className="py-3 pr-3 text-right font-mono-num tabular-nums">{h.lots}</td>
                      <td className="py-3 pr-3 text-right font-mono-num tabular-nums">{h.refPrice.toFixed(2)}</td>
                      <td className="py-3 pr-3 text-right font-mono-num tabular-nums">{h.current.toFixed(2)}</td>
                      <td className={`py-3 pr-3 text-right font-mono-num tabular-nums font-semibold ${h.pl >= 0 ? "text-success" : "text-destructive"}`}>{h.pl >= 0 ? "+" : ""}${h.pl.toLocaleString()}</td>
                      <td className={`py-3 pr-3 text-right font-mono-num tabular-nums ${sm >= 0 ? "text-success" : "text-destructive"}`}>{sm >= 0 ? "+" : ""}${sm.toLocaleString()}</td>
                      <td className="py-3"><Badge variant="info">OPEN</Badge></td>
                    </tr>
                    {expanded === h.id && (
                      <tr key={h.id + "-exp"} className="bg-secondary/30">
                        <td colSpan={9} className="p-4">
                          <div className="grid gap-4 md:grid-cols-4 text-xs">
                            <div>
                              <div className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">Linked Physical</div>
                              {linked.length ? linked.map((p) => (
                                <div key={p.id} className="flex items-center gap-2"><span className={`h-1.5 w-1.5 rounded-full ${COV_DOT[p.coverage]}`} />{p.id} ({p.qty.toLocaleString()} MT)</div>
                              )) : <div className="text-muted-foreground">None</div>}
                            </div>
                            <div>
                              <div className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">Coverage</div>
                              <div className="font-mono-num">{((h.qty / Math.max(1, linked.reduce((s, p) => s + p.qty, 0))) * 100).toFixed(0)}%</div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">MTM History</div>
                              <Spark data={[h.pl * 0.4, h.pl * 0.6, h.pl * 0.8, h.pl * 0.95, h.pl]} positive={h.pl >= 0} />
                            </div>
                            <div>
                              <div className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">Margin Req.</div>
                              <div className="font-mono-num">${(h.lots * 1850).toLocaleString()}</div>
                              <div className="text-[10px] uppercase font-semibold text-muted-foreground mt-2 mb-1">Stress Impact</div>
                              <div className={`font-mono-num ${sm - h.pl >= 0 ? "text-success" : "text-destructive"}`}>{sm - h.pl >= 0 ? "+" : ""}${(sm - h.pl).toLocaleString()}</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      {linkOpen && (
        <LinkModal onClose={() => setLinkOpen(false)} />
      )}
    </>
  );
}

function Metric({ label, value, tone, dense }: { label: string; value: string; tone?: "success" | "destructive" | "warning"; dense?: boolean }) {
  const c = tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : tone === "warning" ? "text-accent-foreground" : "text-foreground";
  return (
    <div className={`rounded-md border border-border ${dense ? "p-2" : "p-3"}`}>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-1 font-mono-num ${dense ? "text-base" : "text-xl"} font-semibold ${c}`}>{value}</div>
    </div>
  );
}

function Slider({ label, value, setValue, min, max, unit }: { label: string; value: number; setValue: (n: number) => void; min: number; max: number; unit: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-[11px]">
        <span className="font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className="font-mono-num">{value > 0 ? "+" : ""}{value} {unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => setValue(Number(e.target.value))}
        className="w-full accent-primary" />
    </div>
  );
}

function ChartBars({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="relative">
      <div className="flex items-end gap-1 h-32">
        {data.map((h, i) => (
          <div key={i} className="relative flex-1 flex flex-col items-center"
            onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <div className="w-full rounded-t bg-success/70 hover:bg-success transition-colors cursor-pointer"
              style={{ height: `${(h / max) * 100}%` }} />
            {hover === i && (
              <div className="absolute -top-7 rounded bg-popover px-2 py-0.5 text-[10px] font-mono-num shadow-md border border-border">
                ${Math.round(h * 1000).toLocaleString()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Spark({ data, positive }: { data: number[]; positive: boolean }) {
  const min = Math.min(...data); const max = Math.max(...data); const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${30 - ((v - min) / range) * 28}`).join(" ");
  return <svg viewBox="0 0 100 30" className="w-full h-8"><polyline fill="none" stroke={positive ? "oklch(0.62 0.16 155)" : "oklch(0.58 0.22 25)"} strokeWidth={2} points={pts} /></svg>;
}

function SortTh({ label, k, sortKey, sortDir, onClick, align }: { label: string; k: keyof Hedge; sortKey: keyof Hedge; sortDir: 1 | -1; onClick: (k: keyof Hedge) => void; align?: "right" }) {
  return (
    <th className={`py-2 pr-3 font-medium ${align === "right" ? "text-right" : ""} cursor-pointer select-none`} onClick={() => onClick(k)}>
      <span className="hover:text-foreground">{label}{sortKey === k ? (sortDir === 1 ? " ↑" : " ↓") : ""}</span>
    </th>
  );
}

function LinkModal({ onClose }: { onClose: () => void }) {
  const unhedged = PHYS.filter((p) => p.coverage !== "full");
  const [phy, setPhy] = useState(unhedged[0]?.id ?? "");
  const [hedge, setHedge] = useState(HEDGES[0]?.id ?? "");
  const phyObj = PHYS.find((p) => p.id === phy);
  const hedgeObj = HEDGES.find((h) => h.id === hedge);
  const warnings: string[] = [];
  if (phyObj && hedgeObj) {
    if (hedgeObj.qty > phyObj.qty) warnings.push("Overhedging: hedge quantity exceeds physical");
    if (hedgeObj.delivery !== phyObj.delivery) warnings.push(`Delivery mismatch: ${hedgeObj.delivery} vs ${phyObj.delivery}`);
    if (phyObj.commodity !== hedgeObj.instrument) warnings.push(`Instrument mismatch: ${hedgeObj.instrument} hedge for ${phyObj.commodity}`);
  }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="text-sm font-semibold">Link Physical → Hedge</h3>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-secondary"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <div className="mb-1 text-[11px] font-medium uppercase text-muted-foreground">Physical Contract</div>
            <select value={phy} onChange={(e) => setPhy(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
              {PHYS.map((p) => <option key={p.id} value={p.id}>{p.id} — {p.commodity} — {p.qty.toLocaleString()} MT</option>)}
            </select>
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase text-muted-foreground">Hedge Instrument</span>
              <button onClick={() => {
                const match = HEDGES.find((h) => h.instrument === phyObj?.commodity);
                if (match) { setHedge(match.id); toast.success(`Smart match: ${match.ref}`); }
                else toast.warning("No matching hedge instrument found");
              }} className="text-[10px] text-primary hover:underline">Smart match</button>
            </div>
            <select value={hedge} onChange={(e) => setHedge(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
              {HEDGES.map((h) => <option key={h.id} value={h.id}>{h.ref} — {h.exchange} — {h.qty.toLocaleString()} MT</option>)}
            </select>
          </div>
          {warnings.length > 0 && (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-destructive mb-1"><AlertTriangle className="h-3.5 w-3.5" /> Validation Warnings</div>
              <ul className="space-y-0.5 text-[11px] text-destructive/90">
                {warnings.map((w) => <li key={w}>• {w}</li>)}
              </ul>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="rounded-md border border-border px-3 py-2 text-xs hover:bg-secondary">Cancel</button>
            <button onClick={() => { toast.success(`Linked ${phy} → ${hedge}`); onClose(); }} className="rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90">Confirm Link</button>
          </div>
        </div>
      </div>
    </div>
  );
}
