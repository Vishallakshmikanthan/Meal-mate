import { createFileRoute, Link } from "@tanstack/react-router";
import { ChefHat, Users, TrendingUp, Utensils, ClipboardList, ArrowRight, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { getTodayKey, menuData, MEAL_TYPES } from "@/lib/menuData";
import { getPreOrder } from "@/lib/storage";

export const Route = createFileRoute("/provider/")({
  head: () => ({
    meta: [
      { title: "Provider Dashboard — MealOps" },
      { name: "description", content: "Kitchen overview: today's menu, pre-orders, and mess operations at a glance." },
    ],
  }),
  component: ProviderDashboard,
});

function ProviderDashboard() {
  const today = getTodayKey();
  const day = menuData[today];
  const [preOrders, setPreOrders] = useState<Record<string, number[]>>({});
  const [dateLabel, setDateLabel] = useState("");

  useEffect(() => {
    const upd = () => setPreOrders(getPreOrder());
    upd();
    window.addEventListener("mealops:update", upd);
    window.addEventListener("storage", upd);
    setDateLabel(new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" }));
    return () => {
      window.removeEventListener("mealops:update", upd);
      window.removeEventListener("storage", upd);
    };
  }, []);

  const totalPreOrders = Object.values(preOrders).reduce((s, ids) => s + (ids?.length || 0), 0);
  const totalDishesToday = MEAL_TYPES.reduce((s, m) => s + day[m].items.length, 0);
  const estimatedServings = totalPreOrders * 1; // 1 serving per pre-ordered item

  const stats = [
    { label: "Pre-Orders", value: totalPreOrders, Icon: ClipboardList, tint: "text-[var(--leaf)]" },
    { label: "Dishes Today", value: totalDishesToday, Icon: Utensils, tint: "text-primary" },
    { label: "Est. Servings", value: estimatedServings, Icon: Users, tint: "text-amber-700" },
    { label: "Cost / Plate", value: "₹42", Icon: DollarSign, tint: "text-emerald-700" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-5 pt-6 pb-4 space-y-5">
      <header>
        <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground bg-card border border-border rounded-full px-2.5 py-1 mb-3">
          <ChefHat className="size-3 text-[var(--leaf)]" /> Provider Console
        </div>
        <h1 className="font-display text-3xl leading-tight">Kitchen Overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{dateLabel || "Today"} · {today}</p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value, Icon, tint }) => (
          <div key={label} className="rounded-2xl bg-card border border-border p-4">
            <Icon className={`size-4 mb-2 ${tint}`} />
            <div className="text-2xl font-display font-semibold">{value}</div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <section className="rounded-2xl bg-card border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg">Today's Service</h2>
          <Link to="/provider/menu" className="text-xs font-semibold text-primary inline-flex items-center gap-1">
            Manage <ArrowRight className="size-3" />
          </Link>
        </div>
        <div className="space-y-2.5">
          {MEAL_TYPES.map((m) => (
            <div key={m} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <div className="text-sm font-semibold capitalize">{m}</div>
                <div className="text-[11px] text-muted-foreground">{day[m].time}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">{day[m].items.length} dishes</div>
                <div className="text-[11px] text-muted-foreground">
                  {(preOrders[m]?.length ?? 0)} pre-ordered
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl leaf-gradient text-primary-foreground p-4 flex items-center gap-3">
        <TrendingUp className="size-6 shrink-0" />
        <div className="flex-1">
          <div className="text-sm font-semibold">Waste down 18% this week</div>
          <div className="text-[11px] opacity-90">Pre-orders help you cook the right quantity.</div>
        </div>
      </section>
    </div>
  );
}
