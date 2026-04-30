import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Camera, ClipboardList, CalendarDays, Salad } from "lucide-react";
import { NutritionRing } from "@/components/NutritionRing";
import { MacroBars } from "@/components/MacroBars";
import { WeeklyChart } from "@/components/WeeklyChart";
import { MealCard } from "@/components/MealCard";
import { useNutritionData } from "@/hooks/useNutritionData";
import { getTodayKey, menuData, MEAL_TYPES, type MealType } from "@/lib/menuData";
import { logMeal } from "@/lib/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — MealOps" },
      {
        name: "description",
        content: "Today's mess menu, your nutrition stats, and weekly calorie trend at a glance.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const today = getTodayKey();
  const dayMenu = menuData[today];
  const { log } = useNutritionData();
  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 17
        ? "Good afternoon"
        : "Good evening";

  return (
    <div className="relative px-5 sm:px-8 lg:px-12 py-8 lg:py-12 max-w-[1400px] mx-auto">
      {/* Header */}
      <header className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            {today} · {new Date().toLocaleDateString("en-US", { day: "numeric", month: "long" })}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl mt-2">
            {greeting}, hungry friend.
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Here's what's cooking, what you've eaten, and how your week is shaping up.
          </p>
        </div>
        <Link
          to="/scan"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 ink-shadow"
        >
          <Camera className="size-4" /> Scan a plate
        </Link>
      </header>

      {/* Top grid: ring + macros + week */}
      <section className="grid lg:grid-cols-3 gap-5 mb-10">
        <div className="rounded-3xl bg-card border border-border p-6 ink-shadow">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-display text-xl">Today's plate</h2>
            <Salad className="size-4 text-muted-foreground" />
          </div>
          <NutritionRing />
        </div>

        <div className="rounded-3xl bg-card border border-border p-6 ink-shadow">
          <h2 className="font-display text-xl mb-4">Macros</h2>
          <MacroBars />
          <div className="mt-5 pt-5 border-t border-border text-xs text-muted-foreground">
            Targets: 2400 kcal · 140g protein · 30g fiber. Tweak in Pre-Order soon.
          </div>
        </div>

        <div className="rounded-3xl bg-card border border-border p-6 ink-shadow">
          <h2 className="font-display text-xl mb-2">7-day trend</h2>
          <WeeklyChart />
        </div>
      </section>

      {/* Today's harvest */}
      <section className="mb-10">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl">Today's harvest</h2>
            <p className="text-sm text-muted-foreground">Tap to log items as you eat.</p>
          </div>
          <Link
            to="/menu"
            className="text-sm text-primary inline-flex items-center gap-1 hover:underline"
          >
            Full week <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="space-y-6">
          {MEAL_TYPES.map((m: MealType) => (
            <div key={m}>
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="font-display text-lg capitalize">{m}</h3>
                <span className="text-xs text-muted-foreground">{dayMenu[m].time}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {dayMenu[m].items.map((item) => (
                  <MealCard key={item.id} item={item} onLog={(i) => logMeal(m, [i])} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent log + quick links */}
      <section className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-3xl bg-card border border-border p-6 ink-shadow">
          <h2 className="font-display text-xl mb-4">Today's log</h2>
          {log.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">
              Nothing logged yet. Tap "Add to log" on any dish above.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {log
                .slice()
                .reverse()
                .map((entry) => (
                  <li key={entry.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">
                        {entry.mealType}
                      </div>
                      <div className="text-sm">
                        {entry.items.map((i) => i.name).join(", ")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-lg leading-none">
                        {entry.totalCalories}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        kcal
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-4">
          <QuickAction
            to="/pre-order"
            icon={ClipboardList}
            title="Pre-order tomorrow"
            desc="Plan your plate ahead of time."
          />
          <QuickAction
            to="/menu"
            icon={CalendarDays}
            title="Browse weekly menu"
            desc="See every meal, every day."
          />
        </div>
      </section>
    </div>
  );
}

function QuickAction({
  to,
  icon: Icon,
  title,
  desc,
}: {
  to: string;
  icon: typeof Camera;
  title: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className="block rounded-2xl bg-card border border-border p-5 ink-shadow hover:-translate-y-0.5 transition"
    >
      <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
        <Icon className="size-5" />
      </div>
      <div className="font-medium">{title}</div>
      <div className="text-xs text-muted-foreground mt-1">{desc}</div>
    </Link>
  );
}
