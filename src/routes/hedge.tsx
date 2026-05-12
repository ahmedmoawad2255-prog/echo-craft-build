import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section, Badge } from "@/components/ui-bits";
import { AlertTriangle, Plus } from "lucide-react";

export const Route = createFileRoute("/hedge")({ component: Hedge });

function Hedge() {
  return (
    <>
      <PageHeader
        title="Hedge Tracking"
        subtitle="Physical positions vs. exchange-traded hedge contract synchronization."
        actions={
          <>
            <button className="rounded-md border border-border bg-card px-3 py-2 text-xs font-medium">Filter</button>
            <button className="rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">⇄ Settle Positions</button>
          </>
        }
      />

      <div className="mb-6 flex items-center justify-between rounded-md border border-destructive/30 bg-destructive/5 p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <div>
            <div className="text-sm font-semibold text-destructive">Critical: Unhedged Exposure</div>
            <div className="text-xs text-muted-foreground">25,000 MT of Wheat (PHY-2024-08) detected without exchange coverage.</div>
          </div>
        </div>
        <button className="rounded-md bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground">Cover Now</button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="Hedge Efficiency">
          <div className="flex items-center gap-6">
            <div className="relative grid h-32 w-32 place-items-center">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="oklch(0.92 0.01 255)" strokeWidth="10" fill="none" />
                <circle cx="50" cy="50" r="42" stroke="oklch(0.62 0.16 155)" strokeWidth="10" fill="none"
                  strokeDasharray={`${94 * 2.64} 999`} strokeLinecap="round" />
              </svg>
              <div className="text-center">
                <div className="font-mono-num text-3xl font-bold text-success">94%</div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div><span className="text-muted-foreground">Target:</span> <span className="font-semibold">95%</span></div>
              <div><span className="text-muted-foreground">Variance:</span> <span className="font-semibold text-destructive">-1.0%</span></div>
            </div>
          </div>
        </Section>

        <Section title="Unrealized P&L"
          actions={<div className="flex gap-1 text-[10px]">
            <Badge variant="info">CBOT</Badge><Badge variant="outline">MATIF</Badge>
          </div>}>
          <div className="font-mono-num text-3xl font-bold text-success">+$245,800<span className="text-base text-muted-foreground">.00</span></div>
          <div className="mt-3 flex items-end gap-1 h-16">
            {[40, 55, 35, 60, 48, 70, 62, 85, 80].map((h, i) => (
              <div key={i} className="flex-1 rounded-t bg-success/70" style={{ height: `${h}%` }} />
            ))}
          </div>
        </Section>
      </div>

      <Section title="Physical vs Futures Mapping" className="mt-6"
        actions={<div className="flex gap-3 text-[10px] uppercase">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" />Physical</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-accent" />Exchange</span>
        </div>}>
        <div className="space-y-3">
          {[
            { phy: "PHY-WHEAT-Q3", origin: "Origin: Romania | Port: Constantza", qty: "12,000 MT", ratio: "1 : 0.98", exch: "CBOT ZW Sep 24", price: "642.50", chg: "+2.1%", lots: "240 Lots", chgTone: "success" as const },
            { phy: "PHY-CORN-Q4", origin: "Origin: Brazil | Port: Santos", qty: "8,000 MT", ratio: "1 : 1.00", exch: "MATIF EMA Nov 24", price: "220.75", chg: "-0.8%", lots: "160 Lots", chgTone: "destructive" as const },
          ].map((r) => (
            <div key={r.phy} className="grid grid-cols-12 items-center gap-3 rounded-md border border-border p-3">
              <div className="col-span-4">
                <div className="font-semibold">{r.phy}</div>
                <div className="text-[11px] text-muted-foreground">{r.origin}</div>
              </div>
              <div className="col-span-1 text-xs font-mono-num text-muted-foreground">{r.qty}</div>
              <div className="col-span-2 rounded bg-primary px-2 py-1 text-center font-mono-num text-xs text-primary-foreground">{r.ratio}</div>
              <div className="col-span-3">
                <div className="font-semibold text-accent-foreground">{r.exch}</div>
                <div className="text-[11px] text-muted-foreground">Price: {r.price} <span className={r.chgTone === "success" ? "text-success" : "text-destructive"}>{r.chg}</span></div>
              </div>
              <div className="col-span-2 text-right text-xs font-mono-num">{r.lots}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Open Exchange Contracts" className="mt-6"
        actions={<button className="inline-flex items-center gap-1 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground"><Plus className="h-3 w-3" /> Add Trade</button>}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Contract</th>
                <th className="py-2 pr-3 font-medium">Exchange</th>
                <th className="py-2 pr-3 text-right font-medium">Qty (Lots)</th>
                <th className="py-2 pr-3 text-right font-medium">Ref Price</th>
                <th className="py-2 pr-3 text-right font-medium">Current Price</th>
                <th className="py-2 pr-3 text-right font-medium">Unrealized P&L</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["ZW Sep '24 (Wheat)", "CBOT", "250", "642.50", "658.25", "+$196,875", "success"],
                ["EMA Nov '24 (Corn)", "MATIF", "160", "228.75", "227.10", "-$13,200", "destructive"],
                ["ZC Dec '24 (Corn)", "CBOT", "400", "485.25", "491.50", "+$62,125", "success"],
              ].map((r) => (
                <tr key={r[0]}>
                  <td className="py-3 pr-3"><div className="font-medium">{r[0]}</div><div className="text-[11px] text-muted-foreground">REF-#1001</div></td>
                  <td className="py-3 pr-3"><Badge variant="neutral">{r[1]}</Badge></td>
                  <td className="py-3 pr-3 text-right font-mono-num">{r[2]}</td>
                  <td className="py-3 pr-3 text-right font-mono-num">{r[3]}</td>
                  <td className="py-3 pr-3 text-right font-mono-num">{r[4]}</td>
                  <td className={`py-3 pr-3 text-right font-mono-num font-semibold ${r[6] === "success" ? "text-success" : "text-destructive"}`}>{r[5]}</td>
                  <td className="py-3"><Badge variant="info">OPEN</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
