import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section, Badge } from "@/components/ui-bits";
import { UploadCloud, Building2 } from "lucide-react";

export const Route = createFileRoute("/audit")({ component: Audit });

function Audit() {
  return (
    <>
      <PageHeader title="Company Contract Audit Management" />

      <div className="mb-6 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-info">Company Directory</div>
            <div className="text-xs text-muted-foreground">Review references or upload new audit versions.</div>
          </div>
          <button className="text-xs font-semibold text-info">Show All Companies ↗</button>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">Alexandria Grains</span>
          <span className="ml-auto text-muted-foreground">▾</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          <Section title="Upload Contract">
            <div className="text-xs text-muted-foreground -mt-3 mb-3">Drag and drop or select file for AI audit</div>
            <div className="grid place-items-center rounded-lg border-2 border-dashed border-border bg-secondary/20 p-8 text-center">
              <UploadCloud className="h-10 w-10 text-muted-foreground" />
              <button className="mt-3 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
                UPLOAD PDF / DOCX
              </button>
            </div>
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
              ref="Total value is paid within 15 business days of cargo arrival date at discharge port."
              upload="Buyer is obligated to pay within 45 days of bill of lading date."
              note="Major discrepancy: 30-day deviation in payment window."
            />
            <Article
              tone="warning" tag="WARNING" title="Article 12: Force Majeure"
              ref="Force Majeure includes natural disasters, wars, and official epidemics preventing execution."
              upload="Force Majeure includes disasters, wars, epidemics, and labor strikes at ports."
              note="Clause expansion: Added labor strikes as protected event."
            />
            <Article
              tone="info" tag="ADJUSTMENT" title="Article 7: Delivery Window"
              ref="Delivery window starts July 1 and ends July 20 max."
              upload="Loading window starts July 1 and ends in July 25."
              note="Administrative note: 5-day alignment with current schedule."
            />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button className="rounded-md border border-border bg-card px-4 py-2 text-xs font-semibold">REJECT CHANGES</button>
            <button className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">APPROVE AUDITED VERSION</button>
          </div>
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

function Article({ tone, tag, title, ref, upload, note }: { tone: "destructive" | "warning" | "info"; tag: string; title: string; ref: string; upload: string; note: string }) {
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
          <p className="leading-relaxed">{ref}</p>
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
