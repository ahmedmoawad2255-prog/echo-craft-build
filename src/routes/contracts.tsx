import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { PageHeader, Section, Badge } from "@/components/ui-bits";
import { Upload, Filter, X, FileSpreadsheet, Pencil, Check } from "lucide-react";

export const Route = createFileRoute("/contracts")({ component: Contracts });

type Tone = "success" | "warning" | "destructive";
type Row = {
  no: string; supplier: string; commodity: string; origin: string;
  qty: string; price: string; value: string; status: string; tone: Tone;
  date: string; due: string;
};

const initialRows: Row[] = [
  { no: "CONT-2024-8842", supplier: "Al-Wadi Industries", commodity: "Hard Wheat", origin: "Russia", qty: "12,500", price: "$310.00", value: "$3,875,000", status: "PARTIALLY PAID", tone: "warning", date: "2024/10/12", due: "2024/12/12" },
  { no: "CONT-2024-8841", supplier: "Golden Grain Est.", commodity: "Yellow Corn", origin: "Brazil", qty: "8,200", price: "$275.50", value: "$2,259,100", status: "FULLY PAID", tone: "success", date: "2024/10/11", due: "2024/11/25" },
  { no: "CONT-2024-8840", supplier: "Slow Land Ltd.", commodity: "Soybeans", origin: "USA", qty: "5,000", price: "$395.00", value: "$1,975,000", status: "UNPAID", tone: "destructive", date: "2024/10/10", due: "2024/11/10" },
  { no: "CONT-2024-8839", supplier: "Cargill Inc.", commodity: "Corn", origin: "USA", qty: "25,000", price: "$282.00", value: "$7,050,000", status: "FULLY PAID", tone: "success", date: "2024/10/09", due: "2024/12/01" },
  { no: "CONT-2024-8838", supplier: "Bunge Global", commodity: "Soybeans", origin: "Argentina", qty: "18,500", price: "$391.10", value: "$7,235,350", status: "PARTIALLY PAID", tone: "warning", date: "2024/10/08", due: "2024/11/30" },
];

const STATUS_TONE: Record<string, Tone> = {
  "FULLY PAID": "success",
  "PARTIALLY PAID": "warning",
  "UNPAID": "destructive",
};

const ROW_TINT: Record<Tone, string> = {
  success: "bg-success/5 hover:bg-success/10",
  warning: "bg-accent/10 hover:bg-accent/15",
  destructive: "bg-destructive/5 hover:bg-destructive/10",
};

