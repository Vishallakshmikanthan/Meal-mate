import { RadialBar, RadialBarChart, ResponsiveContainer, PolarAngleAxis } from "recharts";
import { useNutritionData } from "@/hooks/useNutritionData";

export function NutritionRing() {
  const { totals, goals } = useNutritionData();
  const pct = Math.min(100, Math.round((totals.calories / goals.calories) * 100));
  const data = [{ name: "calories", value: pct, fill: "url(#ringGrad)" }];

  return (
    <div className="relative w-full aspect-square max-w-[240px] mx-auto">
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--leaf)" />
            <stop offset="100%" stopColor="var(--primary)" />
          </linearGradient>
        </defs>
      </svg>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="78%"
          outerRadius="100%"
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar background={{ fill: "var(--muted)" }} dataKey="value" cornerRadius={20} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Today</div>
        <div className="font-display text-5xl tabular-nums mt-1 text-foreground">{totals.calories}</div>
        <div className="text-xs text-muted-foreground mt-0.5">of {goals.calories} kcal</div>
        <div className="text-[10px] mt-2.5 px-2.5 py-1 rounded-full bg-[var(--leaf)]/20 text-primary font-bold border border-[var(--leaf)]/30">
          {pct}% of goal
        </div>
      </div>
    </div>
  );
}
