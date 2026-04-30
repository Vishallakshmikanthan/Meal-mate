import type { MenuItem, MealType } from "./menuData";

export interface MealLog {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  items: MenuItem[];
  totalCalories: number;
  timestamp: number;
}

export interface NutritionTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface UserGoals extends NutritionTotals {}

const isBrowser = () => typeof window !== "undefined";

export function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export function tomorrowISO() {
  return new Date(Date.now() + 86400000).toISOString().split("T")[0];
}

export function getMealLog(date?: string): MealLog[] {
  if (!isBrowser()) return [];
  const key = `meallog_${date || todayISO()}`;
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

export function logMeal(mealType: MealType, items: MenuItem[]) {
  if (!isBrowser()) return;
  const date = todayISO();
  const key = `meallog_${date}`;
  const existing = getMealLog(date);
  const entry: MealLog = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2),
    date,
    mealType,
    items,
    totalCalories: items.reduce((s, i) => s + i.calories, 0),
    timestamp: Date.now(),
  };
  existing.push(entry);
  localStorage.setItem(key, JSON.stringify(existing));
  window.dispatchEvent(new Event("mealops:update"));
}

export function deleteMealLog(date: string, id: string) {
  if (!isBrowser()) return;
  const key = `meallog_${date}`;
  const existing = getMealLog(date).filter((e) => e.id !== id);
  localStorage.setItem(key, JSON.stringify(existing));
  window.dispatchEvent(new Event("mealops:update"));
}

export function getTodayNutrition(): NutritionTotals {
  return getMealLog().reduce<NutritionTotals>(
    (totals, log) => {
      log.items.forEach((item) => {
        totals.calories += item.calories;
        totals.protein += item.protein;
        totals.carbs += item.carbs;
        totals.fat += item.fat;
        totals.fiber += item.fiber;
      });
      return totals;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  );
}

export function getWeekTrend(): { date: string; calories: number; label: string }[] {
  const out: { date: string; calories: number; label: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const date = d.toISOString().split("T")[0];
    const cals = getMealLog(date).reduce(
      (s, l) => s + l.items.reduce((a, i) => a + i.calories, 0),
      0,
    );
    out.push({
      date,
      calories: cals,
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
    });
  }
  return out;
}

export function savePreOrder(selections: Record<string, number[]>) {
  if (!isBrowser()) return;
  localStorage.setItem(`preorder_${tomorrowISO()}`, JSON.stringify(selections));
  window.dispatchEvent(new Event("mealops:update"));
}

export function getPreOrder(): Record<string, number[]> {
  if (!isBrowser()) return {};
  try {
    return JSON.parse(localStorage.getItem(`preorder_${tomorrowISO()}`) || "{}");
  } catch {
    return {};
  }
}

const DEFAULT_GOALS: UserGoals = {
  calories: 2400,
  protein: 140,
  carbs: 250,
  fat: 65,
  fiber: 30,
};

export function getUserGoals(): UserGoals {
  if (!isBrowser()) return DEFAULT_GOALS;
  try {
    return { ...DEFAULT_GOALS, ...JSON.parse(localStorage.getItem("user_goals") || "{}") };
  } catch {
    return DEFAULT_GOALS;
  }
}

export function setUserGoals(goals: Partial<UserGoals>) {
  if (!isBrowser()) return;
  const merged = { ...getUserGoals(), ...goals };
  localStorage.setItem("user_goals", JSON.stringify(merged));
  window.dispatchEvent(new Event("mealops:update"));
}
