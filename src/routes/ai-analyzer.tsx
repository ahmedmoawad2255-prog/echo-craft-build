import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, Fragment } from "react";
import { toast } from "sonner";
import { PageHeader, Section, Badge } from "@/components/ui-bits";
import { Sparkles, ChevronDown, ChevronRight, ArrowUpDown, TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/ai-analyzer")({ component: AIAnalyzer });

const FOCUS = ["All", "Wheat", "Corn", "Soybeans"] as const;
type Focus = typeof FOCUS[number];

const FOCUS_DATA: Record<Focus, {
  sentiment: string; pct: number; tone: "success" | "destructive" | "warning";
  summary: string;
  risks: { label: string; level: string; pct: number; tone: "destructive" | "warning" | "success" }[];
  ai: string;
  headline: string;
  body: string;
}> = {
  All: {
    sentiment: "Mixed", pct: 58, tone: "warning",
    summary: "Cross-commodity signals show divergent flows: wheat strength offset by corn weakness; soy range-bound on Brazil supply.",
    risks: [
      { label: "Weather (S. America)", level: "CRITICAL", pct: 88, tone: "destructive" },
      { label: "Geopolitical Conflict", level: "MODERATE", pct: 55, tone: "warning" },
      { label: "Freight & Logistics", level: "ELEVATED", pct: 62, tone: "warning" },
    ],
    ai: "Aggregate signal is mixed. Inter-commodity spreads favor long wheat / short corn pair trade into Q1.",
    headline: "Cross-Commodity Divergence Defines Q4 Tape",
    body: "Wheat firmness from MENA tenders contrasts with bearish US corn balance sheet revisions, while soy hovers as Brazil weather drives the next leg.",
  },
  Wheat: {
    sentiment: "Bullish", pct: 72, tone: "success",
    summary: "AI identifies aggressive accumulation in wheat futures, correlated with Egyptian GASC tender activity and supply tightness in Black Sea export hubs.",
    risks: [
      { label: "Black Sea Export Risk", level: "CRITICAL", pct: 88, tone: "destructive" },
      { label: "MENA Tender Demand", level: "HIGH", pct: 78, tone: "warning" },
    ],
    ai: "Negative deviation in global wheat stocks confirms underlying supply fragility. Hedge positions should focus on Dec '24 wheat contracts.",
    headline: "Global Dynamics: Egyptian Demand Pressure vs. Improved US Weather Outlook",
    body: "Egypt's GASC has intensified its tender cycle, revealing a broader strategic deficit in North African reserves. Black Sea dryness continues to degrade yield expectations, sustaining the bullish momentum in CBT contracts.",
  },
  Corn: {
    sentiment: "Bearish", pct: 64, tone: "destructive",
    summary: "Improving US weather and a bumper South American outlook are pressuring CBOT corn into year-end. Ethanol margins remain the swing factor.",
    risks: [
      { label: "US Yield Upside", level: "ELEVATED", pct: 70, tone: "warning" },
      { label: "Ethanol Margin Compression", level: "MODERATE", pct: 48, tone: "warning" },
    ],
    ai: "Stocks-to-use ratio expansion suggests downside risk to $4.15/bu support. Reduce length on rallies into USDA print.",
    headline: "Corn Pressured by Stocks Build and Benign US Weather",
    body: "Improving climatic moisture across the Western Hemisphere combined with elevated South American forecasts continues to weigh on the CBOT corn curve.",
  },
  Soybeans: {
    sentiment: "Neutral", pct: 51, tone: "warning",
    summary: "Soy complex is range-bound: Chinese crush demand offsets Brazilian record-production expectations. Watch the Real and CONAB revisions.",
    risks: [
      { label: "Brazil Production Risk", level: "HIGH", pct: 74, tone: "warning" },
      { label: "China Crush Demand", level: "STABLE", pct: 50, tone: "success" },
    ],
    ai: "Range trade favored ($10.20–$10.85). Sell calls into resistance; protect downside with put spreads on CONAB upgrade risk.",
    headline: "Soy Complex Range-Bound Between Brazil Supply and China Demand",
    body: "Record-pace Brazilian planting offsets resilient Chinese crush margins. The cross-currency pass-through via BRL remains the dominant macro overlay.",
  },
};

// ============= USDA Intelligence Table =============
type Impact = "BULLISH" | "BEARISH" | "NEUTRAL" | "HIGH RISK";
type ReportRow = {
  instrument: string;
  current: number;
  previous: number;
  unit: string;
  impact: Impact;
  ai: string;
};
type ReportType = {
  id: string;
  label: string;
  releaseDate: string;
  previousDate: string;
  rows: ReportRow[];
};

const USDA_REPORTS: ReportType[] = [
  {
    id: "wasde",
    label: "WASDE Monthly Report",
    releaseDate: "Nov 8, 2025",
    previousDate: "Oct 10, 2025",
    rows: [
      { instrument: "Wheat Ending Stocks (Global)", current: 257.7, previous: 261.4, unit: "M MT", impact: "BULLISH", ai: "Lower global wheat stocks vs. previous WASDE suggest tightening supply and supportive futures sentiment into Dec contracts." },
      { instrument: "Corn Ending Stocks (US)", current: 1999, previous: 1940, unit: "M Bu", impact: "BEARISH", ai: "US corn stocks revised higher — confirms ample old-crop carryout and pressures CBOT Dec corn near $4.15 support." },
      { instrument: "Soybean Production (Brazil)", current: 162.0, previous: 161.0, unit: "M MT", impact: "BEARISH", ai: "Brazil soy revised up; balance sheet remains heavy. Watch CONAB for further upward revisions." },
      { instrument: "Wheat Production (EU)", current: 126.2, previous: 128.5, unit: "M MT", impact: "BULLISH", ai: "EU wheat downgrade reinforces Black Sea demand pull — supportive for milling wheat premium." },
    ],
  },
  {
    id: "export-sales",
    label: "Export Sales Weekly Report",
    releaseDate: "Nov 13, 2025",
    previousDate: "Nov 6, 2025",
    rows: [
      { instrument: "Wheat Net Sales", current: 412, previous: 298, unit: "K MT", impact: "BULLISH", ai: "Wheat export sales jumped 38% w/w — driven by SE Asia and MENA buyers. Confirms tight global cash market." },
      { instrument: "Corn Net Sales", current: 985, previous: 1245, unit: "K MT", impact: "BEARISH", ai: "Corn export pace softened — Brazilian competition at ports weighing on US Gulf basis." },
      { instrument: "Soybean Net Sales", current: 1820, previous: 1680, unit: "K MT", impact: "NEUTRAL", ai: "Soy demand resilient but seasonally normal. China remains primary buyer." },
    ],
  },
  {
    id: "crop-progress",
    label: "Crop Progress Report",
    releaseDate: "Nov 10, 2025",
    previousDate: "Nov 3, 2025",
    rows: [
      { instrument: "Corn Harvested (%)", current: 91, previous: 81, unit: "%", impact: "NEUTRAL", ai: "Harvest pace ahead of 5-yr avg. Limited surprise — already priced in." },
      { instrument: "Soybeans Harvested (%)", current: 96, previous: 89, unit: "%", impact: "NEUTRAL", ai: "Soy harvest near completion; focus shifts to S. American planting." },
      { instrument: "Winter Wheat Good/Excellent (%)", current: 47, previous: 51, unit: "%", impact: "BULLISH", ai: "Wheat condition deteriorating in Southern Plains — drought concerns building, supportive for KC wheat." },
    ],
  },
  {
    id: "grain-stocks",
    label: "Grain Stocks Quarterly Report",
    releaseDate: "Sep 30, 2025",
    previousDate: "Jun 28, 2025",
    rows: [
      { instrument: "Corn Stocks (US, All Positions)", current: 1760, previous: 4993, unit: "M Bu", impact: "BULLISH", ai: "Sept 1 corn stocks below trade estimate of 1,840M — implies stronger feed/residual usage. Bullish revision risk for next WASDE." },
      { instrument: "Soybean Stocks (US)", current: 342, previous: 970, unit: "M Bu", impact: "NEUTRAL", ai: "Soy stocks in line with consensus. No directional catalyst." },
      { instrument: "Wheat Stocks (US)", current: 1986, previous: 1087, unit: "M Bu", impact: "BEARISH", ai: "Wheat stocks above estimates — softens domestic tightness narrative." },
    ],
  },
  {
    id: "prospective-plantings",
    label: "Prospective Plantings Report",
    releaseDate: "Mar 31, 2025",
    previousDate: "Mar 31, 2024",
    rows: [
      { instrument: "Corn Acres Planted Intentions", current: 95.3, previous: 90.0, unit: "M Acres", impact: "BEARISH", ai: "Farmer intentions 5.3M acres above prior year — implies record corn supply potential." },
      { instrument: "Soybean Acres Planted Intentions", current: 83.5, previous: 87.1, unit: "M Acres", impact: "BULLISH", ai: "Soy acres trimmed in favor of corn — could tighten balance sheet if yields disappoint." },
      { instrument: "All Wheat Acres", current: 47.0, previous: 47.5, unit: "M Acres", impact: "NEUTRAL", ai: "Wheat acres broadly flat — no surprise vs. consensus." },
    ],
  },
  {
    id: "hogs-pigs",
    label: "Hogs & Pigs Report",
    releaseDate: "Sep 25, 2025",
    previousDate: "Jun 27, 2025",
    rows: [
      { instrument: "All Hogs & Pigs Inventory", current: 76.4, previous: 74.5, unit: "M Head", impact: "BEARISH", ai: "Inventory expansion above consensus — pork supply build pressures lean hog futures." },
      { instrument: "Breeding Herd", current: 6.0, previous: 6.0, unit: "M Head", impact: "NEUTRAL", ai: "Breeding herd flat — no change in producer expansion sentiment." },
    ],
  },
  {
    id: "cattle-on-feed",
    label: "Cattle on Feed Report",
    releaseDate: "Oct 24, 2025",
    previousDate: "Sep 19, 2025",
    rows: [
      { instrument: "Cattle on Feed (1000+ head lots)", current: 11.6, previous: 11.5, unit: "M Head", impact: "NEUTRAL", ai: "On-feed numbers in line with trade estimates — limited price reaction expected." },
      { instrument: "Placements (Monthly)", current: 2.05, previous: 2.21, unit: "M Head", impact: "BULLISH", ai: "Lower placements signal tighter spring beef supply — supportive for live cattle Q2 contracts." },
    ],
  },
  {
    id: "weather-drought",
    label: "Weather & Drought Report",
    releaseDate: "Nov 13, 2025",
    previousDate: "Nov 6, 2025",
    rows: [
      { instrument: "US Drought Coverage (Plains)", current: 38, previous: 31, unit: "%", impact: "BULLISH", ai: "Plains drought expansion threatens winter wheat establishment — bullish for KC wheat futures." },
      { instrument: "Brazil Soy Belt Rainfall (% Normal)", current: 78, previous: 92, unit: "%", impact: "HIGH RISK", ai: "Brazilian rainfall deficit emerging in Mato Grosso — high volatility risk if pattern persists into pollination." },
      { instrument: "Argentina Pampas Soil Moisture", current: 62, previous: 70, unit: "% Field Cap", impact: "NEUTRAL", ai: "Soil moisture declining but adequate — monitor next 14-day forecast." },
    ],
  },
];

const IMPACT_TONE: Record<Impact, { variant: "success" | "destructive" | "warning" | "neutral"; chip: string }> = {
  BULLISH: { variant: "success", chip: "bg-success/15 text-success border-success/30" },
  BEARISH: { variant: "destructive", chip: "bg-destructive/15 text-destructive border-destructive/30" },
  NEUTRAL: { variant: "neutral", chip: "bg-secondary text-secondary-foreground border-border" },
  "HIGH RISK": { variant: "warning", chip: "bg-accent/20 text-accent-foreground border-accent/40" },
};

type SortKey = "instrument" | "current" | "previous" | "change" | "impact";

function USDAIntelligenceTable({ reportId, setReportId }: { reportId: string; setReportId: (id: string) => void }) {
  const [sortKey, setSortKey] = useState<SortKey>("instrument");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const report = useMemo(() => USDA_REPORTS.find((r) => r.id === reportId)!, [reportId]);

  const sorted = useMemo(() => {
    const rows = [...report.rows];
    rows.sort((a, b) => {
      let av: number | string = 0, bv: number | string = 0;
      if (sortKey === "instrument") { av = a.instrument; bv = b.instrument; }
      else if (sortKey === "current") { av = a.current; bv = b.current; }
      else if (sortKey === "previous") { av = a.previous; bv = b.previous; }
      else if (sortKey === "change") {
        av = ((a.current - a.previous) / a.previous) * 100;
        bv = ((b.current - b.previous) / b.previous) * 100;
      }
      else if (sortKey === "impact") { av = a.impact; bv = b.impact; }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return rows;
  }, [report, sortKey, sortDir]);

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("asc"); }
  }

  // AI synthesis aggregating across rows
  const synthesis = useMemo(() => {
    const bull = report.rows.filter((r) => r.impact === "BULLISH").length;
    const bear = report.rows.filter((r) => r.impact === "BEARISH").length;
    const risk = report.rows.filter((r) => r.impact === "HIGH RISK").length;
    if (risk > 0) return `Volatility risk flagged across ${risk} metric(s). Tactical hedging advised; reduce naked exposure into next release.`;
    if (bull > bear) return `Net bullish skew (${bull} bullish vs ${bear} bearish). Supply-side tightening bias dominates this report cycle.`;
    if (bear > bull) return `Net bearish skew (${bear} bearish vs ${bull} bullish). Balance sheets loosening — pressure on front-month futures.`;
    return `Balanced signal — no clear directional edge. Range-bound trading favored until next data print.`;
  }, [report]);

  return (
    <Section
      title="USDA Intelligence Table"
      className="lg:col-span-2"
      actions={
        <div className="flex items-center gap-2">
          <Badge variant="success">LIVE FEED</Badge>
          <button
            onClick={() => toast.success(`${report.label} exported (XLS)`)}
            className="rounded-md border border-border px-2.5 py-1.5 text-xs hover:bg-secondary"
          >
            XLS Report
          </button>
        </div>
      }
    >
      {/* Filter + metadata */}
      <div className="-mt-2 mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">USDA Report Type</label>
          <select
            value={reportId}
            onChange={(e) => { setReportId(e.target.value); setExpanded({}); }}
            className="h-9 min-w-[260px] rounded-md border border-border bg-background px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {USDA_REPORTS.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px]">
          <div><span className="text-muted-foreground">Release: </span><span className="font-mono-num font-semibold">{report.releaseDate}</span></div>
          <div><span className="text-muted-foreground">Previous: </span><span className="font-mono-num font-semibold">{report.previousDate}</span></div>
          <div><span className="text-muted-foreground">Updated: </span><span className="font-mono-num font-semibold">{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="w-6 py-2"></th>
              <SortHeader label="Market Instrument" k="instrument" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
              <SortHeader label="Current" k="current" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} align="right" />
              <SortHeader label="Previous" k="previous" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} align="right" />
              <SortHeader label="Change %" k="change" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} align="right" />
              <SortHeader label="AI Market Impact" k="impact" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.map((r) => {
              const abs = r.current - r.previous;
              const pct = (abs / r.previous) * 100;
              const isOpen = !!expanded[r.instrument];
              const tone = IMPACT_TONE[r.impact];
              return (
                <Fragment key={r.instrument}>
                  <tr className="hover:bg-secondary/40">
                    <td className="py-3 pl-1">
                      <button
                        onClick={() => setExpanded((p) => ({ ...p, [r.instrument]: !p[r.instrument] }))}
                        className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                        aria-label="Toggle commentary"
                      >
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="py-3 pr-3 font-medium">{r.instrument}</td>
                    <td className="py-3 pr-3 text-right font-mono-num">{r.current.toLocaleString()} <span className="text-[10px] text-muted-foreground">{r.unit}</span></td>
                    <td className="py-3 pr-3 text-right font-mono-num text-muted-foreground">{r.previous.toLocaleString()}</td>
                    <td className={`py-3 pr-3 text-right font-mono-num ${pct >= 0 ? "text-success" : "text-destructive"}`}>
                      {pct >= 0 ? "+" : ""}{pct.toFixed(2)}%
                      <div className="text-[10px] text-muted-foreground">{abs >= 0 ? "+" : ""}{abs.toFixed(1)}</div>
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tone.chip}`}>
                        {r.impact}
                      </span>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="bg-secondary/30">
                      <td></td>
                      <td colSpan={5} className="py-3 pr-3">
                        <div className="flex items-start gap-2 text-xs leading-relaxed">
                          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                          <p><span className="font-semibold">AI Commentary:</span> {r.ai}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* AI Synthesis */}
      <div className="mt-4 flex items-start gap-2 rounded-md border-l-4 border-accent bg-secondary/50 p-3 text-xs">
        <Sparkles className="h-4 w-4 shrink-0 text-accent mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-semibold">AI Agent Synthesis · {report.label}:</span> {synthesis}
        </p>
      </div>
    </Section>
  );
}

function SortHeader({ label, k, sortKey, sortDir, onClick, align = "left" }: {
  label: string; k: SortKey; sortKey: SortKey; sortDir: "asc" | "desc";
  onClick: (k: SortKey) => void; align?: "left" | "right";
}) {
  const active = sortKey === k;
  return (
    <th className={`py-2 pr-3 font-medium ${align === "right" ? "text-right" : ""}`}>
      <button
        onClick={() => onClick(k)}
        className={`inline-flex items-center gap-1 hover:text-foreground ${active ? "text-foreground" : ""}`}
      >
        {label}
        <ArrowUpDown className={`h-3 w-3 ${active ? "opacity-100" : "opacity-40"}`} />
        {active && <span className="text-[9px]">{sortDir === "asc" ? "▲" : "▼"}</span>}
      </button>
    </th>
  );
}

function AIAnalyzer() {
  const [focus, setFocus] = useState<Focus>("Wheat");
  const [reportId, setReportId] = useState<string>(USDA_REPORTS[0].id);
  const data = useMemo(() => FOCUS_DATA[focus], [focus]);
  const activeReport = useMemo(() => USDA_REPORTS.find((r) => r.id === reportId)!, [reportId]);
  const futures = useMemo(() => deriveFuturesIntelligence(activeReport), [activeReport]);
  return (
    <>
      <PageHeader
        title="AI Market Analyzer"
        subtitle="Synthesized institutional intelligence across futures, weather, and geopolitical signals."
        actions={
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-block h-2 w-2 rounded-full bg-success" />
            <span className="text-muted-foreground">Live USDA Data Feed: Active</span>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground self-center">Market Focus</span>
        {FOCUS.map((c) => (
          <button
            key={c}
            onClick={() => setFocus(c)}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${focus === c ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Section title={`Market Sentiment (AI) · ${focus}`}>
          <div className="rounded-md bg-hero-navy p-4 text-primary-foreground">
            <div className={`text-xs uppercase tracking-wider ${data.tone === "success" ? "text-success" : data.tone === "destructive" ? "text-destructive" : "text-accent"}`}>{data.sentiment}</div>
            <div className="mt-1 font-mono-num text-5xl font-bold">{data.pct}%</div>
            <p className="mt-2 text-xs leading-relaxed text-primary-foreground/80">{data.summary}</p>
          </div>
          <div className="mt-4 space-y-3 text-xs">
            <div className="font-semibold uppercase text-muted-foreground">Risk Factor Analysis</div>
            {data.risks.map((r) => (
              <div key={r.label}>
                <div className="flex justify-between">
                  <span>{r.label}</span>
                  <span className={`font-semibold ${r.tone === "destructive" ? "text-destructive" : r.tone === "success" ? "text-success" : "text-accent-foreground"}`}>{r.level}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-secondary">
                  <div className={`h-full rounded-full ${r.tone === "destructive" ? "bg-destructive" : r.tone === "success" ? "bg-success" : "bg-accent"}`} style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Section>

        <USDAIntelligenceTable />
      </div>

      <Section title="Institutional News Summary"
        className="mt-6"
        actions={<><Badge variant="destructive">LIVE</Badge> <span className="text-[11px] text-muted-foreground">Aggregated from 142 primary sources · Deduplicated by LLM</span></>}>
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="space-y-3 text-xs">
            <div className="font-semibold uppercase text-muted-foreground">Commodity Risks</div>
            {[
              { c: "WHEAT", b: "BULLISH", t: "success" as const, n: "CBOT · DEC", v: "85% Bull" },
              { c: "CORN", b: "BEARISH", t: "destructive" as const, n: "CBOT · DEC", v: "64% Bear" },
              { c: "SOY", b: "NEUTRAL", t: "neutral" as const, n: "CBOT · NOV", v: "Mixed" },
            ].map((m) => (
              <div key={m.c} className="rounded border border-border p-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold">{m.c}</span>
                  <Badge variant={m.t}>{m.b}</Badge>
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                  <span>{m.n}</span><span>{m.v}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-3">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">— Institutional Market Intelligence · {focus} —</div>
            <h2 className="mt-2 text-2xl font-bold leading-tight">{data.headline}</h2>
            <div className="mt-4 rounded-md border-l-4 border-accent bg-secondary/30 p-4 text-sm leading-relaxed">
              {data.body}
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
