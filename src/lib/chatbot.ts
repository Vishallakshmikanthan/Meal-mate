import Fuse from "fuse.js";
import {
  DAYS,
  MEAL_TYPES,
  getAllMenuItems,
  getItemDays,
  getTodayKey,
  getTomorrowKey,
  menuData,
  type DayKey,
  type MealType,
} from "./menuData";

function formatMeal(day: DayKey, meal: MealType): string {
  const slot = menuData[day][meal];
  const title = meal.charAt(0).toUpperCase() + meal.slice(1);
  const items = slot.items.map((i) => `• ${i.name} (${i.calories} kcal)`).join("\n");
  return `**${title}** — ${slot.time}\n${items}`;
}

function getDayMenu(day: DayKey): string {
  return `Here's the **${day}** menu:\n\n` +
    MEAL_TYPES.map((m) => formatMeal(day, m)).join("\n\n");
}

function getMealForToday(meal: MealType): string {
  return formatMeal(getTodayKey(), meal);
}

function getNonVegDays(): string {
  return "🍗 Non-veg is available on:\n• **Wednesday Lunch** — Chicken Kabab, Chicken Masala, Chilli Chicken\n• **Sunday Lunch** — Chicken Biryani with Salna\n\nAll other days are fully vegetarian. 🥗";
}

function getHighProteinMeals(): string {
  const top = getAllMenuItems()
    .filter((i) => i.protein >= 8)
    .sort((a, b) => b.protein - a.protein)
    .slice(0, 6);
  return (
    "💪 Top high-protein items this week:\n" +
    top.map((i) => `• ${i.name} — ${i.protein}g protein (${i.day} ${i.meal})`).join("\n")
  );
}

function getLowCalMeals(): string {
  const top = getAllMenuItems()
    .filter((i) => i.calories <= 100)
    .sort((a, b) => a.calories - b.calories)
    .slice(0, 6);
  return (
    "🍃 Light & low-cal options:\n" +
    top.map((i) => `• ${i.name} — ${i.calories} kcal (${i.day} ${i.meal})`).join("\n")
  );
}

function getHighFiberMeals(): string {
  const top = getAllMenuItems()
    .filter((i) => i.fiber >= 4)
    .sort((a, b) => b.fiber - a.fiber)
    .slice(0, 6);
  return (
    "🌾 High-fiber picks:\n" +
    top.map((i) => `• ${i.name} — ${i.fiber}g fiber (${i.day} ${i.meal})`).join("\n")
  );
}

function getHealthyRecommendations(): string {
  const today = menuData[getTodayKey()];
  const lowCal = today.lunch.items
    .filter((i) => i.calories < 150)
    .map((i) => i.name)
    .join(", ");
  return (
    `For weight loss at the mess:\n` +
    `✅ Today's lighter lunch picks: ${lowCal || "Rasam, Curd, Salad"}\n` +
    `✅ Avoid: Pakoda, Chips, Bonda, Samosa\n` +
    `✅ Best dinner: Chapathi + Dhal + Curd\n` +
    `✅ Best breakfast: Idly (only ~120 kcal)`
  );
}

const intents: { pattern: RegExp; handler: () => string }[] = [
  { pattern: /tomorrow/i, handler: () => getDayMenu(getTomorrowKey()) },
  { pattern: /today|today's|what'?s? (for|on) today/i, handler: () => getDayMenu(getTodayKey()) },
  { pattern: /breakfast/i, handler: () => getMealForToday("breakfast") },
  { pattern: /lunch/i, handler: () => getMealForToday("lunch") },
  { pattern: /dinner/i, handler: () => getMealForToday("dinner") },
  { pattern: /snack/i, handler: () => getMealForToday("snacks") },
  { pattern: /chicken|non.?veg/i, handler: getNonVegDays },
  {
    pattern: /vegetarian|\bveg\b/i,
    handler: () => "All days except Wednesday and Sunday lunch are fully vegetarian. 🥗",
  },
  { pattern: /protein/i, handler: getHighProteinMeals },
  { pattern: /calorie|low.?cal|light/i, handler: getLowCalMeals },
  { pattern: /fiber/i, handler: getHighFiberMeals },
  {
    pattern: /sunday|special/i,
    handler: () =>
      "Sunday is special! 🎉 Lunch has Chicken Biryani / Veg Biryani with Ice Cream and Gulab Jamun. Breakfast is Set Dosa with Veg Kurma.",
  },
  {
    pattern: /time|timing|when/i,
    handler: () =>
      "🕐 Mess Timings:\n• Breakfast: 7:30–9:30 AM\n• Lunch: 12:30–2:00 PM\n• Snacks: 4:30–5:30 PM\n• Dinner: 7:30–9:00 PM",
  },
  { pattern: /weight loss|diet|healthy|lose weight/i, handler: getHealthyRecommendations },
];

for (const day of DAYS) {
  intents.unshift({
    pattern: new RegExp(`\\b${day}\\b`, "i"),
    handler: () => getDayMenu(day),
  });
}

export function getBotResponse(message: string): string {
  const text = message.trim();
  if (!text) return "Ask me anything about the mess menu!";

  for (const intent of intents) {
    if (intent.pattern.test(text)) return intent.handler();
  }

  const all = getAllMenuItems();
  const fuse = new Fuse(all, { keys: ["name"], threshold: 0.4, includeScore: true });
  const results = fuse.search(text);
  if (results.length > 0) {
    const item = results[0].item;
    return `**${item.name}**\n🔥 ${item.calories} kcal | 💪 ${item.protein}g protein | 🍚 ${item.carbs}g carbs | 🧈 ${item.fat}g fat | 🌾 ${item.fiber}g fiber\n\n📅 Available: ${getItemDays(item.name)}`;
  }

  return "Hmm, I'm not sure! Try asking:\n• What's for lunch today?\n• Which days have chicken?\n• High protein options?\n• Mess timings?";
}

export const SUGGESTED_QUESTIONS = [
  "What's for lunch today?",
  "Which days have chicken?",
  "High protein options?",
  "Mess timings?",
  "What's special on Sunday?",
];
