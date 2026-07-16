import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { MEAL_TYPES, getTodayKey, menuData } from "@/lib/menuData";

export default defineTool({
  name: "get_todays_menu",
  title: "Get today's mess menu",
  description: "Return today's mess menu (breakfast, lunch, snacks, dinner) with timings and nutrition per dish.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: false },
  handler: () => {
    const day = getTodayKey();
    const meals = MEAL_TYPES.map((meal) => ({
      meal,
      time: menuData[day][meal].time,
      items: menuData[day][meal].items,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify({ day, meals }, null, 2) }],
      structuredContent: { day, meals },
    };
  },
});
