import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, Flame, TrendingUp, Users, Utensils } from "lucide-react";
import {
  QR_EVENT,
  collectionsByDay,
  collectionsByMeal,
  getCollections,
  topDishes,
} from "@/lib/qrSession";

export const Route = createFileRoute("/provider/analytics")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Dining Analytics — Meal Mate Provider" },
      {
        name: "description",
        content: "Live meal collection analytics: attendance trends, meal split, popular dishes and waste signals.",
      },
      { property: "og:title", content: "Dining Analytics — Meal Mate Provider" },
      {
        property: "og:description",
        content: "Attendance trends, meal split and dish popularity for your dining operation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AnalyticsPage,
});

const PIE_COLORS = ["var(--leaf)", "var(--primary)", "#b45309", "#047857"];

function AnalyticsPage() {
  const [week, setWeek] = useState<ReturnType<typeof collectionsByDay>>([]);
  const [meals, setMeals] = useState<ReturnType<typeof collectionsByMeal>>([]);
  const [dishes, setDishes] = useState<ReturnType<typeof topDishes>>([]);
  const [total, setTotal] = useState(0);
  const [avgCal, setAvgCal] = useState(0);

  useEffect(() => {
    const upd = () => {
      const all = getCollections();
      setWeek(collectionsByDay());
      setMeals(collectionsByMeal());
      setDishes(topDishes());
      setTotal(all.length);
      setAvgCal(all.length ? Math.round(all.reduce((s, c) => s + c.calories, 0) / all.length) : 0);
    };
    upd();
    window.addEventListener(QR_EVENT, upd);
    window.addEventListener("storage", upd);
    return () => {
      window.removeEventListener(QR_EVENT, upd);
      window.removeEventListener("storage", upd);
    };
  }, []);

  const peakMeal = meals.slice().sort((a, b) => b.count - a.count)[0];
  const stats = [
    { label: "Meals Served", value: total, Icon: Utensils, tint: "text-[var(--leaf)]" },
    { label: "Avg Plate", value: `${avgCal} kcal`, Icon: Flame, tint: "text-amber-700" },
    { label: "Peak Service", value: peakMeal?.count ? peakMeal.label : "—", Icon: TrendingUp, tint: "text-primary" },
    { label: "Top Dish", value: dishes[0]?.name ?? "—", Icon: Users, tint: "text-emerald-700" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-5 pt-6 pb-4 space-y-5">
      <header>
        <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground bg-card border border-border rounded-full px-2.5 py-1 mb-3">
          <BarChart3 className="size-3 text-[var(--leaf)]" /> Analytics
        </div>
        <h1 className="font-display text-3xl leading-tight">Dining Insights</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Updates live as students collect meals.</p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value, Icon, tint }) => (
          <div key={label} className="rounded-2xl bg-card border border-border p-4">
            <Icon className={`size-4 mb-2 ${tint}`} />
            <div className="text-xl font-display font-semibold truncate">{value}</div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <section className="rounded-2xl bg-card border border-border p-4">
        <h2 className="font-display text-lg mb-3">Collections this week</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={week} margin={{ left: -24, right: 4, top: 4 }}>
              <defs>
                <linearGradient id="collGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--leaf)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--leaf)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} />
              <Tooltip cursor={{ opacity: 0.1 }} />
              <Area
                type="monotone"
                dataKey="meals"
                stroke="var(--leaf)"
                strokeWidth={2.5}
                fill="url(#collGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-2xl bg-card border border-border p-4">
        <h2 className="font-display text-lg mb-3">Meal split</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={meals} dataKey="count" nameKey="label" innerRadius={44} outerRadius={72} paddingAngle={3}>
                {meals.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-2">
          {meals.map((m, i) => (
            <span key={m.meal} className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span
                className="size-2.5 rounded-full"
                style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
              />
              {m.label} · {m.count}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-card border border-border p-4">
        <h2 className="font-display text-lg mb-3">Most popular dishes</h2>
        {dishes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No collections recorded yet.</p>
        ) : (
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dishes} layout="vertical" margin={{ left: 24, right: 8 }}>
                <XAxis type="number" hide allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={96} tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip cursor={{ opacity: 0.1 }} />
                <Bar dataKey="count" fill="var(--primary)" radius={[0, 8, 8, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
}
