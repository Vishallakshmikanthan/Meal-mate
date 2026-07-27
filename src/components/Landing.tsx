import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Lock, Building2, Salad, QrCode, Sparkles, ArrowRight } from "lucide-react";

const floaters = ["🥗", "🍛", "🥘", "🍎", "🥑", "🍚", "🥕", "🍜", "🫐", "🌶️", "🥒", "🍇"];

export function Landing() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-background">
      {/* Ambient background */}
      <div className="pointer-events-none absolute -top-32 -left-32 size-80 rounded-full bg-[var(--leaf)]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 size-96 rounded-full bg-primary/15 blur-3xl" />

      {/* Floating food illustrations */}
      {floaters.map((emoji, i) => {
        const left = (i * 37) % 100;
        const top = (i * 53) % 90;
        const dur = 8 + (i % 5) * 2;
        return (
          <motion.div
            key={i}
            className="pointer-events-none absolute text-3xl opacity-[0.08] select-none"
            style={{ left: `${left}%`, top: `${top}%` }}
            animate={{ y: [0, -18, 0], rotate: [0, 8, -6, 0] }}
            transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
          >
            {emoji}
          </motion.div>
        );
      })}

      <div className="relative z-10 max-w-md mx-auto px-6 pt-16 pb-12 flex flex-col min-h-dvh">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 backdrop-blur px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-6">
            <Sparkles className="size-3 text-[var(--leaf)]" /> Smart Dining Platform
          </div>

          <div className="mx-auto mb-5 size-20 rounded-3xl leaf-gradient text-primary-foreground flex items-center justify-center shadow-xl">
            <Salad className="size-10" strokeWidth={2.2} />
          </div>

          <h1 className="font-display text-5xl leading-[0.95] tracking-tight">
            Meal <span className="text-[var(--leaf)]">Mate</span>
          </h1>
          <p className="mt-4 text-[15px] leading-snug text-muted-foreground max-w-xs mx-auto">
            Smart Dining. Better Nutrition.{" "}
            <span className="font-semibold text-foreground">Zero Food Waste.</span>
          </p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-10 space-y-3"
        >
          <Link
            to="/auth"
            search={{ next: "" }}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-primary-foreground text-[15px] font-semibold shadow-lg shadow-primary/20 hover:opacity-95 active:scale-[0.99] transition min-tap"
          >
            Login <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/auth"
            search={{ next: "" }}
            className="w-full flex items-center justify-center py-4 rounded-2xl bg-card border border-border text-[15px] font-semibold hover:bg-muted/40 active:scale-[0.99] transition min-tap"
          >
            Sign up — it's free
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 grid grid-cols-2 gap-2.5"
        >
          {[
            { Icon: Lock, label: "Secure Login", tint: "text-primary" },
            { Icon: Building2, label: "Multi-Org", tint: "text-[var(--leaf)]" },
            { Icon: Salad, label: "Nutrition Tracking", tint: "text-emerald-700" },
            { Icon: QrCode, label: "QR Meal Collection", tint: "text-amber-700" },
          ].map(({ Icon, label, tint }) => (
            <div
              key={label}
              className="rounded-2xl bg-card/80 backdrop-blur border border-border p-3.5 flex items-center gap-2.5"
            >
              <div className="size-9 rounded-xl bg-muted/60 flex items-center justify-center">
                <Icon className={`size-4 ${tint}`} strokeWidth={2.2} />
              </div>
              <div className="text-[12px] font-semibold leading-tight">{label}</div>
            </div>
          ))}
        </motion.div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-auto pt-10 text-center text-[11px] text-muted-foreground"
        >
          For students, hostels, PGs, corporate cafeterias & food providers.
        </motion.footer>
      </div>
    </div>
  );
}
