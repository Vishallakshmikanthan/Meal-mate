import { Link, useLocation } from "@tanstack/react-router";
import { Home, CalendarDays, QrCode, MessageCircle, LayoutDashboard, Utensils, BarChart3, HeartPulse, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/hooks/useRole";

const studentTabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/menu", label: "Menu", icon: CalendarDays },
  { to: "/collect", label: "Collect", icon: QrCode, accent: true },
  { to: "/health", label: "Health", icon: HeartPulse },
  { to: "/chat", label: "Chat", icon: MessageCircle },
] as const;

const providerTabs = [
  { to: "/provider", label: "Overview", icon: LayoutDashboard },
  { to: "/provider/menu", label: "Menu", icon: Utensils },
  { to: "/provider/qr", label: "QR", icon: QrCode, accent: true },
  { to: "/provider/orders", label: "Orders", icon: ClipboardList },
  { to: "/provider/analytics", label: "Insights", icon: BarChart3 },
] as const;


export function BottomNav() {
  const { pathname } = useLocation();
  const role = useRole();
  const tabs = role === "provider" ? providerTabs : studentTabs;
  const gridCols = tabs.length === 5 ? "grid-cols-5" : "grid-cols-4";
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 glass border-t border-border pb-safe px-safe"
      aria-label="Primary navigation"
    >
      <div className={cn("grid max-w-2xl mx-auto", gridCols)}>
        {tabs.map(({ to, label, icon: Icon, ...rest }) => {
          const accent = "accent" in rest && rest.accent;
          const active = pathname === to;
          if (accent) {
            return (
              <Link
                key={to}
                to={to}
                className="relative flex flex-col items-center justify-end pt-1 pb-1.5 min-tap"
              >
                <div
                  className={cn(
                    "size-12 -mt-5 rounded-2xl leaf-gradient text-primary-foreground flex items-center justify-center shadow-lg ring-4 ring-background transition-transform",
                    active && "scale-110",
                  )}
                >
                  <Icon className="size-5" strokeWidth={2.4} />
                </div>
                <span
                  className={cn(
                    "text-[10px] mt-0.5 font-medium",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          }
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2.5 min-tap text-[10px] relative font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              {active && (
                <span className="absolute top-0 h-1 w-8 rounded-b-full bg-[var(--leaf)]" />
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
