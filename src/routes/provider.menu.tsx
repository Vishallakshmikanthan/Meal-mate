import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DAYS, MEAL_TYPES, menuData, getTodayKey, type DayKey } from "@/lib/menuData";
import { Clock, Utensils } from "lucide-react";

export const Route = createFileRoute("/provider/menu")({
  head: () => ({
    meta: [
      { title: "Menu Manager — MealOps Provider" },
      { name: "description", content: "Review and manage the weekly mess menu." },
    ],
  }),
  component: MenuManager,
});

function MenuManager() {
  const [day, setDay] = useState<DayKey>(getTodayKey());
  const dayMenu = menuData[day];

  return (
    <div className="max-w-2xl mx-auto px-5 pt-6 pb-4 space-y-4">
      <header>
        <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground bg-card border border-border rounded-full px-2.5 py-1 mb-3">
          <Utensils className="size-3 text-[var(--leaf)]" /> Menu Manager
        </div>
        <h1 className="font-display text-3xl leading-tight">Weekly Menu</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Preview what students see this week.</p>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {DAYS.map((d) => (
          <button
            key={d}
            onClick={() => setDay(d)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
              day === d
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {d.slice(0, 3)}
          </button>
        ))}
      </div>

      {MEAL_TYPES.map((m) => (
        <section key={m} className="rounded-2xl bg-card border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg capitalize">{m}</h2>
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="size-3" /> {dayMenu[m].time}
            </span>
          </div>
          <div className="space-y-2">
            {dayMenu[m].items.map((it) => (
              <div key={it.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <div className="text-sm font-semibold">{it.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {it.calories} kcal · P {it.protein}g · C {it.carbs}g · F {it.fat}g
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  it.type === "veg" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  {it.type === "veg" ? "VEG" : "NON-VEG"}
                </span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
