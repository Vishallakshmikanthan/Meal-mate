import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — MealOps" },
      { name: "description", content: "Sign in to sync your MealOps meal logs across devices." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s.next === "string" ? s.next : "",
  }),
  component: AuthPage,
});

function isSafeNext(next: string): boolean {
  return next.startsWith("/") && !next.startsWith("//");
}

function AuthPage() {
  const navigate = useNavigate();
  const { next } = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const returnTo = isSafeNext(next) ? next : "/";

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.href = returnTo;
    });
  }, [returnTo]);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth?next=${encodeURIComponent(returnTo)}`,
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = returnTo;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/auth?next=${encodeURIComponent(returnTo)}`,
      });
      if (result.error) {
        toast.error(result.error.message || "Google sign-in failed");
        setBusy(false);
        return;
      }
      if (result.redirected) return;
      window.location.href = returnTo;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[calc(100dvh-5.5rem)] flex items-center justify-center px-5 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground bg-card border border-border rounded-full px-3 py-1.5 mb-4">
            <Sparkles className="size-3 text-[var(--leaf)]" /> MealOps
          </div>
          <h1 className="font-display text-3xl leading-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Sync your meal logs across devices and connect MealOps to your AI assistant.
          </p>
        </div>

        <button
          onClick={handleGoogle}
          disabled={busy}
          className="w-full py-3 rounded-2xl bg-card border border-border text-sm font-semibold flex items-center justify-center gap-2 hover:bg-muted/40 disabled:opacity-50 min-tap mb-3"
        >
          <GoogleIcon /> Continue with Google
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="h-px bg-border flex-1" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">or</span>
          <div className="h-px bg-border flex-1" />
        </div>

        <form onSubmit={handleEmail} className="space-y-2.5">
          <input
            type="email"
            required
            placeholder="you@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full text-sm px-4 py-3 rounded-2xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring min-tap"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full text-sm px-4 py-3 rounded-2xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring min-tap"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 min-tap"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="w-full text-center text-xs text-muted-foreground mt-4 hover:text-foreground"
        >
          {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.44-1.72 4.22-5.5 4.22-3.32 0-6.02-2.74-6.02-6.12S8.68 6.08 12 6.08c1.88 0 3.14.8 3.86 1.5l2.64-2.54C16.9 3.5 14.66 2.5 12 2.5 6.98 2.5 2.94 6.54 2.94 11.6S6.98 20.7 12 20.7c6.94 0 8.66-4.86 8.66-7.4 0-.5-.06-.9-.14-1.3H12z"/>
    </svg>
  );
}
