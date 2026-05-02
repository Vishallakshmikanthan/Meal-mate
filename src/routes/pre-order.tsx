import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, ClipboardCheck, Leaf } from "lucide-react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { MealCard } from "@/components/MealCard";
import { MEAL_TYPES, getTomorrowKey, menuData, type MealType } from "@/lib/menuData";
import { getPreOrder, savePreOrder } from "@/lib/storage";

export const Route = createFileRoute("/pre-order")({
  head: () => ({
    meta: [
      { title: "Pre-Order Tomorrow — MealOps" },
      { name: "description", content: "Pick what you'll eat tomorrow. Helps the mess reduce food waste by up to 40%." },
    ],
  }),
  component: PreOrderPage,
});

function PreOrderPage() {
  const tomorrow = getTomorrowKey();
  const menu = menuData[tomorrow];
  const [selections, setSelections] = useState<Record<string, number[]>>({});

  useEffect(() => {
    setSelections(getPreOrder());
  }, []);

  const toggle = (meal: MealType, id: number) => {
    setSelections((prev) => {
      const list = prev[meal] || [];
      const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
      return { ...prev, [meal]: next };
    });
  };

  const isSelected = (meal: MealType, id: number) => (selections[meal] || []).includes(id);

  const totals = MEAL_TYPES.reduce(
    (acc, m) => {
      const ids = selections[m] || [];
      menu[m].items
        .filter((i) => ids.includes(i.id))
        .forEach((i) => {
          acc.calories += i.calories;
          acc.protein += i.protein;
        });
      return acc;
    },
    { calories: 0, protein: 0 },
  );

  const totalCount = Object.values(selections).reduce((s, ids) => s + (ids?.length || 0), 0);

  const confirm = () => {
    if (totalCount === 0) {
      toast.error("Pick at least one dish.");
      return;
    }
    savePreOrder(selections);
    toast.success("Pre-order confirmed!", {
      description: "Helps reduce mess wastage by up to 40%.",
    });
    // confetti
    const end = Date.now() + 600;
    const colors = ["#1a3a0a", "#8BC34A", "#4a7c2f"];
    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  };

  return (
    <div className="px-5 py-6 max-w-2xl mx-auto">
      <header className="mb-5">
        <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground bg-card border border-border rounded-full px-3 py-1.5">
          <span className="size-1.5 rounded-full bg-[var(--leaf)]" /> Tomorrow · {tomorrow}
        </div>
        <h1 className="font-display text-3xl mt-3 leading-tight">Plan your plate.</h1>
        <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-1.5">
          <Leaf className="size-3.5 text-[var(--leaf)]" />
          Helps reduce mess wastage by up to 40%.
        </p>
      </header>

      <div className="space-y-7 mb-32">
        {MEAL_TYPES.map((meal) => (
          <section key={meal}>
            <div className="flex items-baseline justify-between mb-2.5">
              <h2 className="font-display text-xl capitalize">{meal}</h2>
              <span className="text-[11px] text-muted-foreground tabular-nums">{menu[meal].time}</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {menu[meal].items.map((item) => (
                <MealCard
                  key={item.id}
                  item={item}
                  selected={isSelected(meal, item.id)}
                  onToggle={(i) => toggle(meal, i.id)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Sticky confirm bar */}
      <div className="fixed bottom-20 inset-x-0 z-30 px-4 pb-2 pointer-events-none">
        <div className="max-w-2xl mx-auto pointer-events-auto rounded-2xl bg-card border border-border ink-shadow p-3 flex items-center gap-3 ring-gradient">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Projected</div>
            <div className="font-display text-xl tabular-nums leading-none">
              {totals.calories} <span className="text-xs text-muted-foreground">kcal</span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {totalCount} dishes · {totals.protein}g protein
            </div>
          </div>
          <button
            onClick={confirm}
            className="px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition glow-shadow min-tap active:scale-[0.98]"
          >
            {totalCount > 0 ? <ClipboardCheck className="size-4" /> : <Check className="size-4" />}
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
