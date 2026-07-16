import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, Flame, Beef, Wheat, Droplet, ArrowRight, ClipboardList } from "lucide-react";
import { NutritionRing } from "@/components/NutritionRing";
import { MealCard } from "@/components/MealCard";
import { useNutritionData } from "@/hooks/useNutritionData";
import { getTodayKey, menuData, MEAL_TYPES, type MealType } from "@/lib/menuData";
import { logMeal, getPreOrder, tomorrowISO } from "@/lib/storage";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — MealOps" },
      { name: "description", content: "Today's mess menu, your nutrition stats, and tomorrow's pre-order at a glance." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const today = getTodayKey();
  const dayMenu = menuData[today];
  const { totals, goals, log } = useNutritionData();
  const [preOrderCount, setPreOrderCount] = useState(0);

  useEffect(() => {
    const update = () => {
      const p = getPreOrder();
      setPreOrderCount(Object.values(p).reduce((s, ids) => s + (ids?.length || 0), 0));
    };
    update();
    window.addEventListener("mealops:update", update);
    return () => window.removeEventListener("mealops:update", update);
  }, []);

  // Compute greeting/date on the client only to avoid SSR hydration mismatch
  // (server clock/timezone can differ from the user's).
  const [greeting, setGreeting] = useState("Hello");
  const [dateLabel, setDateLabel] = useState("");
  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
    setDateLabel(
      new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" }),
    );
  }, []);

  // Group log by meal
  const grouped = MEAL_TYPES.reduce<Record<MealType, typeof log>>((acc, m) => {
    acc[m] = log.filter((l) => l.mealType === m);
    return acc;
  }, { breakfast: [], lunch: [], snacks: [], dinner: [] });

  return (
    <div className="px-5 py-6 max-w-2xl mx-auto">
      {/* Greeting */}
      <header className="mb-5">
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          {dateLabel}
        </div>
        <h1 className="font-display text-3xl mt-1 leading-tight">
          {greeting}<span className="text-[var(--leaf)]">.</span>
        </h1>
      </header>

      {/* Calorie ring + 4 macro cards */}
      <section className="rounded-3xl bg-card border border-border p-5 ink-shadow ring-gradient mb-4 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 size-48 rounded-full bg-[var(--leaf)]/15 blur-3xl pointer-events-none" />
        <div className="relative">
          <NutritionRing />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 mb-6">
        <MacroCard
          icon={Flame}
          label="Calories"
          value={totals.calories}
          goal={goals.calories}
          unit="kcal"
          color="var(--primary)"
        />
        <MacroCard
          icon={Beef}
          label="Protein"
          value={totals.protein}
          goal={goals.protein}
          unit="g"
          color="var(--leaf)"
        />
        <MacroCard
          icon={Wheat}
          label="Carbs"
          value={totals.carbs}
          goal={goals.carbs}
          unit="g"
          color="var(--mid)"
        />
        <MacroCard
          icon={Droplet}
          label="Fat"
          value={totals.fat}
          goal={goals.fat}
          unit="g"
          color="var(--warm)"
        />
      </section>

      {/* Quick scan CTA */}
      <Link
        to="/scan"
        className="flex items-center justify-between gap-3 rounded-2xl leaf-gradient text-primary-foreground p-4 mb-6 glow-shadow min-tap active:scale-[0.99] transition"
      >
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
            <Camera className="size-5" />
          </div>
          <div>
            <div className="font-display text-lg leading-tight">Scan a plate</div>
            <div className="text-xs opacity-85">On-device AI · no upload</div>
          </div>
        </div>
        <ArrowRight className="size-5" />
      </Link>

      {/* Pre-order widget */}
      <Link
        to="/pre-order"
        className="flex items-center justify-between gap-3 rounded-2xl bg-card border border-border p-4 mb-7 hover-lift min-tap"
      >
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-xl bg-[var(--leaf)]/15 text-primary flex items-center justify-center">
            <ClipboardList className="size-5" />
          </div>
          <div>
            <div className="font-display text-base leading-tight">Tomorrow's pre-order</div>
            <div className="text-xs text-muted-foreground">
              {preOrderCount > 0 ? `${preOrderCount} dishes selected for ${tomorrowISO()}` : "Plan your plate ahead"}
            </div>
          </div>
        </div>
        <ArrowRight className="size-4 text-muted-foreground" />
      </Link>

      {/* Today's menu grouped */}
      <section className="mb-8">
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-1">
              Today's harvest
            </div>
            <h2 className="font-display text-2xl">Fresh off the counter</h2>
          </div>
          <Link to="/menu" className="text-xs font-semibold text-primary inline-flex items-center gap-1">
            Full week <ArrowRight className="size-3" />
          </Link>
        </div>

        <div className="space-y-6">
          {MEAL_TYPES.map((m) => (
            <div key={m}>
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="font-display text-lg capitalize">{m}</h3>
                <span className="text-[11px] text-muted-foreground tabular-nums">{dayMenu[m].time}</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {dayMenu[m].items.map((item) => (
                  <MealCard key={item.id} item={item} onLog={(i) => logMeal(m, [i])} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Today's log grouped */}
      <section>
        <div className="flex items-end justify-between mb-3">
          <h2 className="font-display text-2xl">Today's log</h2>
          <Link to="/meal-log" className="text-xs font-semibold text-primary inline-flex items-center gap-1">
            History <ArrowRight className="size-3" />
          </Link>
        </div>
        {log.length === 0 ? (
          <div className="text-sm text-muted-foreground py-10 text-center border border-dashed border-border rounded-2xl bg-card/50">
            Nothing logged yet. Tap "Add to log" on any dish above.
          </div>
        ) : (
          <div className="space-y-4">
            {MEAL_TYPES.filter((m) => grouped[m].length > 0).map((m) => (
              <div key={m} className="rounded-2xl bg-card border border-border p-4">
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2 capitalize">{m}</div>
                <ul className="space-y-1.5">
                  {grouped[m].map((entry) => (
                    <li key={entry.id} className="flex items-center justify-between text-sm">
                      <span className="truncate pr-2">{entry.items.map((i) => i.name).join(", ")}</span>
                      <span className="tabular-nums text-muted-foreground shrink-0">{entry.totalCalories} kcal</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MacroCard({
  icon: Icon,
  label,
  value,
  goal,
  unit,
  color,
}: {
  icon: typeof Flame;
  label: string;
  value: number;
  goal: number;
  unit: string;
  color: string;
}) {
  const pct = Math.min(100, Math.round((value / goal) * 100));
  return (
    <div className="rounded-2xl bg-card border border-border p-4 soft-shadow relative overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div
          className="size-8 rounded-lg flex items-center justify-center"
          style={{ background: `color-mix(in oklab, ${color} 15%, transparent)`, color }}
        >
          <Icon className="size-4" strokeWidth={2.4} />
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground tabular-nums">
          {pct}%
        </span>
      </div>
      <div className="font-display text-2xl tabular-nums leading-none">{value}<span className="text-sm text-muted-foreground ml-0.5">{unit}</span></div>
      <div className="text-[11px] text-muted-foreground mt-1">{label} · goal {goal}{unit}</div>
      <div className="h-1.5 rounded-full bg-muted mt-2.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}
