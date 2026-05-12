import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { PageHeader, Section, Badge } from "@/components/ui-bits";
import { UploadCloud, Building2, ChevronDown, FileText, X, Check } from "lucide-react";

export const Route = createFileRoute("/audit")({ component: Audit });

const COMPANIES = [
  { id: "alex", name: "Alexandria Grains", country: "Egypt", contracts: 24 },
  { id: "wadi", name: "Al-Wadi Industries", country: "Saudi Arabia", contracts: 18 },
  { id: "golden", name: "Golden Grain Est.", country: "UAE", contracts: 12 },
  { id: "cargill", name: "Cargill Inc.", country: "USA", contracts: 41 },
  { id: "adm", name: "ADM Trading", country: "USA", contracts: 33 },
  { id: "louis", name: "Louis Dreyfus", country: "Netherlands", contracts: 27 },
];

type UploadedFile = { id: string; name: string; size: number; status: "uploading" | "analyzed" };

function Audit() {
  const [company, setCompany] = useState(COMPANIES[0]);
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [decision, setDecision] = useState<null | "approved" | "rejected">(null);
  const [confirming, setConfirming] = useState<null | "approve" | "reject">(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const accepted = Array.from(list).filter((f) => /\.(pdf|docx?)$/i.test(f.name));
    const newOnes: UploadedFile[] = accepted.map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random()}`,
      name: f.name,
      size: f.size,
      status: "uploading",
    }));
    setFiles((prev) => [...prev, ...newOnes]);
    newOnes.forEach((nf) => {
      setTimeout(() => {
        setFiles((prev) => prev.map((p) => (p.id === nf.id ? { ...p, status: "analyzed" } : p)));
      }, 1200);
    });
  };

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  return (
    <>
      <PageHeader title="Company Contract Audit Management" />

      <div className="mb-6 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-info">Company Directory</div>
            <div className="text-xs text-muted-foreground">Review references or upload new audit versions.</div>
          </div>
          <button className="text-xs font-semibold text-info" onClick={() => setOpen((o) => !o)}>
            Show All Companies ↗
          </button>
        </div>
        <div className="relative mt-3">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex w-full items-center gap-2 rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm hover:bg-secondary/60"
          >
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">{company.name}</span>
            <span className="text-xs text-muted-foreground">· {company.country} · {company.contracts} contracts</span>
            <ChevronDown className={`ml-auto h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
          {open && (
            <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-auto rounded-md border border-border bg-card shadow-lg">
              {COMPANIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setCompany(c); setOpen(false); }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-secondary/60 ${c.id === company.id ? "bg-secondary/40" : ""}`}
                >
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{c.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{c.country} · {c.contracts}</span>
                  {c.id === company.id && <Check className="h-4 w-4 text-success" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          <Section title="Upload Contract">
            <div className="text-xs text-muted-foreground -mt-3 mb-3">
              Drag and drop or select file for AI audit · {company.name}
            </div>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
              className={`grid place-items-center rounded-lg border-2 border-dashed p-8 text-center transition-colors ${dragOver ? "border-accent bg-accent/10" : "border-border bg-secondary/20"}`}
            >
              <UploadCloud className="h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-xs text-muted-foreground">PDF or DOCX, up to 10MB</p>
              <button
                onClick={() => inputRef.current?.click()}
                className="mt-3 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                UPLOAD PDF / DOCX
              </button>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                multiple
                className="hidden"
                onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
              />
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="text-[11px] font-semibold uppercase text-muted-foreground">Uploaded Files ({files.length})</div>
                {files.map((f) => (
                  <div key={f.id} className="flex items-center gap-2 rounded-md border border-border bg-secondary/30 px-2 py-2 text-xs">
                    <FileText className="h-4 w-4 shrink-0 text-info" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{f.name}</div>
                      <div className="text-[10px] text-muted-foreground">{(f.size / 1024).toFixed(1)} KB</div>
                    </div>
                    {f.status === "uploading" ? (
                      <Badge variant="warning">ANALYZING…</Badge>
                    ) : (
                      <Badge variant="success">ANALYZED</Badge>
                    )}
                    <button onClick={() => removeFile(f.id)} className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-destructive">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Audit Statistics">
            <div className="space-y-3 text-sm">
              <Row label="Matching Items" value="18" tone="success" />
              <Row label="Critical Deviations" value="03" tone="destructive" />
              <Row label="Linguistic Adjustments" value="05" tone="warning" />
              <div className="pt-2">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Match Rate</span><span className="font-bold">72%</span></div>
                <div className="mt-1 h-2 rounded-full bg-secondary">
                  <div className="h-full w-[72%] rounded-full bg-accent" />
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground">Target Minimum: 80%</div>
              </div>
            </div>
          </Section>
        </div>

        <Section title="Contractual Deviation Analysis" className="lg:col-span-2"
          actions={
            <div className="flex rounded-md bg-secondary p-0.5 text-xs">
              <button className="rounded bg-card px-3 py-1 font-semibold shadow">DISCREPANCIES</button>
              <button className="rounded px-3 py-1 text-muted-foreground">FULL TEXT</button>
            </div>
          }>
          <div className="space-y-4">
            <Article
              tone="destructive" tag="CRITICAL" title="Article 4: Payment Terms"
              refText="Total value is paid within 15 business days of cargo arrival date at discharge port."
              upload="Buyer is obligated to pay within 45 days of bill of lading date."
              note="Major discrepancy: 30-day deviation in payment window."
            />
            <Article
              tone="warning" tag="WARNING" title="Article 12: Force Majeure"
              refText="Force Majeure includes natural disasters, wars, and official epidemics preventing execution."
              upload="Force Majeure includes disasters, wars, epidemics, and labor strikes at ports."
              note="Clause expansion: Added labor strikes as protected event."
            />
            <Article
              tone="info" tag="ADJUSTMENT" title="Article 7: Delivery Window"
              refText="Delivery window starts July 1 and ends July 20 max."
              upload="Loading window starts July 1 and ends in July 25."
              note="Administrative note: 5-day alignment with current schedule."
            />
          </div>
          {decision && (
            <div className={`mt-6 rounded-md border p-3 text-xs font-semibold ${decision === "approved" ? "border-success/40 bg-success/10 text-success" : "border-destructive/40 bg-destructive/10 text-destructive"}`}>
              {decision === "approved"
                ? `✓ Audited version APPROVED for ${company.name} · ${new Date().toLocaleString()}`
                : `✕ Changes REJECTED for ${company.name} · ${new Date().toLocaleString()}`}
              <button onClick={() => setDecision(null)} className="ml-3 underline opacity-70 hover:opacity-100">undo</button>
            </div>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setConfirming("reject")}
              className="rounded-md border border-border bg-card px-4 py-2 text-xs font-semibold hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 transition-colors"
            >
              REJECT CHANGES
            </button>
            <button
              onClick={() => setConfirming("approve")}
              className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              APPROVE AUDITED VERSION
            </button>
          </div>

          {confirming && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={() => setConfirming(null)}>
              <div className="w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <h4 className="text-base font-semibold">
                  {confirming === "approve" ? "Approve audited version?" : "Reject changes?"}
                </h4>
                <p className="mt-2 text-xs text-muted-foreground">
                  {confirming === "approve"
                    ? `This will mark the uploaded contract for ${company.name} as the new approved reference.`
                    : `This will discard the uploaded changes for ${company.name} and keep the standard reference.`}
                </p>
                <div className="mt-5 flex justify-end gap-2">
                  <button onClick={() => setConfirming(null)} className="rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold hover:bg-secondary">Cancel</button>
                  <button
                    onClick={() => { setDecision(confirming === "approve" ? "approved" : "rejected"); setConfirming(null); }}
                    className={`rounded-md px-3 py-2 text-xs font-semibold text-primary-foreground ${confirming === "approve" ? "bg-success hover:bg-success/90" : "bg-destructive hover:bg-destructive/90"}`}
                  >
                    {confirming === "approve" ? "Confirm Approve" : "Confirm Reject"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </Section>
      </div>
    </>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone: "success" | "destructive" | "warning" }) {
  const c = tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : "text-accent-foreground";
  return (
    <div className="flex items-center justify-between border-b border-border pb-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-mono-num text-lg font-bold ${c}`}>{value}</span>
    </div>
  );
}

function Article({ tone, tag, title, refText, upload, note }: { tone: "destructive" | "warning" | "info"; tag: string; title: string; refText: string; upload: string; note: string }) {
  const borderClass = tone === "destructive" ? "border-l-destructive" : tone === "warning" ? "border-l-accent" : "border-l-info";
  return (
    <div className={`rounded-md border border-border bg-card border-l-4 p-3 ${borderClass}`}>
      <div className="flex items-center gap-2">
        <Badge variant={tone}>{tag}</Badge>
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2 text-xs">
        <div>
          <div className="mb-1 font-semibold uppercase text-muted-foreground">Standard Reference</div>
          <p className="leading-relaxed">{refText}</p>
        </div>
        <div className="rounded bg-secondary/40 p-2">
          <div className="mb-1 font-semibold uppercase text-muted-foreground">New Upload</div>
          <p className="leading-relaxed">{upload}</p>
        </div>
      </div>
      <div className={`mt-3 text-[11px] font-medium ${tone === "destructive" ? "text-destructive" : tone === "warning" ? "text-accent-foreground" : "text-info"}`}>
        ⓘ {note}
      </div>
    </div>
  );
}
