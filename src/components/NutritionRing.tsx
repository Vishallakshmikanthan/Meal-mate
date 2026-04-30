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
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius="72%"
            outerRadius="92%"
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
          >
            <Cell fill="var(--primary)" />
            <Cell fill="var(--muted)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Today
        </div>
        <div className="font-display text-5xl font-medium tabular-nums mt-1">
          {totals.calories}
        </div>
        <div className="text-xs text-muted-foreground">of {goals.calories} kcal</div>
        <div className="text-[10px] mt-2 px-2 py-0.5 rounded-full bg-secondary">
          {pct}% of goal
        </div>
      </div>
    </div>
  );
}
