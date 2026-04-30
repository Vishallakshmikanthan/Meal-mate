import { Link, useLocation } from "@tanstack/react-router";
import { Home, CalendarDays, Camera, ClipboardList, History, Salad } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/menu", label: "Weekly Menu", icon: CalendarDays },
  { to: "/scan", label: "Food Scanner", icon: Camera },
  { to: "/pre-order", label: "Pre-Order", icon: ClipboardList },
  { to: "/meal-log", label: "Meal Log", icon: History },
] as const;

export function Sidebar() {
  const { pathname } = useLocation();
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border min-h-screen sticky top-0">
      <div className="px-6 pt-8 pb-6 flex items-center gap-3">
        <div className="size-10 rounded-xl warm-gradient flex items-center justify-center text-primary shadow-sm">
          <Salad className="size-5" strokeWidth={2.5} />
        </div>
        <div>
          <div className="font-display text-2xl leading-none tracking-tight">MealOps</div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-sidebar-foreground/60 mt-1">
            Mess, optimised
          </div>
        </div>
      </div>

      <nav className="px-3 mt-2 space-y-1 flex-1">
        {links.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm"
                  : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mx-3 mb-4 rounded-xl bg-sidebar-accent/60 text-xs text-sidebar-foreground/80 leading-relaxed">
        <div className="font-medium text-sidebar-foreground mb-1">100% offline-friendly</div>
        Your meal log lives in your browser. No accounts. No tracking.
      </div>
    </aside>
  );
}

export function MobileNav() {
  const { pathname } = useLocation();
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-t border-border">
      <div className="grid grid-cols-5">
        {links.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2.5 text-[10px]",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" strokeWidth={active ? 2.4 : 1.8} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
