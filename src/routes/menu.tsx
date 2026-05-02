import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MealCard } from "@/components/MealCard";
import { DAYS, MEAL_TYPES, getTodayKey, menuData, type DayKey } from "@/lib/menuData";
import { logMeal } from "@/lib/storage";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Weekly Menu — MealOps" },
      { name: "description", content: "Browse the full 7-day mess menu with calories and macros for every dish." },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const [day, setDay] = useState<DayKey>(getTodayKey());
  const today = getTodayKey();
  const menu = menuData[day];

  return (
    <div className="px-5 py-6 max-w-2xl mx-auto">
      <header className="mb-4">
        <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground bg-card border border-border rounded-full px-3 py-1.5">
          <span className="size-1.5 rounded-full bg-[var(--leaf)]" /> Mess menu
        </div>
        <h1 className="font-display text-3xl mt-3 leading-tight">A week of plates.</h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Tap any dish to add it to today's log.
        </p>
      </header>

      {/* Sticky day tabs */}
      <div className="sticky top-0 z-20 -mx-5 px-5 py-3 bg-background/95 backdrop-blur border-b border-border mb-5">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {DAYS.map((d) => {
            const isActive = d === day;
            const isToday = d === today;
            return (
              <button
                key={d}
                onClick={() => setDay(d)}
                className={cn(
                  "shrink-0 px-4 py-2.5 rounded-full text-sm font-semibold transition border min-tap",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card border-border text-foreground hover:bg-secondary",
                )}
              >
                {d.slice(0, 3)}
                {isToday && (
                  <span
                    className={cn(
                      "ml-1.5 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full",
                      isActive ? "bg-primary-foreground/20" : "bg-[var(--leaf)] text-primary-foreground",
                    )}
                  >
                    Today
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-7">
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
                  onLog={(i) => {
                    logMeal(meal, [i]);
                    toast.success("Meal logged!", { description: `${i.name} · ${i.calories} kcal` });
                  }}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
