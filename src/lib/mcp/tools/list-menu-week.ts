import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { DAYS, MEAL_TYPES, menuData } from "@/lib/menuData";

export default defineTool({
  name: "list_menu_week",
  title: "List weekly mess menu",
  description:
    "Return the full 7-day Sri Sairam College mess menu grouped by day and meal (breakfast, lunch, snacks, dinner) with nutrition per dish.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const week = DAYS.map((day) => ({
      day,
      meals: MEAL_TYPES.map((meal) => ({
        meal,
        time: menuData[day][meal].time,
        items: menuData[day][meal].items,
      })),
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(week, null, 2) }],
      structuredContent: { week },
    };
  },
});
