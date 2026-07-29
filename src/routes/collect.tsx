import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { QrCode, CheckCircle2, AlertTriangle, Utensils, Leaf, Drumstick, Sparkles } from "lucide-react";
import { CameraQrScanner } from "@/components/CameraQrScanner";
import { FoodScanPanel } from "@/components/FoodScanPanel";
import { getTodayKey, type MenuItem } from "@/lib/menuData";
import { getDishesFor } from "@/lib/providerMenu";
import { logMeal } from "@/lib/storage";
import {
  QR_EVENT,
  getActiveSessions,
  recordCollection,
  verifyToken,
  type QRSession,
} from "@/lib/qrSession";

export const Route = createFileRoute("/collect")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    t: typeof s.t === "string" ? s.t : "",
  }),
  head: () => ({
    meta: [
      { title: "Collect Your Meal — Meal Mate" },
      {
        name: "description",
        content: "Scan the counter QR code, pick what's on your plate and log nutrition instantly.",
      },
      { property: "og:title", content: "Collect Your Meal — Meal Mate" },
      {
        property: "og:description",
        content: "Verify the counter QR session, choose your items and record attendance and nutrition.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CollectPage,
});

function CollectPage() {
  const { t } = useSearch({ from: "/collect" });
  const [code, setCode] = useState(t);
  const [session, setSession] = useState<QRSession | null>(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const [active, setActive] = useState<QRSession[]>([]);
  const [tab, setTab] = useState<"qr" | "food">("qr");

  useEffect(() => {
    const upd = () => setActive(getActiveSessions());
    upd();
    window.addEventListener(QR_EVENT, upd);
    window.addEventListener("storage", upd);
    return () => {
      window.removeEventListener(QR_EVENT, upd);
      window.removeEventListener("storage", upd);
    };
  }, []);

  useEffect(() => {
    if (t) tryVerify(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  function tryVerify(value: string) {
    const res = verifyToken(value);
    if (res.ok) {
      setSession(res.session);
      setError("");
    } else {
      setSession(null);
      setError(
        res.reason === "expired"
          ? "This QR session has expired. Ask the counter for a fresh code."
          : res.reason === "revoked"
            ? "This session was closed by the provider."
            : "We couldn't find that code. Check the digits and try again.",
      );
    }
  }

  const items = useMemo<MenuItem[]>(() => {
    if (!session) return [];
    const dishes = getDishesFor(getTodayKey(), session.meal).filter((d) => d.status === "published");
    return dishes.map(({ day: _d, meal: _m, status: _s, updatedAt: _u, ...rest }) => rest);
  }, [session]);

  function submit() {
    if (!session) return;
    const chosen = items.filter((i) => selected.includes(i.id));
    if (chosen.length === 0) return;
    recordCollection(session, chosen, "me");
    logMeal(session.meal, chosen);
    setDone(true);
    confetti({ particleCount: 70, spread: 65, origin: { y: 0.7 }, scalar: 0.9 });
  }

  if (done && session) {
    const cals = items.filter((i) => selected.includes(i.id)).reduce((s, i) => s + i.calories, 0);
    return (
      <div className="max-w-md mx-auto px-5 pt-16 pb-8 text-center">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-auto size-20 rounded-3xl leaf-gradient text-primary-foreground flex items-center justify-center shadow-xl"
        >
          <CheckCircle2 className="size-10" />
        </motion.div>
        <h1 className="font-display text-3xl mt-5">Meal collected</h1>
        <p className="text-sm text-muted-foreground mt-1.5 capitalize">
          {session.meal} · {cals} kcal logged to your nutrition
        </p>
        <div className="mt-6 grid gap-2">
          <Link
            to="/"
            className="py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold min-tap"
          >
            View my dashboard
          </Link>
          <button
            onClick={() => {
              setDone(false);
              setSelected([]);
              setSession(null);
              setCode("");
            }}
            className="py-3 rounded-2xl bg-card border border-border text-sm font-semibold min-tap"
          >
            Collect another meal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-5 pt-6 pb-4 space-y-5">
      <header>
        <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground bg-card border border-border rounded-full px-2.5 py-1 mb-3">
          <QrCode className="size-3 text-[var(--leaf)]" /> Meal Collection
        </div>
        <h1 className="font-display text-3xl leading-tight">Collect your meal</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          One camera for everything — scan the counter QR, or scan your plate for nutrition.
        </p>
      </header>

      {!session && (
        <>
          <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl bg-card border border-border">
            {([
              { id: "qr" as const, label: "QR scan", icon: QrCode },
              { id: "food" as const, label: "Food scan", icon: Sparkles },
            ]).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`py-2.5 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition min-tap ${
                  tab === id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className="size-4" /> {label}
              </button>
            ))}
          </div>

          {tab === "food" && (
            <section className="rounded-2xl bg-card border border-border p-4">
              <FoodScanPanel />
            </section>
          )}

          {tab === "qr" && (
          <section className="rounded-2xl bg-card border border-border p-4 space-y-3">
            <CameraQrScanner
              onResult={(value) => {
                setCode(value);
                tryVerify(value);
              }}
            />
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                or enter code
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ENTER CODE"
              className="w-full text-center font-mono tracking-[0.3em] text-lg px-4 py-3 rounded-2xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring min-tap"
            />
            <button
              onClick={() => tryVerify(code)}
              disabled={code.trim().length < 4}
              className="w-full py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 min-tap"
            >
              Verify session
            </button>
            {error && (
              <p className="flex items-start gap-2 text-[12px] text-destructive">
                <AlertTriangle className="size-3.5 mt-0.5 shrink-0" /> {error}
              </p>
            )}
          </section>
          )}

          {tab === "qr" && active.length > 0 && (
            <section className="rounded-2xl bg-card border border-border p-4">
              <h2 className="font-display text-lg mb-2">Live at the counter</h2>
              <div className="space-y-2">
                {active.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setCode(s.token);
                      tryVerify(s.token);
                    }}
                    className="w-full flex items-center justify-between rounded-xl border border-border p-3 text-left hover:bg-muted/40 transition min-tap"
                  >
                    <span className="text-sm font-semibold capitalize">{s.meal}</span>
                    <span className="font-mono text-xs text-muted-foreground">{s.token}</span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {session && (
        <section className="rounded-2xl bg-card border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg capitalize">{session.meal} plate</h2>
            <span className="text-[11px] text-[var(--leaf)] font-semibold">Verified</span>
          </div>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No published dishes for this session yet.</p>
          ) : (
            <div className="space-y-2">
              {items.map((i) => {
                const on = selected.includes(i.id);
                return (
                  <button
                    key={i.id}
                    onClick={() =>
                      setSelected((p) => (on ? p.filter((x) => x !== i.id) : [...p, i.id]))
                    }
                    className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition min-tap ${
                      on ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
                    }`}
                  >
                    <div className="size-9 rounded-xl bg-muted/60 flex items-center justify-center shrink-0">
                      {i.type === "veg" ? (
                        <Leaf className="size-4 text-[var(--leaf)]" />
                      ) : (
                        <Drumstick className="size-4 text-amber-700" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold truncate">{i.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {i.calories} kcal · {i.protein}g protein
                      </div>
                    </div>
                    {on && <CheckCircle2 className="size-4 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
          <button
            onClick={submit}
            disabled={selected.length === 0}
            className="w-full py-3 rounded-2xl leaf-gradient text-primary-foreground text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50 min-tap"
          >
            <Utensils className="size-4" /> Confirm collection ({selected.length})
          </button>
        </section>
      )}
    </div>
  );
}
