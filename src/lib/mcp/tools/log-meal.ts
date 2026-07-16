import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "log_meal",
  title: "Log a meal",
  description:
    "Log a food item the signed-in user ate today (or on a given date) with its nutrition. Use for tracking what the user consumed.",
  inputSchema: {
    meal_type: z.enum(["breakfast", "lunch", "snacks", "dinner"]),
    item_name: z.string().min(1).describe("Name of the dish, e.g. 'Chicken Biryani'."),
    calories: z.number().int().nonnegative().describe("kcal"),
    protein: z.number().nonnegative().default(0).describe("grams"),
    carbs: z.number().nonnegative().default(0).describe("grams"),
    fat: z.number().nonnegative().default(0).describe("grams"),
    fiber: z.number().nonnegative().default(0).describe("grams"),
    log_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .describe("YYYY-MM-DD; defaults to today"),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("meal_logs")
      .insert({
        user_id: ctx.getUserId(),
        meal_type: input.meal_type,
        item_name: input.item_name,
        calories: input.calories,
        protein: input.protein,
        carbs: input.carbs,
        fat: input.fat,
        fiber: input.fiber,
        source: "mcp",
        ...(input.log_date ? { log_date: input.log_date } : {}),
      })
      .select()
      .single();
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: `Logged ${input.item_name} to ${input.meal_type}.` }],
      structuredContent: { row: data },
    };
  },
});
