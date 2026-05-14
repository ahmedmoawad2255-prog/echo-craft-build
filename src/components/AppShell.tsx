import { Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  LayoutDashboard,
  FileText,
  LineChart,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Sparkles,
  ShieldCheck,
  Settings,
  LifeBuoy,
  Search,
  Bell,
  HelpCircle,
  Menu,
  X,
} from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/contracts", label: "Contracts", icon: FileText },
  { to: "/hedge", label: "Hedge Tracking", icon: TrendingUp },
  { to: "/fx-risk", label: "FX Risk", icon: LineChart },
  { to: "/margin", label: "Margin Calls", icon: AlertTriangle },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/ai-analyzer", label: "AI Analyzer", icon: Sparkles },
  { to: "/audit", label: "Audit", icon: ShieldCheck },
];

export function AppShell() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [path]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 lg:static lg:translate-x-0 lg:w-56 xl:w-64 ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="px-6 pt-6 pb-8">
          <div className="font-display text-xl font-bold tracking-tight">
            <span className="text-gradient-amber">GrainRisk</span> Pro
          </div>
          <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-sidebar-muted">
            Cargill Global / Enterprise Risk
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? path === "/" : path.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-sidebar-active text-sidebar-foreground border-l-2 border-accent"
                    : "text-sidebar-muted hover:bg-sidebar-active/60 hover:text-sidebar-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-3">
          <button
            onClick={() => { navigate({ to: "/fx-risk" }); toast.success("Opening Risk Management Console"); }}
            className="w-full rounded-md bg-accent px-3 py-2.5 text-sm font-semibold text-accent-foreground shadow-lg shadow-accent/20 transition-transform hover:scale-[1.01]"
          >
            + Manage Risk
          </button>
        </div>

        <div className="border-t border-sidebar-border px-3 py-3 space-y-1">
          <button
            onClick={() => toast.info("Support ticket portal opening…")}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-muted hover:bg-sidebar-active/60"
          >
            <LifeBuoy className="h-4 w-4" /> Support
          </button>
          <button
            onClick={() => toast.info("Settings panel coming online")}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-muted hover:bg-sidebar-active/60"
          >
            <Settings className="h-4 w-4" /> Settings
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-card/90 px-3 backdrop-blur sm:gap-4 sm:px-4 lg:px-6">
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-secondary lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="relative hidden max-w-md flex-1 sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search contracts, markets, suppliers…"
              className="w-full rounded-md border border-border bg-secondary/60 py-1.5 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none"
            />
          </div>
          <div className="flex-1 font-display text-sm font-bold tracking-tight sm:hidden">
            <span className="text-gradient-amber">GrainRisk</span> Pro
          </div>
          <nav className="hidden items-center gap-5 text-sm text-muted-foreground xl:flex">
            <button onClick={() => { navigate({ to: "/ai-analyzer" }); }} className="hover:text-foreground">Markets</button>
            <button onClick={() => { navigate({ to: "/fx-risk" }); }} className="hover:text-foreground">Liquidity</button>
            <button onClick={() => { navigate({ to: "/reports" }); }} className="hover:text-foreground">Reporting</button>
          </nav>
          <button onClick={() => toast.info("3 new alerts · 1 critical hedge gap")} className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-secondary"><Bell className="h-4 w-4" /></button>
          <button onClick={() => toast.info("Press ⌘K for shortcuts · docs.grainrisk.io")} className="hidden h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-secondary sm:grid"><HelpCircle className="h-4 w-4" /></button>
          <button
            onClick={() => toast.success("Trade ticket queued to OMS · awaiting confirmation")}
            className="hidden rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground shadow-sm sm:inline-flex"
          >
            Execute Trade
          </button>
          <div className="flex items-center gap-2 rounded-full border border-border bg-secondary/60 py-1 pl-1 pr-1 sm:pr-3">
            <div className="grid h-6 w-6 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">CRO</div>
            <div className="hidden text-xs leading-tight md:block">
              <div className="font-semibold">Chief Risk Officer</div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden p-3 sm:p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
