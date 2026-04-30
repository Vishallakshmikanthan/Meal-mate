import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, ClipboardCheck } from "lucide-react";
import { MealCard } from "@/components/MealCard";
import { MEAL_TYPES, getTomorrowKey, menuData, type MealType } from "@/lib/menuData";
import { getPreOrder, savePreOrder } from "@/lib/storage";

export const Route = createFileRoute("/pre-order")({
  head: () => ({
    meta: [
      { title: "Pre-Order Tomorrow — MealOps" },
      { name: "description", content: "Pick what you'll eat tomorrow and see your projected calories before you sit down." },
    ],
  }),
  component: PreOrderPage,
});

function PreOrderPage() {
  const tomorrow = getTomorrowKey();
  const menu = menuData[tomorrow];
  const [selections, setSelections] = useState<Record<string, number[]>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSelections(getPreOrder());
  }, []);

  const toggle = (meal: MealType, id: number) => {
    setSelections((prev) => {
      const list = prev[meal] || [];
      const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
      return { ...prev, [meal]: next };
    });
    setSaved(false);
  };

  const isSelected = (meal: MealType, id: number) =>
    (selections[meal] || []).includes(id);

  const totals = MEAL_TYPES.reduce(
    (acc, m) => {
      const ids = selections[m] || [];
      menu[m].items
        .filter((i) => ids.includes(i.id))
        .forEach((i) => {
          acc.calories += i.calories;
          acc.protein += i.protein;
          acc.carbs += i.carbs;
          acc.fat += i.fat;
        });
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const save = () => {
    savePreOrder(selections);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="px-5 sm:px-8 lg:px-12 py-8 lg:py-12 max-w-[1400px] mx-auto">
      <header className="mb-8 flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground bg-card border border-border rounded-full px-3 py-1.5">
            <span className="size-1.5 rounded-full bg-[var(--accent)]" /> Tomorrow · {tomorrow}
          </div>
          <h1 className="font-display text-4xl sm:text-6xl mt-4 leading-[1.05] text-gradient">Plan your plate.</h1>
          <p className="text-muted-foreground mt-3 max-w-xl">
            Select what you intend to eat. We'll project your day's calories and you can save it as
            a personal pre-order.
          </p>
        </div>

        <div className="rounded-2xl bg-card border border-border p-4 ink-shadow flex items-center gap-5 ring-gradient">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Projected
            </div>
            <div className="font-display text-3xl tabular-nums">{totals.calories}</div>
            <div className="text-[10px] text-muted-foreground">kcal · P {totals.protein}g</div>
          </div>
          <button
            onClick={save}
            className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition glow-shadow"
          >
            {saved ? (
              <>
                <Check className="size-4" /> Saved
              </>
            ) : (
              <>
                <ClipboardCheck className="size-4" /> Save plan
              </>
            )}
          </button>
        </div>
      </header>

      <div className="space-y-8">
        {MEAL_TYPES.map((meal) => (
          <section key={meal}>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="font-display text-2xl capitalize">{meal}</h2>
              <span className="text-xs text-muted-foreground">{menu[meal].time}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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
    </div>
  );
}
