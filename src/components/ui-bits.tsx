import { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  tone = "default",
  hint,
  spark,
}: {
  label: string;
  value: ReactNode;
  delta?: string;
  tone?: "default" | "success" | "destructive" | "warning";
  hint?: string;
  spark?: ReactNode;
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "destructive"
      ? "text-destructive"
      : tone === "warning"
      ? "text-accent"
      : "text-muted-foreground";

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
        <span>{label}</span>
        {delta && <span className={toneClass + " font-mono-num"}>{delta}</span>}
      </div>
      <div className="mt-2 font-mono-num text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </div>
      {hint && <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>}
      {spark && <div className="mt-3">{spark}</div>}
    </div>
  );
}

export function Badge({
  children,
  variant = "neutral",
}: {
  children: ReactNode;
  variant?: "neutral" | "success" | "warning" | "destructive" | "info" | "outline";
}) {
  const cls = {
    neutral: "bg-secondary text-secondary-foreground",
    success: "bg-success/15 text-success",
    warning: "bg-accent/20 text-accent-foreground",
    destructive: "bg-destructive/15 text-destructive",
    info: "bg-info/15 text-info",
    outline: "border border-border text-muted-foreground",
  }[variant];
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${cls}`}>
      {children}
    </span>
  );
}

export function Section({
  title,
  actions,
  children,
  className = "",
}: {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-lg border border-border bg-card shadow-sm ${className}`}>
      {(title || actions) && (
        <header className="flex items-center justify-between border-b border-border px-5 py-3">
          {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
          {actions}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

// Tiny inline sparkline
export function Spark({
  data,
  color = "currentColor",
  height = 28,
}: {
  data: number[];
  color?: string;
  height?: number;
}) {
  const w = 80;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={w} height={height} className="overflow-visible">
      <polyline fill="none" stroke={color} strokeWidth={1.5} points={pts} />
    </svg>
  );
}
