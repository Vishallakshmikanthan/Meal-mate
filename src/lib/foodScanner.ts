import Fuse from "fuse.js";
import { getAllMenuItems, type MenuItem } from "./menuData";

export interface ScanResult {
  source: "menu" | "api" | "fallback";
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  confidence?: number;
}

let mobilenetModel: any = null;

async function loadModel() {
  if (mobilenetModel) return mobilenetModel;
  const tf = await import("@tensorflow/tfjs");
  await tf.ready();
  const mobilenet = await import("@tensorflow-models/mobilenet");
  mobilenetModel = await mobilenet.load({ version: 2, alpha: 1.0 });
  return mobilenetModel;
}

export async function classifyFood(img: HTMLImageElement) {
  const model = await loadModel();
  const predictions: { className: string; probability: number }[] = await model.classify(img, 3);
  return predictions;
}

export async function getNutritionFromAPI(foodName: string) {
  try {
    const query = encodeURIComponent(foodName.split(",")[0].trim());
    const res = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&json=1&page_size=1`,
    );
    const data = await res.json();
    const n = data.products?.[0]?.nutriments;
    if (!n || !n["energy-kcal_100g"]) return null;
    return {
      calories: Math.round(n["energy-kcal_100g"] || 0),
      protein: Math.round(n["proteins_100g"] || 0),
      carbs: Math.round(n["carbohydrates_100g"] || 0),
      fat: Math.round(n["fat_100g"] || 0),
      fiber: Math.round(n["fiber_100g"] || 0),
    };
  } catch {
    return null;
  }
}

export function searchMenuForItem(name: string): MenuItem | null {
  const all = getAllMenuItems();
  const fuse = new Fuse(all, { keys: ["name"], threshold: 0.45 });
  const result = fuse.search(name);
  return result[0]?.item ?? null;
}

const FALLBACK: ScanResult = {
  source: "fallback",
  name: "Mixed dish",
  calories: 250,
  protein: 8,
  carbs: 35,
  fat: 9,
  fiber: 3,
};

export async function identifyAndGetNutrition(img: HTMLImageElement): Promise<ScanResult> {
  const preds = await classifyFood(img);
  for (const p of preds) {
    const candidates = p.className.split(",").map((s) => s.trim());
    for (const c of candidates) {
      const menuMatch = searchMenuForItem(c);
      if (menuMatch) {
        return {
          source: "menu",
          name: menuMatch.name,
          calories: menuMatch.calories,
          protein: menuMatch.protein,
          carbs: menuMatch.carbs,
          fat: menuMatch.fat,
          fiber: menuMatch.fiber,
          confidence: p.probability,
        };
      }
    }
  }
  const top = preds[0];
  const apiName = top.className.split(",")[0].trim();
  const api = await getNutritionFromAPI(apiName);
  if (api) {
    return {
      source: "api",
      name: apiName,
      ...api,
      confidence: top.probability,
    };
  }
  return { ...FALLBACK, name: apiName, confidence: top.probability };
}
