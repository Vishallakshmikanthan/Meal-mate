import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useNutritionData } from "@/hooks/useNutritionData";

export function NutritionRing() {
  const { totals, goals } = useNutritionData();
  const consumed = Math.min(totals.calories, goals.calories);
  const remaining = Math.max(goals.calories - totals.calories, 0);
  const data = [
    { name: "Consumed", value: consumed },
    { name: "Remaining", value: remaining || (totals.calories > 0 ? 0 : 1) },
  ];
  const pct = Math.round((totals.calories / goals.calories) * 100);

  return (
    <div className="relative w-full aspect-square max-w-[260px] mx-auto">
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--leaf)" />
            <stop offset="100%" stopColor="var(--primary)" />
          </linearGradient>
        </defs>
      </svg>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius="74%"
            outerRadius="94%"
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
            cornerRadius={8}
          >
            <Cell fill="url(#ringGrad)" />
            <Cell fill="var(--muted)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Today
        </div>
        <div className="font-display text-5xl tabular-nums mt-1">
          {totals.calories}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">of {goals.calories} kcal</div>
        <div className="text-[10px] mt-2.5 px-2.5 py-1 rounded-full bg-[var(--leaf)]/10 text-[var(--leaf)] font-semibold border border-[var(--leaf)]/20">
          {pct}% of goal
        </div>
      </div>
    </div>
  );
}
