import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Beta auth.oauth namespace — tiny local typed wrapper.
interface AuthOAuthShim {
  getAuthorizationDetails: (id: string) => Promise<{
    data?: {
      client?: { name?: string; redirect_uri?: string; domain?: string };
      redirect_url?: string;
      redirect_to?: string;
      scopes?: string[];
    } | null;
    error?: { message: string } | null;
  }>;
  approveAuthorization: (id: string) => Promise<{
    data?: { redirect_url?: string; redirect_to?: string } | null;
    error?: { message: string } | null;
  }>;
  denyAuthorization: (id: string) => Promise<{
    data?: { redirect_url?: string; redirect_to?: string } | null;
    error?: { message: string } | null;
  }>;
}
function oauth(): AuthOAuthShim {
  return (supabase.auth as unknown as { oauth: AuthOAuthShim }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    const next = location.pathname + location.searchStr;
    if (!data.session) throw redirect({ to: "/auth", search: { next } });
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauth().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="min-h-[calc(100dvh-5.5rem)] flex items-center justify-center px-5">
      <div className="max-w-sm text-center">
        <h1 className="font-display text-2xl">Authorization error</h1>
        <p className="text-sm text-muted-foreground mt-2">
          {String((error as Error)?.message ?? error)}
        </p>
      </div>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error } = approve
      ? await oauth().approveAuthorization(authorization_id)
      : await oauth().denyAuthorization(authorization_id);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  const clientName = details?.client?.name ?? "an app";

  return (
    <main className="min-h-[calc(100dvh-5.5rem)] flex items-center justify-center px-5 py-8">
      <div className="w-full max-w-sm">
        <div className="rounded-3xl bg-card border border-border p-6 ink-shadow">
          <h1 className="font-display text-2xl leading-tight">
            Connect {clientName} to MealOps
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {clientName} will be able to call MealOps tools while you are signed in — read
            the mess menu, log meals, and view your own nutrition totals.
          </p>
          <p className="text-xs text-muted-foreground mt-3">
            This does not bypass MealOps permissions. Tools act as you and only see your data.
          </p>
          {details?.client?.redirect_uri && (
            <p className="text-[11px] text-muted-foreground mt-3 break-all">
              Redirect: {details.client.redirect_uri}
            </p>
          )}
          {error && (
            <p role="alert" className="text-xs text-destructive mt-3">
              {error}
            </p>
          )}
          <div className="mt-6 space-y-2.5">
            <button
              disabled={busy}
              onClick={() => decide(true)}
              className="w-full py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 min-tap"
            >
              Approve
            </button>
            <button
              disabled={busy}
              onClick={() => decide(false)}
              className="w-full py-3 rounded-2xl bg-card border border-border text-sm font-semibold hover:bg-muted/40 disabled:opacity-50 min-tap"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
