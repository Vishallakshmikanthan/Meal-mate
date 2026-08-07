export interface BadgeDef {
  key: string;
  label: string;
  description: string;
  emoji: string;
}

export const BADGES: BadgeDef[] = [
  { key: "first-steps", label: "First Steps", description: "Earn your first XP", emoji: "🌱" },
  { key: "hydrated", label: "Hydrated", description: "Drink 8 glasses in a day", emoji: "💧" },
  { key: "streak-3", label: "On a Roll", description: "3-day healthy streak", emoji: "🔥" },
  { key: "streak-7", label: "Week Warrior", description: "7-day healthy streak", emoji: "🏅" },
  { key: "level-5", label: "Level 5", description: "Reach level 5", emoji: "⭐" },
  { key: "xp-1000", label: "Nutrition Pro", description: "Earn 1000 XP", emoji: "👑" },
];

export interface MissionDef {
  key: string;
  label: string;
  description: string;
  xp: number;
}

export const DAILY_MISSIONS: MissionDef[] = [
  { key: "log-breakfast", label: "Log breakfast", description: "Start the day tracked", xp: 20 },
  { key: "hit-protein", label: "Hit your protein goal", description: "Fuel recovery", xp: 30 },
  { key: "eat-veggies", label: "Eat a veggie dish", description: "Fibre and micros", xp: 20 },
  { key: "eight-glasses", label: "Drink 8 glasses", description: "Stay hydrated", xp: 25 },
  { key: "no-late-snack", label: "Skip the late-night snack", description: "Better sleep", xp: 15 },
];

export const WEEKLY_CHALLENGES: MissionDef[] = [
  { key: "week-5-days", label: "Track 5 days this week", description: "Consistency beats intensity", xp: 100 },
  { key: "week-veg-3", label: "3 vegetarian days", description: "Lower your footprint", xp: 80 },
  { key: "week-hydration", label: "Hydration all week", description: "8 glasses, 7 days", xp: 120 },
];

export const XP_PER_LEVEL = 100;

export function levelProgress(xp: number) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const into = xp % XP_PER_LEVEL;
  return { level, into, pct: (into / XP_PER_LEVEL) * 100, toNext: XP_PER_LEVEL - into };
}

/** 0-100 daily health score from macros + hydration. */
export function healthScore(
  totals: { calories: number; protein: number; fiber: number },
  goals: { calories: number; protein: number; fiber: number },
  glasses: number,
) {
  const ratio = (v: number, g: number) => (g <= 0 ? 0 : Math.min(1, v / g));
  const cal = 1 - Math.min(1, Math.abs(totals.calories - goals.calories) / Math.max(goals.calories, 1));
  const score =
    cal * 35 + ratio(totals.protein, goals.protein) * 30 + ratio(totals.fiber, goals.fiber) * 20 + ratio(glasses, 8) * 15;
  return Math.round(Math.max(0, Math.min(100, score)));
}
