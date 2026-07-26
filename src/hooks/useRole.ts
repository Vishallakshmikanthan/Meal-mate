import { useEffect, useState } from "react";
import { getRole, type Role } from "@/lib/role";

export function useRole(): Role {
  const [role, setRoleState] = useState<Role>("student");
  useEffect(() => {
    setRoleState(getRole());
    const h = () => setRoleState(getRole());
    window.addEventListener("mealops:role", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("mealops:role", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return role;
}
