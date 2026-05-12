import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader, Section } from "@/components/ui-bits";
import { Download } from "lucide-react";

export const Route = createFileRoute("/reports")({ component: Reports });

const reports = [
  { title: "Q4 FX Exposure Summary", type: "PDF", date: "Oct 22, 2024", size: "2.4 MB" },
  { title: "Hedge Effectiveness — Sep 2024", type: "XLSX", date: "Oct 04, 2024", size: "880 KB" },
  { title: "Counterparty Risk Review", type: "PDF", date: "Sep 28, 2024", size: "5.1 MB" },
  { title: "Margin & Liquidity Stress Test", type: "PDF", date: "Sep 15, 2024", size: "3.7 MB" },
];

function Reports() {
  return (
    <>
      <PageHeader title="Reports" subtitle="Board-ready risk and treasury reports." />
      <Section title="Recent Reports">
        <div className="divide-y divide-border">
          {reports.map((r) => (
            <div key={r.title} className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm font-semibold">{r.title}</div>
                <div className="text-xs text-muted-foreground">{r.date} · {r.size}</div>
              </div>
              <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-secondary">
                <Download className="h-3.5 w-3.5" /> {r.type}
              </button>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
