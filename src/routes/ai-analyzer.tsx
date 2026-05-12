import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { PageHeader, Section, Badge } from "@/components/ui-bits";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/ai-analyzer")({ component: AIAnalyzer });

const FOCUS = ["All", "Wheat", "Corn", "Soybeans"] as const;
type Focus = typeof FOCUS[number];

const FOCUS_DATA: Record<Focus, {
  sentiment: string; pct: number; tone: "success" | "destructive" | "warning";
  summary: string;
  risks: { label: string; level: string; pct: number; tone: "destructive" | "warning" | "success" }[];
  rows: [string, string, string, string, string, string][];
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
    rows: [
      ["Wheat Ending Stocks (Global)", "257.7M MT", "258.5M MT", "-0.31%", "BULLISH", "success"],
      ["Corn Ending Stocks (US)", "1,999M Bu", "1,980M Bu", "+0.96%", "BEARISH", "destructive"],
      ["Soybean Prod. (Brazil)", "162.0M MT", "161.7M MT", "+0.62%", "BEARISH", "destructive"],
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
    rows: [
      ["Wheat Ending Stocks (Global)", "257.7M MT", "258.5M MT", "-0.31%", "BULLISH", "success"],
      ["Wheat Production (EU)", "126.2M MT", "127.1M MT", "-0.71%", "BULLISH", "success"],
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
    rows: [
      ["Corn Ending Stocks (US)", "1,999M Bu", "1,980M Bu", "+0.96%", "BEARISH", "destructive"],
      ["Corn Production (Brazil)", "127.0M MT", "126.0M MT", "+0.79%", "BEARISH", "destructive"],
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
    rows: [
      ["Soybean Prod. (Brazil)", "162.0M MT", "161.7M MT", "+0.62%", "BEARISH", "destructive"],
      ["Soybean Crush (China)", "9.8M MT", "9.6M MT", "+2.08%", "BULLISH", "success"],
    ],
    ai: "Range trade favored ($10.20–$10.85). Sell calls into resistance; protect downside with put spreads on CONAB upgrade risk.",
    headline: "Soy Complex Range-Bound Between Brazil Supply and China Demand",
    body: "Record-pace Brazilian planting offsets resilient Chinese crush margins. The cross-currency pass-through via BRL remains the dominant macro overlay.",
  },
};

function AIAnalyzer() {
  const [focus, setFocus] = useState<Focus>("Wheat");
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

        <Section title="USDA (WASDE) Market Deviation" className="lg:col-span-2"
          actions={<button onClick={() => { import("sonner").then(({ toast }) => toast.success(`WASDE ${focus} report exported (XLS)`)); }} className="rounded-md border border-border px-2.5 py-1.5 text-xs hover:bg-secondary">XLS Report</button>}>
          <div className="-mt-3 mb-3 text-xs text-muted-foreground">October Actuals vs. Bloomberg Consensus Survey · {focus}</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Market Instrument</th>
                  <th className="py-2 pr-3 text-right font-medium">Actual</th>
                  <th className="py-2 pr-3 text-right font-medium">Survey</th>
                  <th className="py-2 pr-3 text-right font-medium">Dev %</th>
                  <th className="py-2 font-medium">Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.rows.map((r) => (
                  <tr key={r[0]}>
                    <td className="py-3 pr-3 font-medium">{r[0]}</td>
                    <td className="py-3 pr-3 text-right font-mono-num">{r[1]}</td>
                    <td className="py-3 pr-3 text-right font-mono-num text-muted-foreground">{r[2]}</td>
                    <td className={`py-3 pr-3 text-right font-mono-num ${r[3].startsWith("-") ? "text-success" : "text-destructive"}`}>{r[3]}</td>
                    <td className="py-3"><Badge variant={r[5] as any}>{r[4]}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-md bg-secondary/50 p-3 text-xs">
            <Sparkles className="h-4 w-4 shrink-0 text-accent mt-0.5" />
            <p className="leading-relaxed">
              <span className="font-semibold">AI Synthesis:</span> {data.ai}
            </p>
          </div>
        </Section>
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
