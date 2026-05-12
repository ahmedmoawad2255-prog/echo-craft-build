import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader, StatCard, Section, Badge, Spark } from "@/components/ui-bits";
import { Sparkles, ArrowUpRight, ArrowDownRight } from "lucide-react";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
  return (
    <>
      <PageHeader
        title="Risk Command Center"
        subtitle="Live overview of contracts, FX exposure, hedge positions and AI-detected risk."
        actions={
          <button className="rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
            + New Trade
          </button>
        }
      />

      {/* Hero band */}
      <div className="mb-6 overflow-hidden rounded-xl bg-hero-navy p-6 text-primary-foreground shadow-xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-primary-foreground/60">
              Total Outstanding Financial Obligations
            </div>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="font-mono-num text-5xl font-bold tracking-tight">$2,840,500</span>
              <span className="text-sm text-primary-foreground/60">USD</span>
            </div>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent/90 px-3 py-1 text-xs font-semibold text-accent-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Across 142 active contracts
            </div>
          </div>
          <div className="flex gap-6 text-right">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-primary-foreground/50">Hedge Coverage</div>
              <div className="font-mono-num text-2xl font-semibold">94%</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-primary-foreground/50">Net VaR (95%)</div>
              <div className="font-mono-num text-2xl font-semibold text-accent">$3.4M</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-primary-foreground/50">Stress Δ</div>
              <div className="font-mono-num text-2xl font-semibold text-destructive">-$15.2M</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="USD Liability" value="$58.1M" delta="+12.4%" tone="warning" hint="vs last week"
          spark={<Spark data={[8,9,8,11,10,12,14,13,15]} color="oklch(0.78 0.16 75)" />} />
        <StatCard label="FX MTM Impact" value="-$6.8M" delta="-2.1%" tone="destructive" hint="Unrealized EGP loss"
          spark={<Spark data={[12,11,9,10,8,7,6,5,4]} color="oklch(0.58 0.22 27)" />} />
        <StatCard label="Hedge Efficiency" value="94%" delta="-1.0%" tone="success" hint="Target 95%"
          spark={<Spark data={[88,90,91,93,92,94,93,94,94]} color="oklch(0.62 0.16 155)" />} />
        <StatCard label="Open Positions" value="28" delta="+3" tone="default" hint="Active exposure items"
          spark={<Spark data={[22,23,25,24,26,27,27,28,28]} color="oklch(0.55 0.18 250)" />} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Section title="Recent Contract Activity" className="lg:col-span-2"
          actions={<a className="text-xs text-info hover:underline">View all →</a>}>
          <div className="divide-y divide-border">
            {[
              { id: "CONT-2024-8842", supplier: "Al-Wadi Industries", commodity: "Hard Wheat", val: "$3,875,000", status: "PARTIALLY PAID", tone: "warning" as const },
              { id: "CONT-2024-8841", supplier: "Golden Grain Est.", commodity: "Yellow Corn", val: "$2,259,100", status: "FULLY PAID", tone: "success" as const },
              { id: "CONT-2024-8840", supplier: "Slow Land Ltd.", commodity: "Soybeans", val: "$1,975,800", status: "UNPAID", tone: "destructive" as const },
              { id: "CONT-2024-8839", supplier: "Cargill Inc.", commodity: "Corn", val: "$12,450,000", status: "OVERDUE", tone: "destructive" as const },
            ].map((r) => (
              <div key={r.id} className="grid grid-cols-12 items-center gap-3 py-3 text-sm">
                <span className="col-span-3 font-mono-num text-xs text-muted-foreground">{r.id}</span>
                <span className="col-span-3 font-medium">{r.supplier}</span>
                <span className="col-span-2 text-muted-foreground">{r.commodity}</span>
                <span className="col-span-2 font-mono-num">{r.val}</span>
                <span className="col-span-2"><Badge variant={r.tone}>{r.status}</Badge></span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="AI Risk Intelligence"
          actions={<Badge variant="warning">LIVE</Badge>}>
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-md bg-secondary/50 p-3">
              <Sparkles className="h-4 w-4 shrink-0 text-accent" />
              <p className="text-sm leading-relaxed text-foreground/90">
                Elevated FX risk detected: unpaid soybean meal contracts combined with rising USD/EGP volatility and weak hedge coverage on Q4 wheat.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Weather (S. America)</span>
                <span className="font-semibold text-destructive">CRITICAL</span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary">
                <div className="h-full w-[88%] rounded-full bg-destructive" />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Geopolitical Conflict</span>
                <span className="font-semibold text-accent-foreground">MODERATE</span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary">
                <div className="h-full w-[55%] rounded-full bg-accent" />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">FX Volatility</span>
                <span className="font-semibold text-destructive">HIGH</span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary">
                <div className="h-full w-[72%] rounded-full bg-destructive/80" />
              </div>
            </div>
            <button className="w-full rounded-md bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground">
              View Strategic Recommendations →
            </button>
          </div>
        </Section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Section title="Market Sentiment">
          <div className="space-y-3">
            {[
              { c: "Wheat", v: "BULLISH", change: "+2.3%", up: true },
              { c: "Corn", v: "BEARISH", change: "-1.1%", up: false },
              { c: "Soy", v: "NEUTRAL", change: "+0.2%", up: true },
            ].map((m) => (
              <div key={m.c} className="flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <div className="text-sm font-semibold">{m.c}</div>
                  <div className="text-[11px] text-muted-foreground">CBOT · Dec '24</div>
                </div>
                <div className="text-right">
                  <Badge variant={m.v === "BULLISH" ? "success" : m.v === "BEARISH" ? "destructive" : "neutral"}>{m.v}</Badge>
                  <div className={`mt-1 flex items-center justify-end gap-1 text-xs font-mono-num ${m.up ? "text-success" : "text-destructive"}`}>
                    {m.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {m.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Bank Exchange Rates (USD/EGP)" className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {[
              { b: "NBE", r: "48.65", d: "+0.12%", active: true },
              { b: "Banque Misr", r: "48.62", d: "0.00%" },
              { b: "CIB", r: "48.70", d: "+0.08%" },
              { b: "HSBC Egypt", r: "48.58", d: "-0.02%" },
              { b: "QNB", r: "48.55", d: "+0.15%" },
              { b: "AlexBank", r: "48.60", d: "0.00%" },
            ].map((x) => (
              <div key={x.b} className={`rounded-md border p-3 ${x.active ? "border-accent bg-accent/5" : "border-border"}`}>
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-foreground">
                  <span>{x.b}</span>
                  <span className={x.d.startsWith("-") ? "text-destructive" : "text-success"}>{x.d}</span>
                </div>
                <div className="mt-1 font-mono-num text-xl font-semibold">{x.r}</div>
                {x.active && <div className="mt-0.5 text-[10px] font-semibold uppercase text-accent-foreground">Active</div>}
              </div>
            ))}
          </div>
        </Section>
      </div>
    </>
  );
}
