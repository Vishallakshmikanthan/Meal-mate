export type MealType = "breakfast" | "lunch" | "snacks" | "dinner";

export interface MenuItem {
  id: number;
  name: string;
  type: "veg" | "non-veg";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  tags: string[];
}

export interface MealSlot {
  time: string;
  items: MenuItem[];
}

export type DayKey =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type DayMenu = Record<MealType, MealSlot>;

export const menuData: Record<DayKey, DayMenu> = {
  Monday: {
    breakfast: {
      time: "7:30 AM – 9:30 AM",
      items: [
        { id: 1, name: "Poori", type: "veg", calories: 180, protein: 4, carbs: 28, fat: 6, fiber: 2, tags: ["High Carb"] },
        { id: 2, name: "Dhal & Alu Masala", type: "veg", calories: 120, protein: 6, carbs: 18, fat: 3, fiber: 4, tags: ["High Fiber"] },
        { id: 3, name: "Badam Milk", type: "veg", calories: 150, protein: 6, carbs: 18, fat: 6, fiber: 0, tags: ["Healthy Fats"] },
      ],
    },
    lunch: {
      time: "12:30 PM – 2:00 PM",
      items: [
        { id: 4, name: "Rice", type: "veg", calories: 200, protein: 4, carbs: 44, fat: 0, fiber: 1, tags: ["High Carb"] },
        { id: 5, name: "Veg Sambar", type: "veg", calories: 80, protein: 4, carbs: 12, fat: 2, fiber: 3, tags: ["High Fiber"] },
        { id: 6, name: "Rasam", type: "veg", calories: 30, protein: 1, carbs: 5, fat: 0, fiber: 1, tags: [] },
        { id: 7, name: "Curd", type: "veg", calories: 60, protein: 3, carbs: 5, fat: 3, fiber: 0, tags: ["Probiotic"] },
        { id: 8, name: "Palaya/Kootu", type: "veg", calories: 90, protein: 3, carbs: 12, fat: 3, fiber: 4, tags: ["High Fiber"] },
      ],
    },
    snacks: {
      time: "4:30 PM – 5:30 PM",
      items: [
        { id: 9, name: "Methu Pakoda", type: "veg", calories: 150, protein: 5, carbs: 18, fat: 7, fiber: 2, tags: [] },
        { id: 10, name: "Mysore Bonda", type: "veg", calories: 140, protein: 4, carbs: 20, fat: 6, fiber: 2, tags: [] },
      ],
    },
    dinner: {
      time: "7:30 PM – 9:00 PM",
      items: [
        { id: 11, name: "Chapathi", type: "veg", calories: 120, protein: 4, carbs: 22, fat: 2, fiber: 3, tags: [] },
        { id: 12, name: "Rice", type: "veg", calories: 200, protein: 4, carbs: 44, fat: 0, fiber: 1, tags: [] },
        { id: 13, name: "Dhal", type: "veg", calories: 110, protein: 7, carbs: 18, fat: 2, fiber: 5, tags: ["High Protein", "High Fiber"] },
      ],
    },
  },
  Tuesday: {
    breakfast: {
      time: "7:30 AM – 9:30 AM",
      items: [
        { id: 14, name: "Noodles", type: "veg", calories: 220, protein: 6, carbs: 40, fat: 4, fiber: 2, tags: ["High Carb"] },
        { id: 15, name: "Pongal", type: "veg", calories: 180, protein: 5, carbs: 30, fat: 5, fiber: 2, tags: [] },
        { id: 16, name: "Vada", type: "veg", calories: 130, protein: 5, carbs: 16, fat: 6, fiber: 2, tags: [] },
      ],
    },
    lunch: {
      time: "12:30 PM – 2:00 PM",
      items: [
        { id: 17, name: "Veg Pulav", type: "veg", calories: 280, protein: 6, carbs: 52, fat: 5, fiber: 3, tags: ["High Carb"] },
        { id: 18, name: "Raw Banana Fry", type: "veg", calories: 110, protein: 2, carbs: 20, fat: 3, fiber: 3, tags: [] },
        { id: 19, name: "Raitha", type: "veg", calories: 55, protein: 3, carbs: 6, fat: 2, fiber: 0, tags: ["Probiotic"] },
        { id: 20, name: "Rasam", type: "veg", calories: 30, protein: 1, carbs: 5, fat: 0, fiber: 1, tags: [] },
      ],
    },
    snacks: {
      time: "4:30 PM – 5:30 PM",
      items: [
        { id: 21, name: "Veg Roll", type: "veg", calories: 200, protein: 6, carbs: 30, fat: 7, fiber: 2, tags: [] },
        { id: 22, name: "Samosa", type: "veg", calories: 180, protein: 4, carbs: 26, fat: 8, fiber: 2, tags: [] },
      ],
    },
    dinner: {
      time: "7:30 PM – 9:00 PM",
      items: [
        { id: 23, name: "Chapathi", type: "veg", calories: 120, protein: 4, carbs: 22, fat: 2, fiber: 3, tags: [] },
        { id: 24, name: "Rice", type: "veg", calories: 200, protein: 4, carbs: 44, fat: 0, fiber: 1, tags: [] },
        { id: 25, name: "Tomato Palaya", type: "veg", calories: 70, protein: 2, carbs: 10, fat: 2, fiber: 2, tags: [] },
      ],
    },
  },
  Wednesday: {
    breakfast: {
      time: "7:30 AM – 9:30 AM",
      items: [
        { id: 26, name: "Masala Dosa", type: "veg", calories: 250, protein: 6, carbs: 40, fat: 8, fiber: 3, tags: ["High Carb"] },
        { id: 27, name: "Gatti Chutney", type: "veg", calories: 60, protein: 2, carbs: 6, fat: 3, fiber: 2, tags: [] },
      ],
    },
    lunch: {
      time: "12:30 PM – 2:00 PM",
      items: [
        { id: 28, name: "Chicken Kabab", type: "non-veg", calories: 220, protein: 28, carbs: 5, fat: 10, fiber: 0, tags: ["High Protein", "Low Carb"] },
        { id: 29, name: "Chicken Masala", type: "non-veg", calories: 280, protein: 30, carbs: 8, fat: 14, fiber: 0, tags: ["High Protein"] },
        { id: 30, name: "Chilli Chicken", type: "non-veg", calories: 260, protein: 26, carbs: 10, fat: 13, fiber: 1, tags: ["High Protein"] },
        { id: 31, name: "Gobi Manchurian", type: "veg", calories: 190, protein: 6, carbs: 22, fat: 9, fiber: 3, tags: [] },
        { id: 32, name: "Paneer Manchurian", type: "veg", calories: 230, protein: 12, carbs: 18, fat: 13, fiber: 1, tags: ["High Protein"] },
        { id: 33, name: "Rice", type: "veg", calories: 200, protein: 4, carbs: 44, fat: 0, fiber: 1, tags: [] },
        { id: 34, name: "Rasam", type: "veg", calories: 30, protein: 1, carbs: 5, fat: 0, fiber: 1, tags: [] },
        { id: 35, name: "Curd", type: "veg", calories: 60, protein: 3, carbs: 5, fat: 3, fiber: 0, tags: ["Probiotic"] },
      ],
    },
    snacks: {
      time: "4:30 PM – 5:30 PM",
      items: [
        { id: 36, name: "Potato Chips", type: "veg", calories: 160, protein: 2, carbs: 20, fat: 9, fiber: 1, tags: [] },
      ],
    },
    dinner: {
      time: "7:30 PM – 9:00 PM",
      items: [
        { id: 37, name: "Chapathi", type: "veg", calories: 120, protein: 4, carbs: 22, fat: 2, fiber: 3, tags: [] },
        { id: 38, name: "Drumstick Curry", type: "veg", calories: 90, protein: 3, carbs: 12, fat: 3, fiber: 4, tags: ["High Fiber"] },
        { id: 39, name: "Curd Rice", type: "veg", calories: 180, protein: 5, carbs: 36, fat: 3, fiber: 1, tags: ["Probiotic"] },
      ],
    },
  },
  Thursday: {
    breakfast: {
      time: "7:30 AM – 9:30 AM",
      items: [
        { id: 40, name: "Idly", type: "veg", calories: 120, protein: 4, carbs: 22, fat: 1, fiber: 1, tags: ["Low Fat"] },
        { id: 41, name: "Vada", type: "veg", calories: 130, protein: 5, carbs: 16, fat: 6, fiber: 2, tags: [] },
        { id: 42, name: "Sambar", type: "veg", calories: 80, protein: 4, carbs: 12, fat: 2, fiber: 3, tags: ["High Fiber"] },
      ],
    },
    lunch: {
      time: "12:30 PM – 2:00 PM",
      items: [
        { id: 43, name: "Peas Pulav", type: "veg", calories: 290, protein: 9, carbs: 54, fat: 5, fiber: 5, tags: ["High Fiber"] },
        { id: 44, name: "Kurma", type: "veg", calories: 160, protein: 5, carbs: 18, fat: 8, fiber: 4, tags: [] },
        { id: 45, name: "Elephant Foot Yam Fry", type: "veg", calories: 100, protein: 2, carbs: 16, fat: 4, fiber: 3, tags: ["High Fiber"] },
        { id: 46, name: "Majjige Hulli", type: "veg", calories: 70, protein: 3, carbs: 8, fat: 3, fiber: 1, tags: ["Probiotic"] },
        { id: 47, name: "Curd", type: "veg", calories: 60, protein: 3, carbs: 5, fat: 3, fiber: 0, tags: [] },
      ],
    },
    snacks: {
      time: "4:30 PM – 5:30 PM",
      items: [
        { id: 48, name: "Pav Bhaji", type: "veg", calories: 320, protein: 8, carbs: 52, fat: 10, fiber: 5, tags: ["High Fiber"] },
      ],
    },
    dinner: {
      time: "7:30 PM – 9:00 PM",
      items: [
        { id: 49, name: "Methi Dhal", type: "veg", calories: 130, protein: 8, carbs: 20, fat: 2, fiber: 6, tags: ["High Protein", "High Fiber"] },
        { id: 50, name: "Banana", type: "veg", calories: 90, protein: 1, carbs: 22, fat: 0, fiber: 3, tags: [] },
        { id: 51, name: "Chapathi", type: "veg", calories: 120, protein: 4, carbs: 22, fat: 2, fiber: 3, tags: [] },
      ],
    },
  },
  Friday: {
    breakfast: {
      time: "7:30 AM – 9:30 AM",
      items: [
        { id: 52, name: "Poori", type: "veg", calories: 180, protein: 4, carbs: 28, fat: 6, fiber: 2, tags: ["High Carb"] },
        { id: 53, name: "Peas Masala", type: "veg", calories: 130, protein: 6, carbs: 20, fat: 4, fiber: 5, tags: ["High Fiber"] },
      ],
    },
    lunch: {
      time: "12:30 PM – 2:00 PM",
      items: [
        { id: 54, name: "Rice", type: "veg", calories: 200, protein: 4, carbs: 44, fat: 0, fiber: 1, tags: [] },
        { id: 55, name: "Kara Kulambu", type: "veg", calories: 110, protein: 3, carbs: 14, fat: 5, fiber: 3, tags: ["Spicy"] },
        { id: 56, name: "Vattha Kulambu", type: "veg", calories: 90, protein: 2, carbs: 12, fat: 4, fiber: 2, tags: ["Spicy"] },
        { id: 57, name: "Veg Sambar", type: "veg", calories: 80, protein: 4, carbs: 12, fat: 2, fiber: 3, tags: [] },
        { id: 58, name: "Curd", type: "veg", calories: 60, protein: 3, carbs: 5, fat: 3, fiber: 0, tags: [] },
      ],
    },
    snacks: {
      time: "4:30 PM – 5:30 PM",
      items: [
        { id: 59, name: "Onion Pakoda", type: "veg", calories: 160, protein: 4, carbs: 20, fat: 8, fiber: 2, tags: [] },
      ],
    },
    dinner: {
      time: "7:30 PM – 9:00 PM",
      items: [
        { id: 60, name: "Chapathi", type: "veg", calories: 120, protein: 4, carbs: 22, fat: 2, fiber: 3, tags: [] },
        { id: 61, name: "Veg Subzi", type: "veg", calories: 100, protein: 3, carbs: 14, fat: 4, fiber: 3, tags: [] },
        { id: 62, name: "Gobi Curry", type: "veg", calories: 90, protein: 3, carbs: 12, fat: 4, fiber: 3, tags: [] },
      ],
    },
  },
  Saturday: {
    breakfast: {
      time: "7:30 AM – 9:30 AM",
      items: [
        { id: 63, name: "Idly", type: "veg", calories: 120, protein: 4, carbs: 22, fat: 1, fiber: 1, tags: ["Low Fat"] },
        { id: 64, name: "Vada Curry", type: "veg", calories: 160, protein: 6, carbs: 22, fat: 6, fiber: 3, tags: [] },
        { id: 65, name: "Mint Chutney", type: "veg", calories: 30, protein: 1, carbs: 4, fat: 1, fiber: 2, tags: [] },
      ],
    },
    lunch: {
      time: "12:30 PM – 2:00 PM",
      items: [
        { id: 66, name: "Bisi Bele Bath", type: "veg", calories: 300, protein: 10, carbs: 52, fat: 7, fiber: 6, tags: ["High Fiber", "High Protein"] },
        { id: 67, name: "Kara Boondi", type: "veg", calories: 120, protein: 3, carbs: 16, fat: 5, fiber: 1, tags: [] },
        { id: 68, name: "Lemon Rice", type: "veg", calories: 220, protein: 4, carbs: 40, fat: 5, fiber: 2, tags: [] },
        { id: 69, name: "Puliyogare", type: "veg", calories: 240, protein: 4, carbs: 42, fat: 6, fiber: 2, tags: [] },
        { id: 70, name: "Curd", type: "veg", calories: 60, protein: 3, carbs: 5, fat: 3, fiber: 0, tags: [] },
      ],
    },
    snacks: {
      time: "4:30 PM – 5:30 PM",
      items: [
        { id: 71, name: "Ground Nuts", type: "veg", calories: 160, protein: 7, carbs: 6, fat: 13, fiber: 2, tags: ["High Protein", "Healthy Fats"] },
        { id: 72, name: "White Kabul Chana", type: "veg", calories: 140, protein: 8, carbs: 22, fat: 3, fiber: 7, tags: ["High Fiber", "High Protein"] },
      ],
    },
    dinner: {
      time: "7:30 PM – 9:00 PM",
      items: [
        { id: 73, name: "Chapathi", type: "veg", calories: 120, protein: 4, carbs: 22, fat: 2, fiber: 3, tags: [] },
        { id: 74, name: "Majjige Hulli", type: "veg", calories: 70, protein: 3, carbs: 8, fat: 3, fiber: 1, tags: [] },
        { id: 75, name: "Pickle Rice", type: "veg", calories: 220, protein: 4, carbs: 46, fat: 2, fiber: 1, tags: [] },
      ],
    },
  },
  Sunday: {
    breakfast: {
      time: "7:30 AM – 9:30 AM",
      items: [
        { id: 76, name: "Set Dosa", type: "veg", calories: 200, protein: 5, carbs: 36, fat: 5, fiber: 2, tags: [] },
        { id: 77, name: "Veg Kurma", type: "veg", calories: 160, protein: 5, carbs: 18, fat: 8, fiber: 4, tags: [] },
      ],
    },
    lunch: {
      time: "12:30 PM – 2:00 PM",
      items: [
        { id: 78, name: "Chicken Biryani", type: "non-veg", calories: 480, protein: 28, carbs: 60, fat: 14, fiber: 2, tags: ["High Protein", "Special"] },
        { id: 79, name: "Veg Biryani", type: "veg", calories: 380, protein: 10, carbs: 68, fat: 8, fiber: 4, tags: ["Special"] },
        { id: 80, name: "Raitha", type: "veg", calories: 55, protein: 3, carbs: 6, fat: 2, fiber: 0, tags: [] },
        { id: 81, name: "Salna", type: "non-veg", calories: 120, protein: 10, carbs: 8, fat: 6, fiber: 2, tags: [] },
        { id: 82, name: "Ice Cream (50ml)", type: "veg", calories: 100, protein: 2, carbs: 14, fat: 4, fiber: 0, tags: ["Special"] },
        { id: 83, name: "Gulab Jamun", type: "veg", calories: 150, protein: 3, carbs: 28, fat: 4, fiber: 0, tags: ["Special"] },
      ],
    },
    snacks: {
      time: "4:30 PM – 5:30 PM",
      items: [
        { id: 84, name: "Bread Butter Jam", type: "veg", calories: 200, protein: 5, carbs: 34, fat: 7, fiber: 1, tags: [] },
      ],
    },
    dinner: {
      time: "7:30 PM – 9:00 PM",
      items: [
        { id: 85, name: "Parotta", type: "veg", calories: 250, protein: 6, carbs: 42, fat: 7, fiber: 2, tags: [] },
        { id: 86, name: "Dhal Gravy", type: "veg", calories: 130, protein: 8, carbs: 20, fat: 3, fiber: 5, tags: ["High Protein"] },
        { id: 87, name: "Green Salad", type: "veg", calories: 30, protein: 2, carbs: 5, fat: 0, fiber: 3, tags: ["Low Cal"] },
      ],
    },
  },
};

