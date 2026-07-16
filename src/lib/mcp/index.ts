import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listMenuWeekTool from "./tools/list-menu-week";
import getTodaysMenuTool from "./tools/get-todays-menu";
import logMealTool from "./tools/log-meal";
import listMyMealLogsTool from "./tools/list-my-meal-logs";
import getTodaysNutritionTool from "./tools/get-todays-nutrition";

// Direct Supabase issuer (never the .lovable.cloud proxy). VITE_SUPABASE_PROJECT_ID
// is inlined by Vite at build time; the fallback keeps issuer well-formed during
// manifest extraction.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "mealops-mcp",
  title: "MealOps",
  version: "0.1.0",
  instructions:
    "Tools for MealOps, a college mess dining tracker. Read this week's mess menu, log meals for the signed-in user, and review their nutrition. Menu tools are read-only. Meal-log tools act as the authenticated user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listMenuWeekTool,
    getTodaysMenuTool,
    logMealTool,
    listMyMealLogsTool,
    getTodaysNutritionTool,
  ],
});
