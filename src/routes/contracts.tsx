import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { PageHeader, Section, Badge } from "@/components/ui-bits";
import { Upload, Filter } from "lucide-react";

export const Route = createFileRoute("/contracts")({ component: Contracts });

const rows = [
  { no: "CONT-2024-8842", supplier: "Al-Wadi Industries", commodity: "Hard Wheat", origin: "Russia", qty: "12,500", price: "$310.00", value: "$3,875,000", status: "PARTIALLY PAID", tone: "warning" as const, date: "2024/10/12" },
  { no: "CONT-2024-8841", supplier: "Golden Grain Est.", commodity: "Yellow Corn", origin: "Brazil", qty: "8,200", price: "$275.50", value: "$2,259,100", status: "FULLY PAID", tone: "success" as const, date: "2024/10/11" },
  { no: "CONT-2024-8840", supplier: "Slow Land Ltd.", commodity: "Soybeans", origin: "USA", qty: "5,000", price: "$395.00", value: "$1,975,000", status: "UNPAID", tone: "destructive" as const, date: "2024/10/10" },
  { no: "CONT-2024-8839", supplier: "Cargill Inc.", commodity: "Corn", origin: "USA", qty: "25,000", price: "$282.00", value: "$7,050,000", status: "FULLY PAID", tone: "success" as const, date: "2024/10/09" },
  { no: "CONT-2024-8838", supplier: "Bunge Global", commodity: "Soybeans", origin: "Argentina", qty: "18,500", price: "$391.10", value: "$7,235,350", status: "PARTIALLY PAID", tone: "warning" as const, date: "2024/10/08" },
];

function Contracts() {
  const [commodity, setCommodity] = useState("All Commodities");
  const [supplier, setSupplier] = useState("All Suppliers");
  const fileRef = useRef<HTMLInputElement>(null);
  const filtered = rows.filter(
    (r) =>
      (commodity === "All Commodities" || r.commodity === commodity) &&
      (supplier === "All Suppliers" || r.supplier === supplier),
  );
  return (
    <>
      <PageHeader
        title="Contract Management & Upload"
        subtitle="Upload contract documents and use AI for automated data extraction."
        actions={
          <>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx"
              multiple
              className="hidden"
              onChange={(e) => {
                const n = e.target.files?.length ?? 0;
                if (n) toast.success(`${n} contract${n > 1 ? "s" : ""} queued for AI extraction`);
                e.target.value = "";
              }}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Upload className="h-3.5 w-3.5" /> Upload Contract
            </button>
          </>
        }
      />

      <div className="mb-6 overflow-hidden rounded-xl bg-hero-navy p-6 text-primary-foreground">
        <div className="text-xs uppercase tracking-[0.2em] text-primary-foreground/60">Total Outstanding Financial Obligations</div>
        <div className="mt-3 flex items-baseline gap-3">
          <span className="font-mono-num text-5xl font-bold">$2,840,500</span>
          <span className="text-sm text-primary-foreground/60">USD</span>
        </div>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent/90 px-3 py-1 text-xs font-semibold text-accent-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Across 142 active contracts
        </div>
      </div>

      <Section
        actions={
          <div className="flex flex-wrap gap-2">
            <select
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-xs"
            >
              <option>All Commodities</option>
              {[...new Set(rows.map((r) => r.commodity))].map((c) => <option key={c}>{c}</option>)}
            </select>
            <select
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-xs"
            >
              <option>All Suppliers</option>
              {[...new Set(rows.map((r) => r.supplier))].map((s) => <option key={s}>{s}</option>)}
            </select>
            <button
              onClick={() => toast.info("Advanced filters panel opening…")}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-secondary"
            >
              <Filter className="h-3 w-3" /> Advanced Filters
            </button>
            <span className="self-center text-xs text-muted-foreground">Showing {filtered.length} of 142</span>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Contract No</th>
                <th className="py-2 pr-4 font-medium">Supplier</th>
                <th className="py-2 pr-4 font-medium">Commodity</th>
                <th className="py-2 pr-4 font-medium">Origin</th>
                <th className="py-2 pr-4 text-right font-medium">Quantity (MT)</th>
                <th className="py-2 pr-4 text-right font-medium">Price $/MT</th>
                <th className="py-2 pr-4 text-right font-medium">Total Value</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 font-medium">Purchase Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((r, i) => (
                <tr key={r.no} className={i % 2 ? "bg-data-row-alt" : ""}>
                  <td className="py-3 pr-4 font-mono-num text-xs text-info">{r.no}</td>
                  <td className="py-3 pr-4 font-medium">{r.supplier}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{r.commodity}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{r.origin}</td>
                  <td className="py-3 pr-4 text-right font-mono-num text-info">{r.qty}</td>
                  <td className="py-3 pr-4 text-right font-mono-num">{r.price}</td>
                  <td className="py-3 pr-4 text-right font-mono-num font-semibold">{r.value}</td>
                  <td className="py-3 pr-4"><Badge variant={r.tone}>{r.status}</Badge></td>
                  <td className="py-3 font-mono-num text-xs text-muted-foreground">{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