export const DAYS: DayKey[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "snacks", "dinner"];

export function getTodayKey(): DayKey {
  const day = new Date().toLocaleDateString("en-US", { weekday: "long" });
  return (DAYS.includes(day as DayKey) ? day : "Monday") as DayKey;
}

export function getTomorrowKey(): DayKey {
  const tomorrow = new Date(Date.now() + 86400000);
  const day = tomorrow.toLocaleDateString("en-US", { weekday: "long" });
  return (DAYS.includes(day as DayKey) ? day : "Monday") as DayKey;
}

export function getAllMenuItems(): (MenuItem & { day: DayKey; meal: MealType })[] {
  const out: (MenuItem & { day: DayKey; meal: MealType })[] = [];
  for (const day of DAYS) {
    for (const meal of MEAL_TYPES) {
      for (const item of menuData[day][meal].items) {
        out.push({ ...item, day, meal });
      }
    }
  }
  return out;
}

export function getItemDays(name: string): string {
  const days = new Set<string>();
  for (const day of DAYS) {
    for (const meal of MEAL_TYPES) {
      if (menuData[day][meal].items.some((i) => i.name.toLowerCase() === name.toLowerCase())) {
        days.add(day);
      }
    }
  }
  return Array.from(days).join(", ") || "Not in this week's menu";
}

export function generateTags(item: MenuItem): string[] {
  const tags: string[] = [];
  if (item.protein >= 15) tags.push("High Protein");
  if (item.fiber >= 5) tags.push("High Fiber");
  if (item.fat <= 3) tags.push("Low Fat");
  if (item.calories <= 100) tags.push("Low Cal");
  if (item.carbs >= 40) tags.push("High Carb");
  if (item.type === "non-veg") tags.push("Non-Veg");
  return tags.length > 0 ? tags : item.tags;
}
