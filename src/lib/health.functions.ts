import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface HealthState {
  glasses: number;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  badges: string[];
  missions: string[];
}

function levelFor(xp: number) {
  return Math.floor(xp / 100) + 1;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

async function loadState(supabase: any, userId: string): Promise<HealthState> {
  const today = todayISO();
  const [water, stats, badges, missions] = await Promise.all([
    supabase.from("water_logs").select("glasses").eq("user_id", userId).eq("log_date", today).maybeSingle(),
    supabase.from("user_stats").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("user_badges").select("badge_key").eq("user_id", userId),
    supabase.from("mission_completions").select("mission_key").eq("user_id", userId).eq("log_date", today),
  ]);
  const xp = stats.data?.xp ?? 0;
  return {
    glasses: water.data?.glasses ?? 0,
    xp,
    level: stats.data?.level ?? levelFor(xp),
    currentStreak: stats.data?.current_streak ?? 0,
    longestStreak: stats.data?.longest_streak ?? 0,
    badges: (badges.data ?? []).map((b: any) => b.badge_key),
    missions: (missions.data ?? []).map((m: any) => m.mission_key),
  };
}

async function touchStreakAndXp(supabase: any, userId: string, addXp: number) {
  const today = todayISO();
  const { data: existing } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  let current = existing?.current_streak ?? 0;
  const last = existing?.last_active_date as string | null | undefined;
  if (last !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    current = last === yesterday ? current + 1 : 1;
  }
  const xp = (existing?.xp ?? 0) + addXp;
  const longest = Math.max(existing?.longest_streak ?? 0, current);

  await supabase.from("user_stats").upsert(
    {
      user_id: userId,
      xp,
      level: levelFor(xp),
      current_streak: current,
      longest_streak: longest,
      last_active_date: today,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  return { xp, level: levelFor(xp), current, longest };
}

async function syncBadges(
  supabase: any,
  userId: string,
  ctx: { xp: number; level: number; streak: number; glasses: number },
) {
  const earned: string[] = [];
  if (ctx.xp > 0) earned.push("first-steps");
  if (ctx.glasses >= 8) earned.push("hydrated");
  if (ctx.streak >= 3) earned.push("streak-3");
  if (ctx.streak >= 7) earned.push("streak-7");
  if (ctx.level >= 5) earned.push("level-5");
  if (ctx.xp >= 1000) earned.push("xp-1000");
  if (earned.length === 0) return;
  await supabase
    .from("user_badges")
    .upsert(
      earned.map((badge_key) => ({ user_id: userId, badge_key })),
      { onConflict: "user_id,badge_key", ignoreDuplicates: true },
    );
}

export const getHealthState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => loadState(context.supabase, context.userId));

export const setWaterGlasses = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ glasses: z.number().int().min(0).max(20) }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const today = todayISO();
    const { data: prev } = await supabase
      .from("water_logs")
      .select("glasses")
      .eq("user_id", userId)
      .eq("log_date", today)
      .maybeSingle();
    await supabase
      .from("water_logs")
      .upsert(
        { user_id: userId, log_date: today, glasses: data.glasses, updated_at: new Date().toISOString() },
        { onConflict: "user_id,log_date" },
      );
    const gained = Math.max(0, data.glasses - (prev?.glasses ?? 0)) * 5;
    const s = await touchStreakAndXp(supabase, userId, gained);
    await syncBadges(supabase, userId, {
      xp: s.xp,
      level: s.level,
      streak: s.current,
      glasses: data.glasses,
    });
    return loadState(supabase, userId);
  });

export const completeMission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({ key: z.string().min(1).max(60), xp: z.number().int().min(0).max(200) }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const today = todayISO();
    const { error } = await supabase
      .from("mission_completions")
      .insert({ user_id: userId, mission_key: data.key, log_date: today });
    // duplicate = already completed today, award nothing extra
    const gained = error ? 0 : data.xp;
    const s = await touchStreakAndXp(supabase, userId, gained);
    const { data: water } = await supabase
      .from("water_logs")
      .select("glasses")
      .eq("user_id", userId)
      .eq("log_date", today)
      .maybeSingle();
    await syncBadges(supabase, userId, {
      xp: s.xp,
      level: s.level,
      streak: s.current,
      glasses: water?.glasses ?? 0,
    });
    return loadState(supabase, userId);
  });

export interface HealthReportDay {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  glasses: number;
}

export const getHealthReport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ days: z.number().int().min(7).max(31).default(7) }).parse(i ?? {}))
  .handler(async ({ data, context }): Promise<HealthReportDay[]> => {
    const { supabase, userId } = context;
    const start = new Date(Date.now() - (data.days - 1) * 86400000).toISOString().slice(0, 10);
    const [meals, water] = await Promise.all([
      supabase
        .from("meal_logs")
        .select("log_date, calories, protein, carbs, fat, fiber")
        .eq("user_id", userId)
        .gte("log_date", start),
      supabase.from("water_logs").select("log_date, glasses").eq("user_id", userId).gte("log_date", start),
    ]);

    const map = new Map<string, HealthReportDay>();
    for (let i = data.days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      map.set(d, { date: d, calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, glasses: 0 });
    }
    for (const row of meals.data ?? []) {
      const day = map.get(row.log_date as string);
      if (!day) continue;
      day.calories += Number(row.calories) || 0;
      day.protein += Number(row.protein) || 0;
      day.carbs += Number(row.carbs) || 0;
      day.fat += Number(row.fat) || 0;
      day.fiber += Number(row.fiber) || 0;
    }
    for (const row of water.data ?? []) {
      const day = map.get(row.log_date as string);
      if (day) day.glasses = Number(row.glasses) || 0;
    }
    return [...map.values()];
  });
