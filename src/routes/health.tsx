import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Droplets, Flame, Minus, Plus, Sparkles, Trophy, HeartPulse, Check } from "lucide-react";
import {
  completeMission,
  getHealthReport,
  getHealthState,
  setWaterGlasses,
} from "@/lib/health.functions";
import {
  BADGES,
  DAILY_MISSIONS,
  WEEKLY_CHALLENGES,
  healthScore,
  levelProgress,
} from "@/lib/gamification";
import { useNutritionData } from "@/hooks/useNutritionData";

export const Route = createFileRoute("/health")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Health & Rewards — Meal Mate" },
      {
        name: "description",
        content:
          "Track water intake, your daily health score, XP, streaks, badges and daily missions in Meal Mate.",
      },
      { property: "og:title", content: "Health & Rewards — Meal Mate" },
      {
        property: "og:description",
        content: "Hydration, health score, weekly nutrition report, XP levels, streaks and badges.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HealthPage,
});

function HealthPage() {
  const qc = useQueryClient();
  const { totals, goals } = useNutritionData();

  const fetchState = useServerFn(getHealthState);
  const fetchReport = useServerFn(getHealthReport);
  const saveWater = useServerFn(setWaterGlasses);
  const finishMission = useServerFn(completeMission);

  const state = useQuery({ queryKey: ["health-state"], queryFn: () => fetchState({}) });
  const report = useQuery({
    queryKey: ["health-report"],
    queryFn: () => fetchReport({ data: { days: 7 } }),
  });

  const waterMut = useMutation({
    mutationFn: (glasses: number) => saveWater({ data: { glasses } }),
    onSuccess: (d) => {
      qc.setQueryData(["health-state"], d);
      qc.invalidateQueries({ queryKey: ["health-report"] });
    },
    onError: () => toast.error("Couldn't save your water intake"),
  });

  const missionMut = useMutation({
    mutationFn: (m: { key: string; xp: number }) => finishMission({ data: m }),
    onSuccess: (d, m) => {
      qc.setQueryData(["health-state"], d);
      toast.success(`Mission complete · +${m.xp} XP`);
    },
    onError: () => toast.error("Couldn't complete that mission"),
  });

  const s = state.data;
  const glasses = s?.glasses ?? 0;
  const xp = s?.xp ?? 0;
  const prog = levelProgress(xp);
  const score = healthScore(totals, goals, glasses);
  const earned = new Set(s?.badges ?? []);
  const done = new Set(s?.missions ?? []);

  const week = report.data ?? [];
  const avgCals = week.length
    ? Math.round(week.reduce((a, d) => a + d.calories, 0) / week.length)
    : 0;
  const avgWater = week.length
    ? Math.round((week.reduce((a, d) => a + d.glasses, 0) / week.length) * 10) / 10
    : 0;

  return (
    <div className="max-w-2xl mx-auto px-5 pt-6 pb-4 space-y-5">
      <header>
        <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground bg-card border border-border rounded-full px-2.5 py-1 mb-3">
          <HeartPulse className="size-3 text-[var(--leaf)]" /> Health & Rewards
        </div>
        <h1 className="font-display text-3xl leading-tight">Your wellbeing</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Hydration, health score, streaks and missions — synced to your account.
        </p>
      </header>

      {/* Score + level */}
      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-card border border-border p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Health score</div>
          <div className="mt-1 flex items-end gap-1">
            <span className="font-display text-4xl tabular-nums">{score}</span>
            <span className="text-xs text-muted-foreground mb-1.5">/100</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full leaf-gradient"
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ type: "spring", stiffness: 90, damping: 18 }}
            />
          </div>
        </div>
        <div className="rounded-2xl bg-card border border-border p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Level</div>
          <div className="mt-1 flex items-end gap-2">
            <span className="font-display text-4xl tabular-nums">{prog.level}</span>
            <span className="text-xs text-muted-foreground mb-1.5">{xp} XP</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${prog.pct}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5">{prog.toNext} XP to level {prog.level + 1}</p>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3">
        {[
          { label: "Streak", value: `${s?.currentStreak ?? 0}d`, icon: Flame },
          { label: "Best streak", value: `${s?.longestStreak ?? 0}d`, icon: Trophy },
          { label: "Badges", value: `${earned.size}/${BADGES.length}`, icon: Sparkles },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl bg-card border border-border p-3 text-center">
            <Icon className="size-4 mx-auto text-[var(--leaf)]" />
            <div className="font-display text-xl mt-1 tabular-nums">{value}</div>
            <div className="text-[10px] text-muted-foreground">{label}</div>
          </div>
        ))}
      </section>

      {/* Water */}
      <section className="rounded-2xl bg-card border border-border p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg inline-flex items-center gap-2">
            <Droplets className="size-4 text-sky-500" /> Water intake
          </h2>
          <span className="text-sm tabular-nums text-muted-foreground">{glasses} / 8 glasses</span>
        </div>
        <div className="mt-3 grid grid-cols-8 gap-1.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <button
              key={i}
              aria-label={`Set water to ${i + 1} glasses`}
              onClick={() => waterMut.mutate(i + 1 === glasses ? i : i + 1)}
              className={`h-10 rounded-xl border transition min-tap ${
                i < glasses ? "bg-sky-500/15 border-sky-500/50" : "border-border hover:bg-muted/40"
              }`}
            >
              <Droplets
                className={`size-4 mx-auto ${i < glasses ? "text-sky-500" : "text-muted-foreground"}`}
              />
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => waterMut.mutate(Math.max(0, glasses - 1))}
            disabled={glasses === 0 || waterMut.isPending}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold inline-flex items-center justify-center gap-1.5 disabled:opacity-50 min-tap"
          >
            <Minus className="size-4" /> Remove
          </button>
          <button
            onClick={() => waterMut.mutate(Math.min(20, glasses + 1))}
            disabled={waterMut.isPending}
            className="flex-1 py-2.5 rounded-xl leaf-gradient text-primary-foreground text-sm font-semibold inline-flex items-center justify-center gap-1.5 disabled:opacity-50 min-tap"
          >
            <Plus className="size-4" /> Add glass
          </button>
        </div>
      </section>

      {/* Daily missions */}
      <section className="rounded-2xl bg-card border border-border p-4">
        <h2 className="font-display text-lg mb-2">Daily missions</h2>
        <div className="space-y-2">
          {DAILY_MISSIONS.map((m) => {
            const complete = done.has(m.key);
            return (
              <button
                key={m.key}
                disabled={complete || missionMut.isPending}
                onClick={() => missionMut.mutate({ key: m.key, xp: m.xp })}
                className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition min-tap ${
                  complete ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
                }`}
              >
                <div className="size-8 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                  {complete ? (
                    <Check className="size-4 text-primary" />
                  ) : (
                    <Sparkles className="size-4 text-[var(--leaf)]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate">{m.label}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{m.description}</div>
                </div>
                <span className="text-[11px] font-semibold text-primary shrink-0">+{m.xp} XP</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Weekly report */}
      <section className="rounded-2xl bg-card border border-border p-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-lg">Weekly summary</h2>
          <span className="text-[11px] text-muted-foreground">
            {avgCals} kcal · {avgWater} glasses / day
          </span>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={week} margin={{ top: 10, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--leaf)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--leaf)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(d: string) =>
                  new Date(d).toLocaleDateString(undefined, { weekday: "short" })
                }
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="calories"
                stroke="var(--leaf)"
                strokeWidth={2}
                fill="url(#calGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Challenges */}
      <section className="rounded-2xl bg-card border border-border p-4">
        <h2 className="font-display text-lg mb-2">Campus challenges</h2>
        <div className="space-y-2">
          {WEEKLY_CHALLENGES.map((c) => {
            const complete = done.has(c.key);
            return (
              <button
                key={c.key}
                disabled={complete || missionMut.isPending}
                onClick={() => missionMut.mutate({ key: c.key, xp: c.xp })}
                className={`w-full flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition min-tap ${
                  complete ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
                }`}
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{c.label}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{c.description}</div>
                </div>
                <span className="text-[11px] font-semibold text-primary shrink-0">
                  {complete ? "Claimed" : `+${c.xp} XP`}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Badges */}
      <section className="rounded-2xl bg-card border border-border p-4">
        <h2 className="font-display text-lg mb-3">Achievements</h2>
        <div className="grid grid-cols-3 gap-2">
          {BADGES.map((b) => {
            const has = earned.has(b.key);
            return (
              <div
                key={b.key}
                className={`rounded-xl border p-3 text-center transition ${
                  has ? "border-primary bg-primary/5" : "border-border opacity-55"
                }`}
              >
                <div className="text-2xl">{b.emoji}</div>
                <div className="text-[11px] font-semibold mt-1 leading-tight">{b.label}</div>
                <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                  {b.description}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
