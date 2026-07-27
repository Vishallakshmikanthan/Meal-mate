import { useEffect, useState } from "react";
import { getProviderMenu, type ProviderDish } from "@/lib/providerMenu";

export function useProviderMenu(): ProviderDish[] {
  const [dishes, setDishes] = useState<ProviderDish[]>([]);
  useEffect(() => {
    const sync = () => setDishes(getProviderMenu());
    sync();
    window.addEventListener("mealops:provider-menu", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("mealops:provider-menu", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return dishes;
}
