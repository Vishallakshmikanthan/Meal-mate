import { DAYS, MEAL_TYPES, menuData, type DayKey, type MealType, type MenuItem } from "./menuData";

export type DishStatus = "draft" | "published";

export interface ProviderDish extends MenuItem {
  day: DayKey;
  meal: MealType;
  status: DishStatus;
  updatedAt: number;
}

const KEY = "mealops:provider-menu:v1";
const EVT = "mealops:provider-menu";

function emit() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVT));
}

function load(): ProviderDish[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ProviderDish[];
  } catch {
    return null;
  }
}

function save(dishes: ProviderDish[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(dishes));
  emit();
}

function seedFromStatic(): ProviderDish[] {
  const now = Date.now();
  const out: ProviderDish[] = [];
  for (const day of DAYS) {
    for (const meal of MEAL_TYPES) {
      for (const it of menuData[day][meal].items) {
        out.push({ ...it, day, meal, status: "published", updatedAt: now });
      }
    }
  }
  return out;
}

export function getProviderMenu(): ProviderDish[] {
  const cached = load();
  if (cached) return cached;
  const seeded = seedFromStatic();
  save(seeded);
  return seeded;
}

export function getDishesFor(day: DayKey, meal: MealType): ProviderDish[] {
  return getProviderMenu().filter((d) => d.day === day && d.meal === meal);
}

export type DishInput = Omit<ProviderDish, "id" | "updatedAt">;

export function createDish(input: DishInput): ProviderDish {
  const all = getProviderMenu();
  const id = (all.reduce((m, d) => Math.max(m, d.id), 0) || 1000) + 1;
  const dish: ProviderDish = { ...input, id, updatedAt: Date.now() };
  save([...all, dish]);
  return dish;
}

export function updateDish(id: number, patch: Partial<DishInput>): void {
  const all = getProviderMenu();
  save(all.map((d) => (d.id === id ? { ...d, ...patch, updatedAt: Date.now() } : d)));
}

export function deleteDish(id: number): void {
  save(getProviderMenu().filter((d) => d.id !== id));
}

export function setDishStatus(id: number, status: DishStatus): void {
  updateDish(id, { status });
}
