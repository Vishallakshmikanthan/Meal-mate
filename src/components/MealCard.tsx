import { Leaf, Drumstick, Plus, Check } from "lucide-react";
import type { MenuItem, MealType } from "@/lib/menuData";
import { generateTags } from "@/lib/menuData";
import { cn } from "@/lib/utils";

interface Props {
  item: MenuItem;
  meal?: MealType;
  onLog?: (item: MenuItem) => void;
  selected?: boolean;
  onToggle?: (item: MenuItem) => void;
}

export function MealCard({ item, onLog, selected, onToggle }: Props) {
  const tags = generateTags(item);
  const isVeg = item.type === "veg";

  return (
    <div
      className={cn(
        "group relative rounded-2xl border bg-card p-4 ink-shadow transition-all",
        "hover:-translate-y-0.5 hover:shadow-md",
        selected && "ring-2 ring-primary border-primary/40",
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "size-5 rounded-sm border-[1.5px] flex items-center justify-center",
              isVeg ? "border-veg" : "border-nonveg",
            )}
          >
            <span
              className={cn(
                "size-2.5 rounded-full",
                isVeg ? "bg-veg" : "bg-nonveg",
              )}
            />
          </div>
          <h3 className="font-display text-lg leading-tight">{item.name}</h3>
        </div>
        {isVeg ? (
          <Leaf className="size-4 text-veg/70 shrink-0" />
        ) : (
          <Drumstick className="size-4 text-nonveg/70 shrink-0" />
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {tags.slice(0, 3).map((t) => (
          <span
            key={t}
            className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground/80"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-1 text-center mb-3">
        <Macro label="kcal" value={item.calories} highlight />
        <Macro label="P" value={`${item.protein}g`} />
        <Macro label="C" value={`${item.carbs}g`} />
        <Macro label="F" value={`${item.fat}g`} />
      </div>

      {onLog && (
        <button
          onClick={() => onLog(item)}
          className="w-full text-xs font-medium py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition flex items-center justify-center gap-1"
        >
          <Plus className="size-3.5" /> Add to log
        </button>
      )}
      {onToggle && (
        <button
          onClick={() => onToggle(item)}
          className={cn(
            "w-full text-xs font-medium py-2 rounded-lg transition flex items-center justify-center gap-1",
            selected
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/70",
          )}
        >
          {selected ? (
            <>
              <Check className="size-3.5" /> Selected
            </>
          ) : (
            <>
              <Plus className="size-3.5" /> Pre-order
            </>
          )}
        </button>
      )}
    </div>
  );
}

function Macro({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg py-1.5",
        highlight ? "bg-accent/30 text-foreground" : "bg-muted/60 text-muted-foreground",
      )}
    >
      <div className="text-sm font-semibold leading-none text-foreground">{value}</div>
      <div className="text-[9px] uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}
