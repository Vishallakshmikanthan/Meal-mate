import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, Timer, ShieldCheck, XCircle, Users } from "lucide-react";
import { MEAL_TYPES, type MealType } from "@/lib/menuData";
import {
  QR_EVENT,
  createSession,
  getCollections,
  getSessions,
  isLive,
  revokeSession,
  type QRSession,
} from "@/lib/qrSession";

export const Route = createFileRoute("/provider/qr")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "QR Meal Sessions — Meal Mate Provider" },
      {
        name: "description",
        content: "Generate expiring QR codes for each meal session and watch collections come in live.",
      },
      { property: "og:title", content: "QR Meal Sessions — Meal Mate Provider" },
      {
        property: "og:description",
        content: "Expiring QR codes for breakfast, lunch, snacks and dinner with live collection tracking.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProviderQRPage,
});

const DURATIONS = [30, 60, 90, 120];

function ProviderQRPage() {
  const [sessions, setSessions] = useState<QRSession[]>([]);
  const [collections, setCollections] = useState(0);
  const [meal, setMeal] = useState<MealType>("lunch");
  const [minutes, setMinutes] = useState(90);
  const [now, setNow] = useState(Date.now());
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    const upd = () => {
      setSessions(getSessions());
      setCollections(getCollections().length);
    };
    upd();
    window.addEventListener(QR_EVENT, upd);
    window.addEventListener("storage", upd);
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.removeEventListener(QR_EVENT, upd);
      window.removeEventListener("storage", upd);
      clearInterval(t);
    };
  }, []);

  const live = sessions.filter((s) => isLive(s, now));
  const past = sessions.filter((s) => !isLive(s, now)).slice(0, 6);

  return (
    <div className="max-w-2xl mx-auto px-5 pt-6 pb-4 space-y-5">
      <header>
        <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground bg-card border border-border rounded-full px-2.5 py-1 mb-3">
          <QrCode className="size-3 text-[var(--leaf)]" /> Counter QR
        </div>
        <h1 className="font-display text-3xl leading-tight">Meal Sessions</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {live.length} live · {collections} collections recorded
        </p>
      </header>

      <section className="rounded-2xl bg-card border border-border p-4 space-y-3">
        <h2 className="font-display text-lg">Open a session</h2>
        <div className="grid grid-cols-4 gap-2">
          {MEAL_TYPES.map((m) => (
            <button
              key={m}
              onClick={() => setMeal(m)}
              className={`rounded-xl border py-2 text-[11px] font-semibold capitalize transition min-tap ${
                meal === m ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted/40"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => setMinutes(d)}
              className={`flex-1 rounded-xl border py-2 text-[11px] font-semibold transition min-tap ${
                minutes === d ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted/40"
              }`}
            >
              {d}m
            </button>
          ))}
        </div>
        <button
          onClick={() => createSession(meal, minutes)}
          className="w-full py-3 rounded-2xl leaf-gradient text-primary-foreground text-sm font-semibold min-tap active:scale-[0.99] transition"
        >
          Generate QR for {meal}
        </button>
      </section>

      <AnimatePresence initial={false}>
        {live.map((s) => {
          const left = Math.max(0, s.expiresAt - now);
          const mins = Math.floor(left / 60000);
          const secs = Math.floor((left % 60000) / 1000);
          const url = `${origin}/collect?t=${s.token}`;
          const count = getCollections().filter((c) => c.sessionId === s.id).length;
          return (
            <motion.section
              key={s.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="rounded-2xl bg-card border border-border p-5 text-center"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--leaf)]">
                  <ShieldCheck className="size-3.5" /> Live · {s.meal}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] tabular-nums text-muted-foreground">
                  <Timer className="size-3.5" /> {mins}:{String(secs).padStart(2, "0")}
                </span>
              </div>
              <div className="inline-block rounded-2xl bg-background p-4 border border-border">
                {origin && <QRCodeSVG value={url} size={176} level="M" />}
              </div>
              <div className="mt-4 font-mono text-lg tracking-[0.3em] font-semibold">{s.token}</div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Students scan at the counter or enter this code on the Collect screen.
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                  <Users className="size-3.5 text-primary" /> {count} collected
                </span>
                <button
                  onClick={() => revokeSession(s.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive min-tap"
                >
                  <XCircle className="size-3.5" /> End session
                </button>
              </div>
            </motion.section>
          );
        })}
      </AnimatePresence>

      {past.length > 0 && (
        <section className="rounded-2xl bg-card border border-border p-4">
          <h2 className="font-display text-lg mb-2">Recent sessions</h2>
          <div className="space-y-1">
            {past.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0 text-sm"
              >
                <span className="capitalize font-semibold">{s.meal}</span>
                <span className="text-[11px] text-muted-foreground">
                  {s.date} · {s.revoked ? "ended" : "expired"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
