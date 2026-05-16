import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, Fragment } from "react";
import { toast } from "sonner";
import { PageHeader, Section, Badge } from "@/components/ui-bits";
import { Sparkles, ChevronDown, ChevronRight, ArrowUpDown, TrendingUp, TrendingDown, Minus } from "lucide-react";

export const Route = createFileRoute("/ai-analyzer")({ component: AIAnalyzer });

const FOCUS = ["All", "Wheat", "Corn", "Soybeans"] as const;
type Focus = typeof FOCUS[number];

const FOCUS_DATA: Record<Focus, {
  sentiment: string; pct: number; tone: "success" | "destructive" | "warning";
  summary: string;
  risks: { label: string; level: string; pct: number; tone: "destructive" | "warning" | "success" }[];
}> = {
  All: {
    sentiment: "Mixed", pct: 58, tone: "warning",
    summary: "Cross-commodity signals show divergent flows: wheat strength offset by corn weakness; soy range-bound on Brazil supply.",
    risks: [
      { label: "Weather (S. America)", level: "CRITICAL", pct: 88, tone: "destructive" },
      { label: "Geopolitical Conflict", level: "MODERATE", pct: 55, tone: "warning" },
      { label: "Freight & Logistics", level: "ELEVATED", pct: 62, tone: "warning" },
    ],
  },
  Wheat: {
    sentiment: "Bullish", pct: 72, tone: "success",
    summary: "AI identifies aggressive accumulation in wheat futures, correlated with Egyptian GASC tender activity and Black Sea supply tightness.",
    risks: [
      { label: "Black Sea Export Risk", level: "CRITICAL", pct: 88, tone: "destructive" },
      { label: "MENA Tender Demand", level: "HIGH", pct: 78, tone: "warning" },
    ],
  },
  Corn: {
    sentiment: "Bearish", pct: 64, tone: "destructive",
    summary: "Improving US weather and a bumper South American outlook are pressuring CBOT corn into year-end. Ethanol margins remain the swing factor.",
    risks: [
      { label: "US Yield Upside", level: "ELEVATED", pct: 70, tone: "warning" },
      { label: "Ethanol Margin Compression", level: "MODERATE", pct: 48, tone: "warning" },
    ],
  },
  Soybeans: {
    sentiment: "Neutral", pct: 51, tone: "warning",
    summary: "Soy complex is range-bound: Chinese crush demand offsets Brazilian record-production expectations. Watch the Real and CONAB revisions.",
    risks: [
      { label: "Brazil Production Risk", level: "HIGH", pct: 74, tone: "warning" },
      { label: "China Crush Demand", level: "STABLE", pct: 50, tone: "success" },
    ],
  },
};

// ============= USDA Intelligence Table =============
type Impact = "BULLISH" | "BEARISH" | "NEUTRAL" | "HIGH RISK";
type ReportRow = {
  metric: string;
  current: number;
  previous: number;
  unit: string;
  impact: Impact;
  ai: string;
};
type ReportId = "wasde" | "export-sales";
type Commodity = "Wheat" | "Corn" | "Soybeans";

const REPORT_OPTIONS: { id: ReportId; label: string; releaseDate: string; previousDate: string }[] = [
  { id: "wasde", label: "WASDE Monthly Report", releaseDate: "Nov 8, 2025", previousDate: "Oct 10, 2025" },
  { id: "export-sales", label: "Weekly Export Sales Report", releaseDate: "Nov 13, 2025", previousDate: "Nov 6, 2025" },
];

const COMMODITIES: Commodity[] = ["Wheat", "Corn", "Soybeans"];

