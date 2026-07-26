import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ClipboardList, Package } from "lucide-react";
import { getPreOrder, tomorrowISO } from "@/lib/storage";
import { MEAL_TYPES, menuData, getTomorrowKey } from "@/lib/menuData";

export const Route = createFileRoute("/provider/orders")({
  head: () => ({
    meta: [
      { title: "Pre-Orders — MealOps Provider" },
      { name: "description", content: "Tomorrow's pre-orders aggregated by dish." },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const [orders, setOrders] = useState<Record<string, number[]>>({});
  useEffect(() => {
    const upd = () => setOrders(getPreOrder());
    upd();
    window.addEventListener("mealops:update", upd);
    window.addEventListener("storage", upd);
    return () => {
      window.removeEventListener("mealops:update", upd);
      window.removeEventListener("storage", upd);
    };
  }, []);

  const day = menuData[getTomorrowKey()];
  const total = Object.values(orders).reduce((s, ids) => s + (ids?.length || 0), 0);

  return (
    <div className="max-w-2xl mx-auto px-5 pt-6 pb-4 space-y-4">
      <header>
        <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground bg-card border border-border rounded-full px-2.5 py-1 mb-3">
          <ClipboardList className="size-3 text-[var(--leaf)]" /> Pre-Orders
        </div>
        <h1 className="font-display text-3xl leading-tight">Tomorrow's Prep List</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {tomorrowISO()} · {total} items requested
        </p>
      </header>

      {total === 0 ? (
        <div className="rounded-2xl bg-card border border-border p-8 text-center">
          <Package className="size-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm font-semibold">No pre-orders yet</p>
          <p className="text-xs text-muted-foreground mt-1">Students can pre-order from the app.</p>
        </div>
      ) : (
        MEAL_TYPES.map((m) => {
          const ids = orders[m] ?? [];
          if (ids.length === 0) return null;
          const items = day[m].items.filter((i) => ids.includes(i.id));
          return (
            <section key={m} className="rounded-2xl bg-card border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-lg capitalize">{m}</h2>
                <span className="text-xs font-semibold text-primary">{ids.length} orders</span>
              </div>
              <div className="space-y-2">
                {items.map((it) => (
                  <div key={it.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="text-sm font-semibold">{it.name}</div>
                    <span className="text-xs text-muted-foreground">×1</span>
                  </div>
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
