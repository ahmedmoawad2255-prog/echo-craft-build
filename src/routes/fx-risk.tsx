import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader, Section, Badge, StatCard, Spark } from "@/components/ui-bits";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/fx-risk")({ component: FxRisk });

const banks = [
  { b: "NBE", r: "48.65", d: "+0.12%", active: true, sub: "National Bank of Egypt" },
  { b: "Banque Misr", r: "48.62", d: "0.00%", sub: "Institutional Rate" },
  { b: "CIB", r: "48.70", d: "+0.08%", sub: "Commercial Intl Bank" },
  { b: "HSBC Egypt", r: "48.58", d: "-0.02%", sub: "Global Liquidity Pool" },
  { b: "QNB", r: "48.55", d: "+0.15%", sub: "Qatar National Bank" },
  { b: "AlexBank", r: "48.60", d: "0.00%", sub: "Intesa Sanpaolo Group" },
];

function FxRisk() {
  const navigate = useNavigate();
  const [severity, setSeverity] = useState<"Mild" | "Moderate" | "Severe">("Moderate");
  const baseRate = 48.65;
  const sevMax = severity === "Mild" ? 8 : severity === "Moderate" ? 20 : 50;
  const [pct, setPct] = useState(15);
  const stressed = useMemo(() => baseRate * (1 + pct / 100), [pct]);
  const baseImpact = -6.8;
  const netImpact = useMemo(() => baseImpact - (pct / 100) * 56, [pct]);
  const incremental = netImpact - baseImpact;
  const stressLevel = pct >= 30 ? "CRITICAL" : pct >= 15 ? "ELEVATED" : "STABLE";
  const stressTone = pct >= 30 ? "destructive" : pct >= 15 ? "warning" : "success";
  const solvency = Math.max(0, Math.min(100, 100 - pct * 2.4));
  return (
    <>
      <PageHeader
        title="FX Risk & USD Exposure"
        subtitle="Monitor USD/EGP fluctuations and evaluate stress impact on unpaid commodity contracts."
      />

      <Section title="Bank Exchange Rates (USD/EGP)" actions={<span className="text-xs text-muted-foreground">Last Update: Oct 24, 14:30 EET</span>}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {banks.map((x) => (
            <div key={x.b} className={`rounded-md border p-3 ${x.active ? "border-accent bg-accent/5 ring-amber-glow" : "border-border"}`}>
              <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-foreground">
                <span className="font-semibold">{x.b}</span>
                <span className={x.d.startsWith("-") ? "text-destructive" : "text-success"}>{x.d}</span>
              </div>
              <div className="mt-1 font-mono-num text-2xl font-bold">{x.r}</div>
              {x.active && <div className="text-[10px] font-semibold uppercase text-accent-foreground">Active</div>}
              <div className="mt-1 text-[10px] text-muted-foreground">{x.sub}</div>
            </div>
          ))}
        </div>
      </Section>

      <div className="mt-6 grid gap-4 lg:grid-cols-4">
        <StatCard label="Total USD Liability" value="$58.1M" delta="+12.4% vs last week" tone="warning"
          spark={<Spark data={[40,42,48,50,53,55,58]} color="oklch(0.58 0.22 27)" />} />
        <StatCard label="FX MTM Impact" value="-$6.8M" delta="Unrealized EGP loss" tone="destructive"
          spark={<Spark data={[1,-1,-2,-3,-5,-6,-7]} color="oklch(0.58 0.22 27)" />} />
        <StatCard label="Value-at-Risk (95%)" value="$3.4M" hint="Daily Exposure Limit"
          spark={<Spark data={[3,3.2,3.1,3.4,3.3,3.5,3.4]} color="oklch(0.55 0.18 250)" />} />
        <div className="rounded-lg bg-hero-navy p-4 text-primary-foreground">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
            <Sparkles className="h-3.5 w-3.5" /> AI Risk Intelligence
          </div>
          <p className="mt-2 text-xs leading-relaxed text-primary-foreground/85">
            "The current FX exposure risk is elevated due to increased unpaid soybean meal contracts combined with rising USD/EGP volatility and weak hedge coverage."
          </p>
          <button onClick={() => { navigate({ to: "/ai-analyzer" }); }} className="mt-3 inline-flex items-center gap-1 rounded-md bg-accent px-2.5 py-1.5 text-[11px] font-semibold text-accent-foreground hover:bg-accent/90 transition-colors">
            View Strategic Recommendations →
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Section title="FX Stress Testing Center" className="lg:col-span-2"
          actions={
            <div className="flex gap-1 rounded-md bg-secondary p-0.5 text-xs">
              {(["Mild", "Moderate", "Severe"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSeverity(s);
                    const cap = s === "Mild" ? 8 : s === "Moderate" ? 20 : 50;
                    setPct((p) => Math.min(p, cap));
                  }}
                  className={`rounded px-3 py-1 transition-colors ${severity === s ? "bg-card font-semibold shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          }>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">USD Appreciation %</div>
              <div className="mt-1 font-mono-num text-3xl font-bold">+{pct.toFixed(1)}%</div>
              <input
                type="range"
                min={0}
                max={sevMax}
                step={0.5}
                value={pct}
                onChange={(e) => setPct(parseFloat(e.target.value))}
                className="mt-3 w-full accent-[oklch(0.78_0.16_75)]"
              />
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>Current ({baseRate.toFixed(2)})</span>
                <span>Max ({(baseRate * (1 + sevMax / 100)).toFixed(2)}) · {severity}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-md border border-border p-2">
                  <div className="text-[10px] uppercase text-muted-foreground">Stressed EGP Rate</div>
                  <div className="font-mono-num text-lg font-semibold">{stressed.toFixed(4)}</div>
                </div>
                <div className={`rounded-md border border-border p-2 ${stressTone === "destructive" ? "bg-destructive/10" : stressTone === "warning" ? "bg-accent/10" : "bg-success/10"}`}>
                  <div className={`text-[10px] uppercase ${stressTone === "destructive" ? "text-destructive" : stressTone === "warning" ? "text-accent-foreground" : "text-success"}`}>Liquidity Stress</div>
                  <div className={`text-lg font-semibold ${stressTone === "destructive" ? "text-destructive" : stressTone === "warning" ? "text-accent-foreground" : "text-success"}`}>{stressLevel}</div>
                </div>
              </div>
            </div>
            <div className="rounded-md bg-secondary/40 p-4">
              <div className="text-xs uppercase tracking-wide text-destructive">Recalculated Net Impact</div>
              <div className="mt-2 font-mono-num text-4xl font-bold text-destructive">${netImpact.toFixed(1)}M</div>
              <div className="mt-1 text-xs text-muted-foreground">⚠ Incremental Loss: ${Math.abs(incremental).toFixed(1)}M</div>
              <div className="mt-4 text-[11px] uppercase text-muted-foreground">Solvency Gauge</div>
              <div className="mt-2 h-2 rounded-full bg-secondary">
                <div className={`h-full rounded-full transition-all ${solvency < 40 ? "bg-destructive" : solvency < 70 ? "bg-accent" : "bg-success"}`} style={{ width: `${solvency}%` }} />
              </div>
              <div className="mt-1 text-right text-xs font-mono-num">{solvency.toFixed(0)}%</div>
            </div>
          </div>
        </Section>

        <Section title="Scenario Comparison">
          <div className="space-y-4 text-xs">
            <div className="flex justify-between font-semibold uppercase text-muted-foreground"><span>Open Accounts Payable</span><span>EGP Billion</span></div>
            <div>
              <div className="flex justify-between"><span>BASE</span><span className="font-mono-num">2.82</span></div>
              <div className="mt-1 h-3 rounded bg-primary/80" style={{ width: "75%" }} />
              <div className="mt-2 flex justify-between"><span>STRESSED</span><span className="font-mono-num">3.24</span></div>
              <div className="mt-1 h-3 rounded bg-destructive" style={{ width: "92%" }} />
            </div>
            <div className="flex justify-between font-semibold uppercase text-muted-foreground pt-2"><span>Outstanding Contracts</span><span>EGP Billion</span></div>
            <div>
              <div className="flex justify-between"><span>BASE</span><span className="font-mono-num">1.95</span></div>
              <div className="mt-1 h-3 rounded bg-primary/80" style={{ width: "55%" }} />
              <div className="mt-2 flex justify-between"><span>STRESSED</span><span className="font-mono-num">3.03</span></div>
              <div className="mt-1 h-3 rounded bg-destructive" style={{ width: "85%" }} />
            </div>
            <div className="rounded-md bg-secondary/50 p-2 text-[11px] leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">Observation:</span> Moderate stress scenario shifts $2.4B EGP from low-risk to high-risk liquidity buckets. Immediate hedging of Q4 contracts recommended.
            </div>
          </div>
        </Section>
      </div>

      <Section
        title="Open Unpaid Contracts Detail"
        className="mt-6"
        actions={
          <div className="flex gap-2">
            <button onClick={() => toast.info("Filter panel opening…")} className="rounded-md border border-border px-2.5 py-1.5 text-xs hover:bg-secondary">Filter</button>
            <button onClick={() => toast.success("Export queued · CSV will be emailed")} className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">Export Data</button>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Contract ID</th>
                <th className="py-2 pr-3 font-medium">Supplier</th>
                <th className="py-2 pr-3 font-medium">Commodity</th>
                <th className="py-2 pr-3 text-right font-medium">Volume (MT)</th>
                <th className="py-2 pr-3 font-medium">Due Date</th>
                <th className="py-2 pr-3 text-right font-medium">Outstanding USD</th>
                <th className="py-2 pr-3 text-right font-medium">EGP Valuation</th>
                <th className="py-2 pr-3 text-right font-medium">Stress Impact</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["C-2024-889","Cargill Inc.","Corn","25,000","Oct 20, 2024","12,450,000","605,692,500","+98.8M","Overdue","destructive"],
                ["C-2024-912","Bunge Global","Soybeans","18,500","Nov 05, 2024","9,820,000","477,743,000","+71.6M","Due Soon","warning"],
                ["C-2024-945","ADM","Wheat","42,000","Nov 28, 2024","15,200,000","739,480,000","+118.9M","Future","info"],
                ["C-2024-998","Louis Dreyfus","Corn","12,000","Dec 12, 2024","5,800,000","282,170,000","+42.3M","Future","info"],
              ].map((r) => (
                <tr key={r[0]}>
                  <td className="py-3 pr-3 font-mono-num text-xs text-info">{r[0]}</td>
                  <td className="py-3 pr-3 font-medium">{r[1]}</td>
                  <td className="py-3 pr-3"><Badge variant="neutral">{r[2]}</Badge></td>
                  <td className="py-3 pr-3 text-right font-mono-num">{r[3]}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{r[4]}</td>
                  <td className="py-3 pr-3 text-right font-mono-num">{r[5]}</td>
                  <td className="py-3 pr-3 text-right font-mono-num">{r[6]}</td>
                  <td className="py-3 pr-3 text-right font-mono-num text-destructive">{r[7]}</td>
                  <td className="py-3"><Badge variant={r[9] as any}>{r[8]}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 text-xs text-muted-foreground">Showing 4 of 28 Active Exposure items</div>
        </div>
      </Section>
    </>
  );
}