// Metrics by report + commodity
const USDA_DATA: Record<ReportId, Record<Commodity, { rows: ReportRow[]; interpretation: string }>> = {
  wasde: {
    Wheat: {
      rows: [
        { metric: "Production (Global)", current: 794.1, previous: 796.8, unit: "M MT", impact: "BULLISH", ai: "Slight downward revision in global wheat output supports tighter supply narrative." },
        { metric: "Ending Stocks (Global)", current: 257.7, previous: 261.4, unit: "M MT", impact: "BULLISH", ai: "Lower-than-anticipated ending stocks reinforce bullish technical floor for CBOT wheat." },
        { metric: "Exports (US)", current: 21.8, previous: 21.0, unit: "M MT", impact: "BULLISH", ai: "Stronger US export forecast confirms healthy global tender demand." },
        { metric: "Yield (US Winter)", current: 51.2, previous: 51.5, unit: "Bu/Ac", impact: "NEUTRAL", ai: "Yield broadly steady — limited surprise to balance sheet." },
        { metric: "Global Stocks (Ex-China)", current: 102.5, previous: 105.1, unit: "M MT", impact: "BULLISH", ai: "Ex-China carryout shrinking — confirms exportable supply tightness." },
      ],
      interpretation: "Lower than anticipated ending stocks and strong export demand create a bullish technical floor for CBOT wheat despite stable yields.",
    },
    Corn: {
      rows: [
        { metric: "Production (US)", current: 15143, previous: 15064, unit: "M Bu", impact: "BEARISH", ai: "US corn output revised higher — confirms ample crop and pressures front-month futures." },
        { metric: "Ending Stocks (US)", current: 1999, previous: 1940, unit: "M Bu", impact: "BEARISH", ai: "Stocks build adds slack to the balance sheet; bearish toward $4.15 support." },
        { metric: "Exports (US)", current: 2325, previous: 2275, unit: "M Bu", impact: "BULLISH", ai: "Modest export upgrade — partially offsets stocks expansion." },
        { metric: "Yield (US National)", current: 183.1, previous: 183.8, unit: "Bu/Ac", impact: "NEUTRAL", ai: "Yield trimmed marginally — neutral to slightly supportive." },
        { metric: "Global Stocks", current: 312.8, previous: 314.6, unit: "M MT", impact: "NEUTRAL", ai: "Global carryout broadly unchanged." },
      ],
      interpretation: "Higher US production and stocks revisions outweigh export upgrades — bias remains bearish for CBOT corn into year-end.",
    },
    Soybeans: {
      rows: [
        { metric: "Production (US)", current: 4461, previous: 4475, unit: "M Bu", impact: "BULLISH", ai: "Slight downward US production revision supports front-month soy." },
        { metric: "Ending Stocks (US)", current: 470, previous: 550, unit: "M Bu", impact: "BULLISH", ai: "Sharp cut in US carryout — tightens balance sheet, bullish bias confirmed." },
        { metric: "Exports (US)", current: 1825, previous: 1750, unit: "M Bu", impact: "BULLISH", ai: "Higher export forecast driven by sustained China demand." },
        { metric: "Yield (US)", current: 51.7, previous: 51.5, unit: "Bu/Ac", impact: "NEUTRAL", ai: "Yield broadly steady." },
        { metric: "Production (Brazil)", current: 162.0, previous: 161.0, unit: "M MT", impact: "BEARISH", ai: "Brazil revised higher — partially offsets US tightening." },
      ],
      interpretation: "US balance sheet tightens materially on lower stocks and stronger exports, partially offset by record Brazil production.",
    },
  },
  "export-sales": {
    Wheat: {
      rows: [
        { metric: "Weekly Export Sales", current: 412, previous: 298, unit: "K MT", impact: "BULLISH", ai: "Sales jumped 38% w/w — driven by SE Asia and MENA buyers." },
        { metric: "Shipments", current: 385, previous: 340, unit: "K MT", impact: "BULLISH", ai: "Shipment pace accelerating into Gulf — confirms export competitiveness." },
        { metric: "Top Buyers", current: 3, previous: 2, unit: "Countries", impact: "BULLISH", ai: "Diversified demand base: Egypt, Indonesia, Nigeria active." },
        { metric: "Export Pace (% of USDA)", current: 58, previous: 52, unit: "%", impact: "BULLISH", ai: "Pace ahead of seasonal norm — supportive of upward USDA revision." },
        { metric: "Outstanding Sales", current: 6850, previous: 6520, unit: "K MT", impact: "BULLISH", ai: "Forward book building — confirms sustained tender demand." },
      ],
      interpretation: "Strong weekly export sales and rising outstanding book confirm healthy global wheat demand — bullish for CBOT wheat momentum.",
    },
    Corn: {
      rows: [
        { metric: "Weekly Export Sales", current: 985, previous: 1245, unit: "K MT", impact: "BEARISH", ai: "Export pace softened — Brazilian competition at ports weighing on US Gulf basis." },
        { metric: "Shipments", current: 1120, previous: 1050, unit: "K MT", impact: "NEUTRAL", ai: "Shipments steady, but forward demand softening." },
        { metric: "Top Buyers", current: 2, previous: 3, unit: "Countries", impact: "BEARISH", ai: "Buyer concentration narrowing — Mexico dominant, others stepping back." },
        { metric: "Export Pace (% of USDA)", current: 42, previous: 45, unit: "%", impact: "BEARISH", ai: "Pace lagging seasonal norm — risk of USDA downgrade." },
        { metric: "Outstanding Sales", current: 18450, previous: 18920, unit: "K MT", impact: "NEUTRAL", ai: "Outstanding book broadly flat." },
      ],
      interpretation: "Slowing weekly sales and lagging export pace suggest US corn losing share to Brazil — bearish near-term setup.",
    },
    Soybeans: {
      rows: [
        { metric: "Weekly Export Sales", current: 1820, previous: 1680, unit: "K MT", impact: "BULLISH", ai: "Strong sales driven by sustained China crush demand." },
        { metric: "Shipments", current: 2100, previous: 1980, unit: "K MT", impact: "BULLISH", ai: "Gulf shipments accelerating — confirms execution on China book." },
        { metric: "Top Buyers", current: 4, previous: 3, unit: "Countries", impact: "BULLISH", ai: "China dominant; EU and SE Asia incrementally adding." },
        { metric: "Export Pace (% of USDA)", current: 64, previous: 60, unit: "%", impact: "BULLISH", ai: "Pace ahead of average — supports stocks tightening narrative." },
        { metric: "Outstanding Sales", current: 22150, previous: 21800, unit: "K MT", impact: "BULLISH", ai: "Forward book growing — China rebuilding stockpiles." },
      ],
      interpretation: "Sales pace and outstanding book both expanding — bullish soy export setup with China driving the bid.",
    },
  },
};

