import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Camera, ClipboardList, CalendarDays, Salad, Sparkles, Flame, TrendingUp } from "lucide-react";
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
  const { log, totals, goals, week } = useNutritionData();
  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 17
        ? "Good afternoon"
        : "Good evening";

  const weekAvg =
    week.length > 0
      ? Math.round(week.reduce((s, d) => s + d.calories, 0) / week.length)
      : 0;
  const streak = week.filter((d) => d.calories > 0).length;

  return (
    <div className="relative px-5 sm:px-8 lg:px-12 py-8 lg:py-10 max-w-[1400px] mx-auto">
      {/* Hero */}
      <header className="relative overflow-hidden rounded-3xl border border-border bg-card ink-shadow mb-8 ring-gradient">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute -top-24 -right-24 size-72 rounded-full bg-[var(--leaf)]/15 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 size-72 rounded-full bg-[var(--accent)]/15 blur-3xl" />

        <div className="relative p-7 sm:p-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground bg-background/60 backdrop-blur border border-border rounded-full px-3 py-1.5">
              <span className="size-1.5 rounded-full bg-[var(--leaf)] animate-pulse" />
              {today} · {new Date().toLocaleDateString("en-US", { day: "numeric", month: "long" })}
            </div>
            <h1 className="font-display text-4xl sm:text-6xl mt-4 leading-[1.05] text-gradient">
              {greeting}, <span className="italic">hungry friend.</span>
            </h1>
            <p className="text-muted-foreground mt-3 max-w-xl text-[15px]">
              Here's what's cooking, what you've eaten, and how your week is shaping up.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <Link
                to="/scan"
                className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition glow-shadow"
              >
                <Camera className="size-4" /> Scan a plate
                <ArrowUpRight className="size-3.5 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-sm font-medium hover:bg-secondary transition"
              >
                <CalendarDays className="size-4" /> Browse menu
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 lg:gap-4 lg:min-w-[420px]">
            <StatChip icon={Flame} label="Today" value={totals.calories} unit="kcal" tone="leaf" />
            <StatChip icon={TrendingUp} label="Week avg" value={weekAvg} unit="kcal" tone="amber" />
            <StatChip icon={Sparkles} label="Streak" value={streak} unit="days" tone="ink" />
          </div>
        </div>
      </header>

      {/* Top grid: ring + macros + week */}
      <section className="grid lg:grid-cols-3 gap-5 mb-10">
        <Card>
          <CardHeader title="Today's plate" icon={Salad} eyebrow="Calories" />
          <NutritionRing />
        </Card>

        <Card>
          <CardHeader title="Macros" eyebrow={`${Math.round((totals.calories / goals.calories) * 100)}% of goal`} />
          <MacroBars />
          <div className="mt-5 pt-5 border-t border-border text-[11px] text-muted-foreground">
            Targets: {goals.calories} kcal · {goals.protein}g protein · {goals.fiber}g fiber.
          </div>
        </Card>

        <Card>
          <CardHeader title="7-day trend" eyebrow="Calories per day" icon={TrendingUp} />
          <WeeklyChart />
        </Card>
      </section>

      {/* Today's harvest */}
      <section className="mb-10">
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-1">
              Today's harvest
            </div>
            <h2 className="font-display text-3xl sm:text-4xl">Fresh off the counter.</h2>
            <p className="text-sm text-muted-foreground mt-1">Tap any dish to add it to your log.</p>
          </div>
          <Link
            to="/menu"
            className="text-sm font-medium text-primary inline-flex items-center gap-1 hover:gap-2 transition-all"
          >
            Full week <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="space-y-7">
          {MEAL_TYPES.map((m: MealType) => (
            <div key={m}>
              <div className="flex items-baseline justify-between mb-3">
                <h3 className="font-display text-xl capitalize flex items-center gap-2">
                  {m}
                  <span className="text-[10px] font-sans uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {dayMenu[m].items.length} items
                  </span>
                </h3>
                <span className="text-xs text-muted-foreground tabular-nums">{dayMenu[m].time}</span>
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
        <Card className="lg:col-span-2">
          <CardHeader title="Today's log" eyebrow={`${log.length} entries`} />
          {log.length === 0 ? (
            <div className="text-sm text-muted-foreground py-12 text-center border border-dashed border-border rounded-2xl">
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
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {entry.mealType}
                      </div>
                      <div className="text-sm">
                        {entry.items.map((i) => i.name).join(", ")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-xl leading-none tabular-nums">
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
        </Card>

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

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-3xl bg-card border border-border p-6 soft-shadow ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

function CardHeader({
  title,
  eyebrow,
  icon: Icon,
}: {
  title: string;
  eyebrow?: string;
  icon?: typeof Camera;
}) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        {eyebrow && (
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">
            {eyebrow}
          </div>
        )}
        <h2 className="font-display text-xl">{title}</h2>
      </div>
      {Icon && (
        <div className="size-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
          <Icon className="size-4" />
        </div>
      )}
    </div>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
  unit,
  tone,
}: {
  icon: typeof Camera;
  label: string;
  value: number;
  unit: string;
  tone: "leaf" | "amber" | "ink";
}) {
  const tones = {
    leaf: "from-[var(--leaf)]/15 to-[var(--leaf)]/0 text-[var(--leaf)] border-[var(--leaf)]/25",
    amber: "from-[var(--accent)]/20 to-[var(--accent)]/0 text-[var(--accent-foreground)] border-[var(--accent)]/30",
    ink: "from-foreground/10 to-foreground/0 text-foreground border-foreground/15",
  } as const;
  return (
    <div className={`relative rounded-2xl bg-gradient-to-br ${tones[tone]} border backdrop-blur p-3 sm:p-4 overflow-hidden`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className="size-4 opacity-80" />
      </div>
      <div className="font-display text-2xl sm:text-3xl tabular-nums text-foreground leading-none">
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
        {label} · {unit}
      </div>
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
      className="group block rounded-2xl bg-card border border-border p-5 soft-shadow hover-lift hover:border-[var(--leaf)]/40"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="size-10 rounded-xl bg-[var(--leaf)]/10 text-[var(--leaf)] flex items-center justify-center">
          <Icon className="size-5" />
        </div>
        <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
      </div>
      <div className="font-display text-lg">{title}</div>
      <div className="text-xs text-muted-foreground mt-1">{desc}</div>
    </Link>
  );
}
