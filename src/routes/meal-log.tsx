import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { WeeklyChart } from "@/components/WeeklyChart";
import { useNutritionData } from "@/hooks/useNutritionData";
import { deleteMealLog, getMealLog, todayISO } from "@/lib/storage";

export const Route = createFileRoute("/meal-log")({
  head: () => ({
    meta: [
      { title: "Meal Log — MealOps" },
      { name: "description", content: "Your meal history with weekly calorie trends. Stored locally — yours alone." },
    ],
  }),
  component: MealLogPage,
});

function MealLogPage() {
  const { week } = useNutritionData();

  return (
    <div className="px-5 sm:px-8 lg:px-12 py-8 lg:py-12 max-w-5xl mx-auto">
      <header className="mb-8">
        <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Meal Log
        </div>
        <h1 className="font-display text-4xl sm:text-5xl mt-2">Your week, plated.</h1>
        <p className="text-muted-foreground mt-2 max-w-xl">
          Everything you've logged, day by day. All data lives in your browser — clear it anytime.
        </p>
      </header>

      <section className="rounded-3xl bg-card border border-border p-6 ink-shadow mb-8">
        <h2 className="font-display text-xl mb-3">Calories this week</h2>
        <WeeklyChart />
      </section>

      <div className="space-y-6">
        {week
          .slice()
          .reverse()
          .map((d) => {
            const entries = getMealLog(d.date);
            const isToday = d.date === todayISO();
            return (
              <section
                key={d.date}
                className="rounded-2xl bg-card border border-border p-5 ink-shadow"
              >
                <div className="flex items-baseline justify-between mb-3">
                  <div>
                    <h3 className="font-display text-xl">
                      {d.label}
                      {isToday && (
                        <span className="ml-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent text-accent-foreground align-middle">
                          Today
                        </span>
                      )}
                    </h3>
                    <div className="text-xs text-muted-foreground">{d.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl">{d.calories}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      kcal
                    </div>
                  </div>
                </div>
                {entries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No meals logged.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {entries.map((e) => (
                      <li key={e.id} className="py-2.5 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            {e.mealType}
                          </div>
                          <div className="text-sm truncate">
                            {e.items.map((i) => i.name).join(", ")}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-sm tabular-nums">{e.totalCalories} kcal</div>
                          <button
                            onClick={() => deleteMealLog(e.date, e.id)}
                            className="size-8 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center"
                            aria-label="Delete entry"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
      </div>
    </div>
  );
}
