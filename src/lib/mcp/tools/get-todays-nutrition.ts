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
  name: "get_todays_nutrition",
  title: "Get today's nutrition totals",
  description: "Summed calories/protein/carbs/fat/fiber for the signed-in user's meal logs on a given date (default: today).",
  inputSchema: {
    log_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe("YYYY-MM-DD; defaults to today"),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const date = input.log_date ?? new Date().toISOString().slice(0, 10);
    const { data, error } = await supabaseForUser(ctx)
      .from("meal_logs")
      .select("meal_type, calories, protein, carbs, fat, fiber")
      .eq("log_date", date);
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    const totals = (data ?? []).reduce(
      (acc, r) => ({
        calories: acc.calories + Number(r.calories ?? 0),
        protein: acc.protein + Number(r.protein ?? 0),
        carbs: acc.carbs + Number(r.carbs ?? 0),
        fat: acc.fat + Number(r.fat ?? 0),
        fiber: acc.fiber + Number(r.fiber ?? 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
    );
    return {
      content: [{ type: "text", text: JSON.stringify({ date, totals, entries: data?.length ?? 0 }, null, 2) }],
      structuredContent: { date, totals, entries: data?.length ?? 0 },
    };
  },
});