const IMPACT_TONE: Record<Impact, { chip: string }> = {
  BULLISH: { chip: "bg-success/15 text-success border-success/30" },
  BEARISH: { chip: "bg-destructive/15 text-destructive border-destructive/30" },
  NEUTRAL: { chip: "bg-secondary text-secondary-foreground border-border" },
  "HIGH RISK": { chip: "bg-accent/20 text-accent-foreground border-accent/40" },
};

type SortKey = "metric" | "current" | "previous" | "change" | "impact";

function USDAIntelligenceTable({
  reportId, setReportId, commodity, setCommodity,
}: {
  reportId: ReportId; setReportId: (id: ReportId) => void;
  commodity: Commodity; setCommodity: (c: Commodity) => void;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("metric");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const reportMeta = useMemo(() => REPORT_OPTIONS.find((r) => r.id === reportId)!, [reportId]);
  const data = useMemo(() => USDA_DATA[reportId][commodity], [reportId, commodity]);

  const sorted = useMemo(() => {
    const rows = [...data.rows];
    rows.sort((a, b) => {
      let av: number | string = 0, bv: number | string = 0;
      if (sortKey === "metric") { av = a.metric; bv = b.metric; }
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
  }, [data, sortKey, sortDir]);

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("asc"); }
  }

  return (
    <Section
      title="USDA Intelligence Table"
      className="lg:col-span-2"
      actions={
        <div className="flex items-center gap-2">
          <Badge variant="success">LIVE FEED</Badge>
          <button
            onClick={() => toast.success(`${reportMeta.label} · ${commodity} exported (XLS)`)}
            className="rounded-md border border-border px-2.5 py-1.5 text-xs hover:bg-secondary"
          >
            XLS Report
          </button>
        </div>
      }
    >
      {/* Filters */}
      <div className="-mt-2 mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Report Type</label>
            <select
              value={reportId}
              onChange={(e) => { setReportId(e.target.value as ReportId); setExpanded({}); }}
              className="h-9 min-w-[240px] rounded-md border border-border bg-background px-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {REPORT_OPTIONS.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Commodity</label>
            <div className="flex gap-1 rounded-md border border-border bg-background p-1">
              {COMMODITIES.map((c) => (
                <button
                  key={c}
                  onClick={() => { setCommodity(c); setExpanded({}); }}
                  className={`rounded px-3 py-1 text-xs font-semibold transition-colors ${commodity === c ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px]">
          <div><span className="text-muted-foreground">Release: </span><span className="font-mono-num font-semibold">{reportMeta.releaseDate}</span></div>
          <div><span className="text-muted-foreground">Previous: </span><span className="font-mono-num font-semibold">{reportMeta.previousDate}</span></div>
          <div><span className="text-muted-foreground">Updated: </span><span className="font-mono-num font-semibold">{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="w-6 py-2"></th>
              <SortHeader label="Market Metric" k="metric" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
              <SortHeader label="Current" k="current" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} align="right" />
              <SortHeader label="Previous" k="previous" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} align="right" />
              <SortHeader label="Change %" k="change" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} align="right" />
              <SortHeader label="AI Impact" k="impact" sortKey={sortKey} sortDir={sortDir} onClick={toggleSort} />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.map((r) => {
              const abs = r.current - r.previous;
              const pct = r.previous !== 0 ? (abs / r.previous) * 100 : 0;
              const isOpen = !!expanded[r.metric];
              const tone = IMPACT_TONE[r.impact];
              return (
                <Fragment key={r.metric}>
                  <tr className="hover:bg-secondary/40">
                    <td className="py-3 pl-1">
                      <button
                        onClick={() => setExpanded((p) => ({ ...p, [r.metric]: !p[r.metric] }))}
                        className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                        aria-label="Toggle commentary"
                      >
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="py-3 pr-3 font-medium">{r.metric}</td>
                    <td className="py-3 pr-3 text-right font-mono-num">{r.current.toLocaleString()} <span className="text-[10px] text-muted-foreground">{r.unit}</span></td>
                    <td className="py-3 pr-3 text-right font-mono-num text-muted-foreground">{r.previous.toLocaleString()}</td>
                    <td className={`py-3 pr-3 text-right font-mono-num ${pct >= 0 ? "text-success" : "text-destructive"}`}>
                      {pct >= 0 ? "+" : ""}{pct.toFixed(2)}%
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

      {/* AI Interpretation */}
      <div className="mt-4 flex items-start gap-2 rounded-md border-l-4 border-accent bg-secondary/50 p-3 text-xs">
        <Sparkles className="h-4 w-4 shrink-0 text-accent mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-semibold">AI Interpretation · {reportMeta.label} · {commodity}:</span> {data.interpretation}
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

// ============= News Summary =============
type NewsBias = "Bullish" | "Bearish" | "Neutral";

const NEWS_ITEMS: {
  headline: string; source: string; timestamp: string; summary: string; commodity: string; bias: NewsBias;
}[] = [
  {
    headline: "Egypt's GASC Returns to Market with 480k MT Wheat Tender",
    source: "Reuters",
    timestamp: "2h ago",
    summary: "AI: GASC re-entry signals strategic restocking after extended absence — bullish for Black Sea cash and CBOT wheat premium into Dec contract.",
    commodity: "Wheat",
    bias: "Bullish",
  },
  {
    headline: "Brazil CONAB Raises 2025/26 Soybean Crop Estimate to 166M MT",
    source: "Bloomberg",
    timestamp: "4h ago",
    summary: "AI: Upward CONAB revision pressures soy complex but partially offset by US stocks tightening — net neutral to slightly bearish for Jan soy.",
    commodity: "Soybeans",
    bias: "Bearish",
  },
  {
    headline: "US Ethanol Margins Compress as Crude Slides to $68/bbl",
    source: "S&P Global",
    timestamp: "6h ago",
    summary: "AI: Weaker ethanol margins reduce corn grind demand — adds to bearish corn balance sheet narrative into year-end.",
    commodity: "Corn",
    bias: "Bearish",
  },
  {
    headline: "Argentina Pampas Forecasts Show Below-Normal Rainfall Through Nov",
    source: "World Weather",
    timestamp: "8h ago",
    summary: "AI: Soil moisture stress emerging in key soy regions — supportive risk premium for soy if pattern persists into pollination.",
    commodity: "Soybeans",
    bias: "Bullish",
  },
  {
    headline: "China Books 6 Cargoes of US Soybeans for January Shipment",
    source: "USDA Daily",
    timestamp: "11h ago",
    summary: "AI: Continued Chinese demand confirms US Gulf competitiveness — supportive for soy export book and front-month bias.",
    commodity: "Soybeans",
    bias: "Bullish",
  },
];

const NEWS_BIAS_TONE: Record<NewsBias, { chip: string; icon: typeof TrendingUp }> = {
  Bullish: { chip: "bg-success/15 text-success border-success/30", icon: TrendingUp },
  Bearish: { chip: "bg-destructive/15 text-destructive border-destructive/30", icon: TrendingDown },
  Neutral: { chip: "bg-secondary text-secondary-foreground border-border", icon: Minus },
};

const CBOT_IMPACT: { contract: string; bias: NewsBias; note: string }[] = [
  { contract: "CBOT Wheat", bias: "Bullish", note: "MENA tenders + Black Sea tightness" },
  { contract: "CBOT Corn", bias: "Bearish", note: "Ethanol weakness + Brazil supply" },
  { contract: "CBOT Soybeans", bias: "Neutral", note: "China demand vs Brazil crop" },
];

function AIAnalyzer() {
  const [focus, setFocus] = useState<Focus>("Wheat");
  const [reportId, setReportId] = useState<ReportId>("wasde");
  const [commodity, setCommodity] = useState<Commodity>("Wheat");
  const data = useMemo(() => FOCUS_DATA[focus], [focus]);

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

        <USDAIntelligenceTable
          reportId={reportId} setReportId={setReportId}
          commodity={commodity} setCommodity={setCommodity}
        />
      </div>

      <Section
        title="News Summary"
        className="mt-6"
        actions={<><Badge variant="destructive">LIVE</Badge> <span className="text-[11px] text-muted-foreground">Aggregated & AI-summarized from primary sources</span></>}
      >
        <div className="grid gap-6 lg:grid-cols-4">
          {/* CBOT Price Impact - LEFT */}
          <div className="space-y-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">CBOT Price Impact</div>
            <div className="space-y-2">
              {CBOT_IMPACT.map((c) => {
                const tone = NEWS_BIAS_TONE[c.bias];
                const Icon = tone.icon;
                return (
                  <div key={c.contract} className="rounded-md border border-border p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{c.contract}</span>
                      <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${tone.chip}`}>
                        <Icon className="h-3 w-3" />
                        {c.bias}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] leading-snug text-muted-foreground">{c.note}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* News feed - RIGHT */}
          <div className="space-y-3 lg:col-span-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Market News · AI Summarized</div>
            <div className="space-y-3">
              {NEWS_ITEMS.map((n) => {
                const tone = NEWS_BIAS_TONE[n.bias];
                return (
                  <article key={n.headline} className="rounded-md border border-border p-3 hover:bg-secondary/30">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold leading-snug">{n.headline}</h4>
                      <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${tone.chip}`}>
                        {n.bias}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                      <span className="font-semibold">{n.source}</span>
                      <span>·</span>
                      <span>{n.timestamp}</span>
                      <span>·</span>
                      <span className="font-semibold text-foreground/80">{n.commodity}</span>
                    </div>
                    <div className="mt-2 flex items-start gap-2 rounded border-l-2 border-accent bg-secondary/30 p-2 text-xs leading-relaxed">
                      <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-accent" />
                      <p>{n.summary}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
