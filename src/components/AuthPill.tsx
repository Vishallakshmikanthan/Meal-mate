import { Link } from "@tanstack/react-router";
import { LogIn, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function AuthPill() {
  const { user, ready } = useAuth();

  if (!ready) return null;

  if (!user) {
    return (
      <Link
        to="/auth"
        className="fixed top-3 right-3 z-30 inline-flex items-center gap-1.5 rounded-full bg-card border border-border px-3 py-1.5 text-[11px] font-semibold text-foreground hover:bg-muted/40 min-tap shadow-sm"
      >
        <LogIn className="size-3.5" /> Sign in
      </Link>
    );
  }

  const label = user.email?.split("@")[0] ?? "You";

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
  }

  return (
    <div className="fixed top-3 right-3 z-30 inline-flex items-center gap-1 rounded-full bg-card border border-border pl-2.5 pr-1 py-1 text-[11px] font-semibold text-foreground shadow-sm">
      <UserIcon className="size-3.5 text-[var(--leaf)]" />
      <span className="max-w-[90px] truncate">{label}</span>
      <button
        onClick={signOut}
        aria-label="Sign out"
        className="ml-1 size-6 rounded-full hover:bg-muted/60 flex items-center justify-center"
      >
        <LogOut className="size-3.5" />
      </button>
    </div>
  );
}
