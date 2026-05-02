import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2, Download, Target, X, Check } from "lucide-react";
import { toast } from "sonner";
import { WeeklyChart } from "@/components/WeeklyChart";
import { useNutritionData } from "@/hooks/useNutritionData";
import {
  deleteMealLog,
  getMealLog,
  todayISO,
  getUserGoals,
  setUserGoals,
  type UserGoals,
} from "@/lib/storage";

export const Route = createFileRoute("/meal-log")({
  head: () => ({
    meta: [
      { title: "Meal Log — MealOps" },
      { name: "description", content: "Your meal history with weekly calorie trends. All data stays in your browser." },
    ],
  }),
  component: MealLogPage,
});

function MealLogPage() {
  const { week } = useNutritionData();
  const [goalsOpen, setGoalsOpen] = useState(false);

  const exportData = () => {
    const dump: Record<string, unknown> = {
      exportedAt: new Date().toISOString(),
      goals: getUserGoals(),
      days: {} as Record<string, unknown>,
    };
    week.forEach((d) => {
      (dump.days as Record<string, unknown>)[d.date] = getMealLog(d.date);
    });
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mealops-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported to JSON");
  };

  return (
    <div className="px-5 py-6 max-w-2xl mx-auto">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground bg-card border border-border rounded-full px-3 py-1.5">
            <span className="size-1.5 rounded-full bg-[var(--leaf)]" /> Meal log
          </div>
          <h1 className="font-display text-3xl mt-3 leading-tight">Your week, plated.</h1>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <button
          onClick={() => setGoalsOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-card border border-border p-3 text-sm font-medium hover-lift min-tap"
        >
          <Target className="size-4 text-[var(--leaf)]" /> Set goals
        </button>
        <button
          onClick={exportData}
          className="flex items-center gap-2 rounded-xl bg-card border border-border p-3 text-sm font-medium hover-lift min-tap"
        >
          <Download className="size-4 text-[var(--leaf)]" /> Export JSON
        </button>
      </div>

      <section className="rounded-2xl bg-card border border-border p-5 ink-shadow mb-6">
        <h2 className="font-display text-lg mb-3">Calories this week</h2>
        <WeeklyChart />
      </section>

      <div className="space-y-4">
        {week
          .slice()
          .reverse()
          .map((d) => {
            const entries = getMealLog(d.date);
            const isToday = d.date === todayISO();
            return (
              <section key={d.date} className="rounded-2xl bg-card border border-border p-4 soft-shadow">
                <div className="flex items-baseline justify-between mb-2">
                  <div>
                    <h3 className="font-display text-lg">
                      {d.label}
                      {isToday && (
                        <span className="ml-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--leaf)] text-primary-foreground align-middle font-bold">
                          Today
                        </span>
                      )}
                    </h3>
                    <div className="text-[11px] text-muted-foreground">{d.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl tabular-nums">{d.calories}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">kcal</div>
                  </div>
                </div>
                {entries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No meals logged.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {entries.map((e) => (
                      <li key={e.id} className="py-2.5 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground capitalize">
                            {e.mealType}
                          </div>
                          <div className="text-sm truncate">
                            {e.items.map((i) => i.name).join(", ")}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-sm tabular-nums">{e.totalCalories} kcal</div>
                          <button
                            onClick={() => {
                              deleteMealLog(e.date, e.id);
                              toast.success("Entry removed");
                            }}
                            className="size-9 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center min-tap"
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

      {goalsOpen && <GoalsDialog onClose={() => setGoalsOpen(false)} />}
    </div>
  );
}

function GoalsDialog({ onClose }: { onClose: () => void }) {
  const [goals, setGoalsState] = useState<UserGoals>(getUserGoals());
  const fields: { key: keyof UserGoals; label: string; unit: string }[] = [
    { key: "calories", label: "Calories", unit: "kcal" },
    { key: "protein", label: "Protein", unit: "g" },
    { key: "carbs", label: "Carbs", unit: "g" },
    { key: "fat", label: "Fat", unit: "g" },
    { key: "fiber", label: "Fiber", unit: "g" },
  ];
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4 animate-in fade-in-0"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-card rounded-3xl border border-border p-5 ink-shadow animate-in slide-in-from-bottom-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl">Daily goals</h3>
          <button onClick={onClose} className="size-9 rounded-lg hover:bg-muted flex items-center justify-center min-tap">
            <X className="size-4" />
          </button>
        </div>
        <div className="space-y-3">
          {fields.map(({ key, label, unit }) => (
            <label key={key} className="block">
              <div className="text-xs text-muted-foreground mb-1">{label} ({unit})</div>
              <input
                type="number"
                inputMode="numeric"
                value={goals[key]}
                onChange={(e) =>
                  setGoalsState((g) => ({ ...g, [key]: Number(e.target.value) || 0 }))
                }
                className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring text-sm tabular-nums"
              />
            </label>
          ))}
        </div>
        <button
          onClick={() => {
            setUserGoals(goals);
            toast.success("Goals updated");
            onClose();
          }}
          className="w-full mt-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 min-tap"
        >
          <Check className="size-4" /> Save goals
        </button>
      </div>
    </div>
  );
}
