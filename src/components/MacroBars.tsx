import { useNutritionData } from "@/hooks/useNutritionData";
import { cn } from "@/lib/utils";

const MACROS = [
  { key: "protein", label: "Protein", unit: "g", color: "bg-leaf" },
  { key: "carbs", label: "Carbs", unit: "g", color: "bg-warm" },
  { key: "fat", label: "Fat", unit: "g", color: "bg-accent" },
  { key: "fiber", label: "Fiber", unit: "g", color: "bg-primary" },
] as const;

export function MacroBars() {
  const { totals, goals } = useNutritionData();
  return (
    <div className="space-y-3">
      {MACROS.map(({ key, label, unit, color }) => {
        const v = totals[key];
        const g = goals[key];
        const pct = Math.min(100, Math.round((v / g) * 100));
        return (
          <div key={key}>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium">{label}</span>
              <span className="tabular-nums text-muted-foreground">
                {v}
                {unit} / {g}
                {unit}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500", color)}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
