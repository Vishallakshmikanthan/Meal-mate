import { useEffect, useState } from "react";
import { getMealLog, getTodayNutrition, getUserGoals, getWeekTrend } from "@/lib/storage";

/**
 * Subscribes to localStorage / mealops:update events so any component
 * showing nutrition data refreshes after logging.
 */
export function useNutritionData() {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const handler = () => setVersion((v) => v + 1);
    window.addEventListener("mealops:update", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("mealops:update", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const [data, setData] = useState({
    totals: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
    goals: { calories: 2400, protein: 140, carbs: 250, fat: 65, fiber: 30 },
    log: [] as ReturnType<typeof getMealLog>,
    week: [] as ReturnType<typeof getWeekTrend>,
  });

  useEffect(() => {
    setData({
      totals: getTodayNutrition(),
      goals: getUserGoals(),
      log: getMealLog(),
      week: getWeekTrend(),
    });
  }, [version]);

  return data;
}
