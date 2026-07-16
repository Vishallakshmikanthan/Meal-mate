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
  name: "list_my_meal_logs",
  title: "List my meal logs",
  description:
    "Return the signed-in user's logged meals for a date range (default: last 7 days), ordered newest first.",
  inputSchema: {
    from_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe("YYYY-MM-DD, inclusive"),
    to_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe("YYYY-MM-DD, inclusive"),
    limit: z.number().int().positive().max(200).default(100),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const today = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
    const from = input.from_date ?? weekAgo;
    const to = input.to_date ?? today;

    const { data, error } = await supabaseForUser(ctx)
      .from("meal_logs")
      .select("id, log_date, meal_type, item_name, calories, protein, carbs, fat, fiber, source, created_at")
      .gte("log_date", from)
      .lte("log_date", to)
      .order("created_at", { ascending: false })
      .limit(input.limit);

    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { rows: data ?? [], from, to },
    };
  },
});
