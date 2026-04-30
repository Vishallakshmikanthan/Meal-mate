import { Link, useLocation } from "@tanstack/react-router";
import { Home, CalendarDays, Camera, ClipboardList, History, Salad, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/menu", label: "Weekly Menu", icon: CalendarDays },
  { to: "/scan", label: "Food Scanner", icon: Camera, badge: "AI" },
  { to: "/pre-order", label: "Pre-Order", icon: ClipboardList },
  { to: "/meal-log", label: "Meal Log", icon: History },
] as const;

export function Sidebar() {
  const { pathname } = useLocation();
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border min-h-screen sticky top-0 relative overflow-hidden">
      {/* ambient glow */}
      <div className="pointer-events-none absolute -top-24 -left-16 size-64 rounded-full bg-[var(--leaf)] opacity-20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -right-16 size-56 rounded-full bg-[var(--accent)] opacity-10 blur-3xl" />

      <div className="relative px-6 pt-7 pb-6 flex items-center gap-3">
        <div className="size-10 rounded-xl warm-gradient flex items-center justify-center text-primary shadow-lg ring-1 ring-white/20">
          <Salad className="size-5" strokeWidth={2.5} />
        </div>
        <div>
          <div className="font-display text-2xl leading-none tracking-tight">MealOps</div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-sidebar-foreground/55 mt-1.5">
            Mess, optimised
          </div>
        </div>
      </div>

      <div className="relative px-3 mb-2">
        <div className="text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/40 px-3 mb-2">
          Workspace
        </div>
      </div>

      <nav className="relative px-3 space-y-1 flex-1">
        {links.map(({ to, label, icon: Icon, ...rest }) => {
          const badge = "badge" in rest ? rest.badge : undefined;
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all relative",
                active
                  ? "bg-white/10 text-sidebar-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-white/5 hover:text-sidebar-foreground",
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-r-full bg-[var(--leaf)] shadow-[0_0_12px_var(--leaf)]" />
              )}
              <Icon className={cn("size-4 transition-colors", active ? "text-[var(--leaf)]" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground")} />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[var(--accent)] text-[var(--accent-foreground)] font-semibold">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="relative p-4 mx-3 mb-4 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 text-xs text-sidebar-foreground/75 leading-relaxed">
        <div className="flex items-center gap-1.5 font-semibold text-sidebar-foreground mb-1.5">
          <Sparkles className="size-3.5 text-[var(--accent)]" /> 100% local
        </div>
        Your meal log stays in your browser. No accounts. No tracking. Ever.
      </div>
    </aside>
  );
}

export function MobileNav() {
  const { pathname } = useLocation();
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-border">
      <div className="grid grid-cols-5">
        {links.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] relative",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              {active && (
                <span className="absolute top-0 h-0.5 w-8 rounded-full bg-[var(--leaf)]" />
              )}
              <Icon className="size-5" strokeWidth={active ? 2.4 : 1.8} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
