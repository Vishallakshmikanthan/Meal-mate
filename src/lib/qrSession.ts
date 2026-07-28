import type { MealType, MenuItem } from "./menuData";

export interface QRSession {
  id: string;
  token: string;
  meal: MealType;
  date: string; // YYYY-MM-DD
  createdAt: number;
  expiresAt: number;
  revoked?: boolean;
}

export interface MealCollection {
  id: string;
  sessionId: string;
  meal: MealType;
  date: string;
  items: MenuItem[];
  calories: number;
  timestamp: number;
  student: string;
}

const SESSION_KEY = "mealmate:qr-sessions:v1";
const COLLECTION_KEY = "mealmate:collections:v1";
export const QR_EVENT = "mealmate:qr";

const isBrowser = () => typeof window !== "undefined";

function emit() {
  if (isBrowser()) window.dispatchEvent(new Event(QR_EVENT));
}

function read<T>(key: string): T[] {
  if (!isBrowser()) return [];
  try {
    return JSON.parse(localStorage.getItem(key) || "[]") as T[];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]) {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify(value));
  emit();
}

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export function getSessions(): QRSession[] {
  return read<QRSession>(SESSION_KEY).sort((a, b) => b.createdAt - a.createdAt);
}

export function isLive(s: QRSession, now = Date.now()) {
  return !s.revoked && s.expiresAt > now;
}

export function getActiveSessions(now = Date.now()): QRSession[] {
  return getSessions().filter((s) => isLive(s, now));
}

export function createSession(meal: MealType, minutes: number): QRSession {
  const now = Date.now();
  const session: QRSession = {
    id: uid(),
    token: uid().replace(/-/g, "").slice(0, 10).toUpperCase(),
    meal,
    date: todayISO(),
    createdAt: now,
    expiresAt: now + minutes * 60_000,
  };
  // one live session per meal
  const rest = getSessions().map((s) =>
    s.meal === meal && isLive(s, now) ? { ...s, revoked: true } : s,
  );
  write(SESSION_KEY, [session, ...rest]);
  return session;
}

export function revokeSession(id: string) {
  write(
    SESSION_KEY,
    getSessions().map((s) => (s.id === id ? { ...s, revoked: true } : s)),
  );
}

export type VerifyResult =
  | { ok: true; session: QRSession }
  | { ok: false; reason: "not-found" | "expired" | "revoked" };

export function verifyToken(token: string): VerifyResult {
  const t = token.trim().toUpperCase();
  const session = getSessions().find((s) => s.token === t);
  if (!session) return { ok: false, reason: "not-found" };
  if (session.revoked) return { ok: false, reason: "revoked" };
  if (session.expiresAt <= Date.now()) return { ok: false, reason: "expired" };
  return { ok: true, session };
}

export function getCollections(): MealCollection[] {
  return read<MealCollection>(COLLECTION_KEY).sort((a, b) => b.timestamp - a.timestamp);
}

export function hasCollected(sessionId: string, student: string) {
  return getCollections().some((c) => c.sessionId === sessionId && c.student === student);
}

export function recordCollection(
  session: QRSession,
  items: MenuItem[],
  student: string,
): MealCollection {
  const entry: MealCollection = {
    id: uid(),
    sessionId: session.id,
    meal: session.meal,
    date: session.date,
    items,
    calories: items.reduce((s, i) => s + i.calories, 0),
    timestamp: Date.now(),
    student,
  };
  write(COLLECTION_KEY, [entry, ...getCollections()]);
  return entry;
}

/* ---------- analytics helpers ---------- */

export function collectionsByDay(days = 7) {
  const out: { date: string; label: string; meals: number; calories: number }[] = [];
  const all = getCollections();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const date = d.toISOString().split("T")[0];
    const rows = all.filter((c) => c.date === date);
    out.push({
      date,
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      meals: rows.length,
      calories: rows.reduce((s, c) => s + c.calories, 0),
    });
  }
  return out;
}

export function collectionsByMeal() {
  const all = getCollections();
  const meals: MealType[] = ["breakfast", "lunch", "snacks", "dinner"];
  return meals.map((m) => ({
    meal: m,
    label: m[0].toUpperCase() + m.slice(1),
    count: all.filter((c) => c.meal === m).length,
  }));
}

export function topDishes(limit = 6) {
  const counts = new Map<string, number>();
  for (const c of getCollections()) {
    for (const i of c.items) counts.set(i.name, (counts.get(i.name) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function peakHours() {
  const buckets = new Array(24).fill(0) as number[];
  for (const c of getCollections()) buckets[new Date(c.timestamp).getHours()] += 1;
  return buckets
    .map((count, hour) => ({ hour, label: `${hour}:00`, count }))
    .filter((b) => b.count > 0 || (b.hour >= 7 && b.hour <= 21));
}
