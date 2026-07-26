export type Role = "student" | "provider";
const KEY = "mealops:role";

export function getRole(): Role {
  if (typeof window === "undefined") return "student";
  const v = localStorage.getItem(KEY);
  return v === "provider" ? "provider" : "student";
}

export function setRole(role: Role) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, role);
  window.dispatchEvent(new Event("mealops:role"));
}

export function homeForRole(role: Role): string {
  return role === "provider" ? "/provider" : "/";
}
