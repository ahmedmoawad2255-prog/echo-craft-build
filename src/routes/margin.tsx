import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section, Badge } from "@/components/ui-bits";

export const Route = createFileRoute("/margin")({ component: Margin });

function Margin() {
  return (
    <>
      <PageHeader title="Margin Calls" subtitle="Real-time exchange margin requirements and broker liquidity status." />
      <Section title="Active Margin Requirements">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Broker</th>
                <th className="py-2 pr-3 font-medium">Account</th>
                <th className="py-2 pr-3 text-right font-medium">Initial Margin</th>
                <th className="py-2 pr-3 text-right font-medium">Variation Call</th>
                <th className="py-2 pr-3 font-medium">Deadline</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["ADM Investor Services", "ACC-CBOT-001", "$2,450,000", "$185,200", "Today 16:00 CST", "URGENT", "destructive"],
                ["ED&F Man Capital", "ACC-MATIF-022", "€1,180,000", "€42,500", "Tomorrow 12:00 CET", "PENDING", "warning"],
                ["StoneX", "ACC-CBOT-104", "$3,820,000", "$0", "—", "FUNDED", "success"],
              ].map((r) => (
                <tr key={r[1]}>
                  <td className="py-3 pr-3 font-medium">{r[0]}</td>
                  <td className="py-3 pr-3 font-mono-num text-xs text-info">{r[1]}</td>
                  <td className="py-3 pr-3 text-right font-mono-num">{r[2]}</td>
                  <td className="py-3 pr-3 text-right font-mono-num font-semibold">{r[3]}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{r[4]}</td>
                  <td className="py-3"><Badge variant={r[6] as any}>{r[5]}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
