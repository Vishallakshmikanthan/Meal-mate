import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DAYS, MEAL_TYPES, getTodayKey, type DayKey, type MealType } from "@/lib/menuData";
import {
  createDish,
  deleteDish,
  setDishStatus,
  updateDish,
  type DishInput,
  type ProviderDish,
} from "@/lib/providerMenu";
import { useProviderMenu } from "@/hooks/useProviderMenu";
import {
  Clock,
  Utensils,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  X,
  Leaf,
  Drumstick,
} from "lucide-react";

export const Route = createFileRoute("/provider/menu")({
  head: () => ({
    meta: [
      { title: "Menu Manager — MealOps Provider" },
      { name: "description", content: "Create, edit, publish, and manage weekly dishes." },
    ],
  }),
  component: MenuManager,
});

const MEAL_TIMES: Record<MealType, string> = {
  breakfast: "7:30 AM – 9:30 AM",
  lunch: "12:30 PM – 2:00 PM",
  snacks: "4:30 PM – 5:30 PM",
  dinner: "7:30 PM – 9:00 PM",
};

type EditorState =
  | { open: false }
  | { open: true; day: DayKey; meal: MealType; dish?: ProviderDish };

function MenuManager() {
  const [day, setDay] = useState<DayKey>(getTodayKey());
  const [editor, setEditor] = useState<EditorState>({ open: false });
  const all = useProviderMenu();

  const grouped = useMemo(() => {
    const g: Record<MealType, ProviderDish[]> = { breakfast: [], lunch: [], snacks: [], dinner: [] };
    for (const d of all) if (d.day === day) g[d.meal].push(d);
    for (const k of MEAL_TYPES) g[k].sort((a, b) => a.name.localeCompare(b.name));
    return g;
  }, [all, day]);

  const stats = useMemo(() => {
    const dayDishes = all.filter((d) => d.day === day);
    return {
      total: dayDishes.length,
      published: dayDishes.filter((d) => d.status === "published").length,
      drafts: dayDishes.filter((d) => d.status === "draft").length,
    };
  }, [all, day]);

  return (
    <div className="max-w-2xl mx-auto px-5 pt-6 pb-8 space-y-4">
      <header>
        <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground bg-card border border-border rounded-full px-2.5 py-1 mb-3">
          <Utensils className="size-3 text-[var(--leaf)]" /> Menu Manager
        </div>
        <h1 className="font-display text-3xl leading-tight">Weekly Menu</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Create, edit, and publish dishes for students.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-2">
        <StatChip label="Dishes" value={stats.total} />
        <StatChip label="Published" value={stats.published} tone="leaf" />
        <StatChip label="Drafts" value={stats.drafts} tone="warm" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {DAYS.map((d) => (
          <button
            key={d}
            onClick={() => setDay(d)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
              day === d
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {d.slice(0, 3)}
          </button>
        ))}
      </div>

      {MEAL_TYPES.map((m) => (
        <section key={m} className="rounded-2xl bg-card border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-display text-lg capitalize">{m}</h2>
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="size-3" /> {MEAL_TIMES[m]}
              </span>
            </div>
            <button
              onClick={() => setEditor({ open: true, day, meal: m })}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary-foreground bg-primary rounded-full px-3 py-1.5 hover:opacity-90"
            >
              <Plus className="size-3.5" /> Add
            </button>
          </div>

          {grouped[m].length === 0 ? (
            <div className="text-xs text-muted-foreground italic py-4 text-center">
              No dishes yet. Tap "Add" to create one.
            </div>
          ) : (
            <div className="space-y-2">
              {grouped[m].map((it) => (
                <DishRow
                  key={it.id}
                  dish={it}
                  onEdit={() => setEditor({ open: true, day, meal: m, dish: it })}
                  onDelete={() => {
                    if (confirm(`Delete "${it.name}"?`)) deleteDish(it.id);
                  }}
                  onToggleStatus={() =>
                    setDishStatus(it.id, it.status === "published" ? "draft" : "published")
                  }
                />
              ))}
            </div>
          )}
        </section>
      ))}

      {editor.open && (
        <DishEditor
          day={editor.day}
          meal={editor.meal}
          dish={editor.dish}
          onClose={() => setEditor({ open: false })}
        />
      )}
    </div>
  );
}

function StatChip({ label, value, tone }: { label: string; value: number; tone?: "leaf" | "warm" }) {
  const color =
    tone === "leaf"
      ? "text-[var(--mid)]"
      : tone === "warm"
      ? "text-[var(--warm)]"
      : "text-foreground";
  return (
    <div className="rounded-xl bg-card border border-border px-3 py-2">
      <div className={`font-display text-xl ${color}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function DishRow({
  dish,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  dish: ProviderDish;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}) {
  const isPublished = dish.status === "published";
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-border last:border-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold truncate">{dish.name}</span>
          <span
            className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
              dish.type === "veg"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {dish.type === "veg" ? <Leaf className="size-2.5" /> : <Drumstick className="size-2.5" />}
            {dish.type === "veg" ? "VEG" : "NON-VEG"}
          </span>
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
              isPublished
                ? "bg-[var(--leaf)]/20 text-[var(--mid)]"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {isPublished ? "PUBLISHED" : "DRAFT"}
          </span>
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5">
          {dish.calories} kcal · P {dish.protein}g · C {dish.carbs}g · F {dish.fat}g · Fib {dish.fiber}g
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <IconBtn onClick={onToggleStatus} title={isPublished ? "Unpublish" : "Publish"}>
          {isPublished ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
        </IconBtn>
        <IconBtn onClick={onEdit} title="Edit">
          <Pencil className="size-3.5" />
        </IconBtn>
        <IconBtn onClick={onDelete} title="Delete" danger>
          <Trash2 className="size-3.5" />
        </IconBtn>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  title,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-lg border border-border hover:bg-secondary transition ${
        danger ? "text-destructive hover:bg-destructive/10" : "text-muted-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function DishEditor({
  day,
  meal,
  dish,
  onClose,
}: {
  day: DayKey;
  meal: MealType;
  dish?: ProviderDish;
  onClose: () => void;
}) {
  const [form, setForm] = useState<DishInput>({
    name: dish?.name ?? "",
    type: dish?.type ?? "veg",
    calories: dish?.calories ?? 0,
    protein: dish?.protein ?? 0,
    carbs: dish?.carbs ?? 0,
    fat: dish?.fat ?? 0,
    fiber: dish?.fiber ?? 0,
    tags: dish?.tags ?? [],
    day,
    meal,
    status: dish?.status ?? "draft",
  });

  const setNum = (k: keyof DishInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: Number(e.target.value) || 0 }));

  const submit = (status: "draft" | "published") => {
    const name = form.name.trim();
    if (!name) return alert("Please enter a dish name.");
    const payload = { ...form, name, status };
    if (dish) updateDish(dish.id, payload);
    else createDish(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card/95 backdrop-blur px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-display text-xl">{dish ? "Edit dish" : "New dish"}</h3>
            <p className="text-[11px] text-muted-foreground capitalize">
              {day} · {meal}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-secondary text-muted-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <Field label="Dish name">
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Paneer Butter Masala"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>

          <Field label="Type">
            <div className="grid grid-cols-2 gap-2">
              {(["veg", "non-veg"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setForm((f) => ({ ...f, type: t }))}
                  className={`py-2 rounded-lg text-xs font-bold border transition inline-flex items-center justify-center gap-1.5 ${
                    form.type === t
                      ? t === "veg"
                        ? "bg-green-100 border-green-600 text-green-800"
                        : "bg-red-100 border-red-600 text-red-800"
                      : "bg-card border-border text-muted-foreground"
                  }`}
                >
                  {t === "veg" ? <Leaf className="size-3.5" /> : <Drumstick className="size-3.5" />}
                  {t === "veg" ? "Vegetarian" : "Non-Veg"}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Meal slot">
            <div className="grid grid-cols-4 gap-1.5">
              {MEAL_TYPES.map((m) => (
                <button
                  key={m}
                  onClick={() => setForm((f) => ({ ...f, meal: m }))}
                  className={`py-1.5 rounded-lg text-[11px] font-semibold capitalize border transition ${
                    form.meal === m
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border text-muted-foreground"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <NumField label="Calories (kcal)" value={form.calories} onChange={setNum("calories")} />
            <NumField label="Protein (g)" value={form.protein} onChange={setNum("protein")} />
            <NumField label="Carbs (g)" value={form.carbs} onChange={setNum("carbs")} />
            <NumField label="Fat (g)" value={form.fat} onChange={setNum("fat")} />
            <NumField label="Fiber (g)" value={form.fiber} onChange={setNum("fiber")} />
          </div>

          <Field label="Tags (comma-separated)">
            <input
              value={form.tags.join(", ")}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  tags: e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                }))
              }
              placeholder="High Protein, Spicy"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>
        </div>

        <div className="sticky bottom-0 bg-card/95 backdrop-blur px-5 py-3 border-t border-border flex gap-2">
          <button
            onClick={() => submit("draft")}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-border bg-card hover:bg-secondary"
          >
            Save draft
          </button>
          <button
            onClick={() => submit("published")}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90"
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        min={0}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </Field>
  );
}