function Contracts() {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [commodity, setCommodity] = useState("All Commodities");
  const [supplier, setSupplier] = useState("All Suppliers");
  const [modalOpen, setModalOpen] = useState(false);
  const [tab, setTab] = useState<"manual" | "excel">("manual");
  const [preview, setPreview] = useState<Row[] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () => rows.filter(
      (r) =>
        (commodity === "All Commodities" || r.commodity === commodity) &&
        (supplier === "All Suppliers" || r.supplier === supplier),
    ),
    [rows, commodity, supplier],
  );

  const openModal = () => { setTab("manual"); setPreview(null); setModalOpen(true); };

  return (
    <>
      <PageHeader
        title="Contract Operations Center"
        subtitle="Manage commodity purchase contracts, payment obligations, and supplier exposure in one centralized workspace."
        actions={
          <button
            onClick={openModal}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Upload className="h-3.5 w-3.5" /> Upload Contract
          </button>
        }
      />

      <div className="mb-6 overflow-hidden rounded-xl bg-hero-navy p-6 text-primary-foreground">
        <div className="text-xs uppercase tracking-[0.2em] text-primary-foreground/60">Total Outstanding Exposure</div>
        <div className="mt-3 flex items-baseline gap-3">
          <span className="font-mono-num text-5xl font-bold">$2,840,500</span>
          <span className="text-sm text-primary-foreground/60">USD</span>
        </div>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent/90 px-3 py-1 text-xs font-semibold text-accent-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Across {rows.length * 28} active contracts
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
            <span className="self-center text-xs text-muted-foreground">Showing {filtered.length} of {rows.length}</span>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-2.5 px-3 font-medium">Contract No</th>
                <th className="py-2.5 px-3 font-medium">Supplier</th>
                <th className="py-2.5 px-3 font-medium">Commodity</th>
                <th className="py-2.5 px-3 font-medium">Origin</th>
                <th className="py-2.5 px-3 text-right font-medium">Qty (MT)</th>
                <th className="py-2.5 px-3 text-right font-medium">Price $/MT</th>
                <th className="py-2.5 px-3 text-right font-medium">Total Value</th>
                <th className="py-2.5 px-3 font-medium">Status</th>
                <th className="py-2.5 px-3 font-medium">Purchase Date</th>
                <th className="py-2.5 px-3 font-medium">Expected Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((r) => (
                <tr key={r.no} className={`transition-colors ${ROW_TINT[r.tone]}`}>
                  <td className="py-3 px-3 font-mono-num text-xs text-info">{r.no}</td>
                  <td className="py-3 px-3 font-medium">{r.supplier}</td>
                  <td className="py-3 px-3 text-muted-foreground">{r.commodity}</td>
                  <td className="py-3 px-3 text-muted-foreground">{r.origin}</td>
                  <td className="py-3 px-3 text-right font-mono-num tabular-nums">{r.qty}</td>
                  <td className="py-3 px-3 text-right font-mono-num tabular-nums">{r.price}</td>
                  <td className="py-3 px-3 text-right font-mono-num tabular-nums font-semibold">{r.value}</td>
                  <td className="py-3 px-3"><Badge variant={r.tone}>{r.status}</Badge></td>
                  <td className="py-3 px-3 font-mono-num text-xs text-muted-foreground">{r.date}</td>
                  <td className="py-3 px-3 font-mono-num text-xs">{r.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={() => setModalOpen(false)}>
          <div
            className="w-full max-w-3xl rounded-xl border border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div>
                <h3 className="text-sm font-semibold">Upload Contract</h3>
                <p className="text-[11px] text-muted-foreground">Add contracts manually or import from a spreadsheet</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="rounded-md p-1 hover:bg-secondary"><X className="h-4 w-4" /></button>
            </div>

            <div className="flex gap-1 border-b border-border px-5 pt-3">
              {[
                { id: "manual" as const, label: "Manual Entry", icon: Pencil },
                { id: "excel" as const, label: "Upload Excel (.xlsx / .csv)", icon: FileSpreadsheet },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`inline-flex items-center gap-1.5 rounded-t-md px-3 py-2 text-xs font-medium transition-colors ${
                    tab === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" /> {label}
                </button>
              ))}
            </div>

            <div className="max-h-[65vh] overflow-y-auto p-5">
              {tab === "manual" ? (
                <ManualForm
                  onSubmit={(row) => {
                    setRows((prev) => [row, ...prev]);
                    toast.success(`Contract ${row.no} added`);
                    setModalOpen(false);
                  }}
                />
              ) : (
                <ExcelUpload
                  preview={preview}
                  onParse={(rs) => setPreview(rs)}
                  onConfirm={() => {
                    if (!preview) return;
                    setRows((prev) => [...preview, ...prev]);
                    toast.success(`${preview.length} contracts imported`);
                    setPreview(null);
                    setModalOpen(false);
                  }}
                  fileRef={fileRef}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

const inputCls = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none";

function ManualForm({ onSubmit }: { onSubmit: (row: Row) => void }) {
  const [f, setF] = useState({
    no: "", supplier: "", commodity: "Hard Wheat", origin: "", qty: "", price: "",
    status: "UNPAID", date: "", due: "",
  });
  const upd = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.value });

  const qtyN = parseFloat(f.qty.replace(/,/g, "")) || 0;
  const priceN = parseFloat(f.price.replace(/[$,]/g, "")) || 0;
  const total = qtyN * priceN;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.no || !f.supplier || !f.qty || !f.price || !f.date || !f.due) {
      toast.error("Please fill all required fields");
      return;
    }
    onSubmit({
      no: f.no, supplier: f.supplier, commodity: f.commodity, origin: f.origin,
      qty: qtyN.toLocaleString(), price: `$${priceN.toFixed(2)}`,
      value: `$${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      status: f.status, tone: STATUS_TONE[f.status] ?? "warning",
      date: f.date, due: f.due,
    });
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <Field label="Contract Number *"><input className={inputCls} value={f.no} onChange={upd("no")} placeholder="CONT-2024-XXXX" /></Field>
      <Field label="Supplier *"><input className={inputCls} value={f.supplier} onChange={upd("supplier")} /></Field>
      <Field label="Commodity">
        <select className={inputCls} value={f.commodity} onChange={upd("commodity")}>
          <option>Hard Wheat</option><option>Yellow Corn</option><option>Corn</option>
          <option>Soybeans</option><option>Soymeal</option><option>Soy Oil</option>
        </select>
      </Field>
      <Field label="Origin"><input className={inputCls} value={f.origin} onChange={upd("origin")} /></Field>
      <Field label="Quantity (MT) *"><input className={inputCls} value={f.qty} onChange={upd("qty")} inputMode="decimal" /></Field>
      <Field label="Price / MT (USD) *"><input className={inputCls} value={f.price} onChange={upd("price")} inputMode="decimal" /></Field>
      <Field label="Total Value (auto)"><input className={inputCls + " bg-secondary"} value={total ? `$${total.toLocaleString()}` : ""} readOnly /></Field>
      <Field label="Payment Status">
        <select className={inputCls} value={f.status} onChange={upd("status")}>
          <option>UNPAID</option><option>PARTIALLY PAID</option><option>FULLY PAID</option>
        </select>
      </Field>
      <Field label="Purchase Date *"><input type="date" className={inputCls} value={f.date} onChange={upd("date")} /></Field>
      <Field label="Expected Due Date *"><input type="date" className={inputCls} value={f.due} onChange={upd("due")} /></Field>

      <div className="md:col-span-2 mt-2 flex justify-end gap-2">
        <button type="submit" className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
          <Check className="h-3.5 w-3.5" /> Add Contract
        </button>
      </div>
    </form>
  );
}

function ExcelUpload({
  preview, onParse, onConfirm, fileRef,
}: {
  preview: Row[] | null;
  onParse: (rows: Row[]) => void;
  onConfirm: () => void;
  fileRef: React.RefObject<HTMLInputElement | null>;
}) {
  const handleFile = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) { toast.error("File appears empty"); return; }
      const parsed: Row[] = lines.slice(1).map((line) => {
        const c = line.split(",").map((s) => s.trim().replace(/^"|"$/g, ""));
        const status = (c[7] || "UNPAID").toUpperCase();
        return {
          no: c[0] || "—", supplier: c[1] || "—", commodity: c[2] || "—", origin: c[3] || "—",
          qty: c[4] || "0", price: c[5] || "$0", value: c[6] || "$0",
          status, tone: STATUS_TONE[status] ?? "warning",
          date: c[8] || "—", due: c[9] || "—",
        };
      });
      const invalid = parsed.filter((r) => r.no === "—" || r.supplier === "—").length;
      if (invalid) toast.warning(`${invalid} row(s) missing required fields`);
      onParse(parsed);
      toast.success(`Parsed ${parsed.length} rows — review preview`);
    } catch {
      toast.error("Failed to parse file");
    }
  };

  return (
    <div className="space-y-4">
      <div
        onClick={() => fileRef.current?.click()}
        className="cursor-pointer rounded-lg border-2 border-dashed border-border bg-secondary/30 p-8 text-center hover:border-primary hover:bg-secondary/50 transition-colors"
      >
        <FileSpreadsheet className="mx-auto h-8 w-8 text-muted-foreground" />
        <div className="mt-2 text-sm font-medium">Click to upload .xlsx or .csv</div>
        <div className="text-[11px] text-muted-foreground">
          Columns: Contract No, Supplier, Commodity, Origin, Qty, Price, Total, Status, Purchase Date, Due Date
        </div>
        <input
          ref={fileRef} type="file" accept=".csv,.xlsx" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
        />
      </div>

      {preview && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Import Preview ({preview.length} rows)</div>
            <button onClick={onConfirm} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
              <Check className="h-3.5 w-3.5" /> Confirm Import
            </button>
          </div>
          <div className="max-h-72 overflow-auto rounded-md border border-border">
            <table className="w-full text-xs">
              <thead className="bg-secondary/50 text-[10px] uppercase text-muted-foreground">
                <tr>
                  {["No", "Supplier", "Commodity", "Qty", "Price", "Status", "Due"].map((h) => (
                    <th key={h} className="px-2 py-1.5 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {preview.map((r, i) => (
                  <tr key={i} className={ROW_TINT[r.tone]}>
                    <td className="px-2 py-1.5 font-mono-num">{r.no}</td>
                    <td className="px-2 py-1.5">{r.supplier}</td>
                    <td className="px-2 py-1.5">{r.commodity}</td>
                    <td className="px-2 py-1.5 font-mono-num">{r.qty}</td>
                    <td className="px-2 py-1.5 font-mono-num">{r.price}</td>
                    <td className="px-2 py-1.5"><Badge variant={r.tone}>{r.status}</Badge></td>
                    <td className="px-2 py-1.5 font-mono-num">{r.due}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
