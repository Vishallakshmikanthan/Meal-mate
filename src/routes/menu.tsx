import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MealCard } from "@/components/MealCard";
import { DAYS, MEAL_TYPES, getTodayKey, menuData, type DayKey } from "@/lib/menuData";
import { logMeal } from "@/lib/storage";
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
    <div className="px-5 sm:px-8 lg:px-12 py-8 lg:py-12 max-w-[1400px] mx-auto">
      <header className="mb-6">
        <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Mess menu</div>
        <h1 className="font-display text-4xl sm:text-5xl mt-2">A week of plates.</h1>
        <p className="text-muted-foreground mt-2 max-w-xl">
          Calories and macros are pre-computed from your hostel menu. Tap any dish to add it to today's log.
        </p>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 -mx-1 px-1 sticky top-0 bg-background/90 backdrop-blur z-10">
        {DAYS.map((d) => {
          const isActive = d === day;
          const isToday = d === today;
          return (
            <button
              key={d}
              onClick={() => setDay(d)}
              className={cn(
                "shrink-0 px-4 py-2.5 rounded-full text-sm font-medium transition border",
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
                    isActive ? "bg-primary-foreground/20" : "bg-accent text-accent-foreground",
                  )}
                >
                  Today
                </span>
              )}
            </button>
          );
        })}
      </div>

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
                  onLog={(i) => logMeal(meal, [i])}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
