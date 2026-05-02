import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { identifyAndGetNutrition, type ScanResult } from "@/lib/foodScanner";
import { logMeal } from "@/lib/storage";
import type { MealType } from "@/lib/menuData";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "AI Food Scanner — MealOps" },
      { name: "description", content: "Snap any plate. Free in-browser ML estimates calories and macros — no API keys, no uploads." },
    ],
  }),
  component: ScanPage,
});

function ScanPage() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImage(ev.target?.result as string);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const identify = async () => {
    if (!imgRef.current) return;
    setLoading(true);
    setError(null);
    try {
      if (!imgRef.current.complete) {
        await new Promise((r) => { imgRef.current!.onload = r; });
      }
      const r = await identifyAndGetNutrition(imgRef.current);
      setResult(r);
      toast.success(`Identified: ${r.name}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not identify the food.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-5 py-6 max-w-2xl mx-auto">
      <header className="mb-5">
        <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground bg-card border border-border rounded-full px-3 py-1.5">
          <Sparkles className="size-3 text-[var(--leaf)]" /> AI Food Scanner
        </div>
        <h1 className="font-display text-3xl mt-3 leading-tight">Point. Shoot. Know.</h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          MobileNet runs locally · nutrition from Open Food Facts. Nothing leaves your device.
        </p>
      </header>

      {/* Upload zone */}
      <div className="rounded-3xl bg-card border-2 border-dashed border-[var(--leaf)]/40 p-4 mb-4">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
        />
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full aspect-[4/3] rounded-2xl bg-background hover:bg-muted/40 transition flex flex-col items-center justify-center text-center p-6 min-tap"
        >
          {image ? (
            <img
              ref={imgRef}
              src={image}
              alt="To scan"
              crossOrigin="anonymous"
              className="max-h-full max-w-full rounded-xl object-contain"
            />
          ) : (
            <>
              <div className="size-16 rounded-2xl bg-[var(--leaf)]/15 text-primary flex items-center justify-center mb-3">
                <ImagePlus className="size-7" />
              </div>
              <div className="font-display text-xl">Tap to add a photo</div>
              <div className="text-sm text-muted-foreground mt-1">Use camera or pick from gallery</div>
            </>
          )}
        </button>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={() => inputRef.current?.click()}
            className="py-3 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:bg-secondary/70 min-tap"
          >
            <Camera className="size-4" /> Photo
          </button>
          <button
            onClick={identify}
            disabled={!image || loading}
            className="py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 min-tap glow-shadow"
          >
            {loading ? (
              <><Loader2 className="size-4 animate-spin" /> Identifying...</>
            ) : (
              <><Sparkles className="size-4" /> Identify</>
            )}
          </button>
        </div>
        {loading && (
          <p className="text-[11px] text-muted-foreground mt-3 text-center">
            First scan downloads the model (~16MB). After that, it's instant.
          </p>
        )}
        {error && <p className="text-xs text-destructive mt-3 text-center">{error}</p>}
      </div>

      {/* Result */}
      {result && (
        <div className="rounded-3xl bg-card border border-border p-5 ink-shadow ring-gradient animate-in fade-in-0 slide-in-from-bottom-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Identified as</div>
          <div className="font-display text-3xl mt-1 capitalize">{result.name}</div>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <SourceBadge source={result.source} />
            {typeof result.confidence === "number" && (
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {Math.round(result.confidence * 100)}% match
              </span>
            )}
          </div>

          <div className="grid grid-cols-5 gap-2 mt-4 mb-4">
            <Stat label="kcal" value={result.calories} accent />
            <Stat label="P" value={`${result.protein}g`} />
            <Stat label="C" value={`${result.carbs}g`} />
            <Stat label="F" value={`${result.fat}g`} />
            <Stat label="Fib" value={`${result.fiber}g`} />
          </div>

          {result.source === "api" && (
            <p className="text-[11px] text-muted-foreground mb-4">
              Per 100g, from Open Food Facts. Adjust for portion size.
            </p>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <MealLogButton meal="lunch" result={result} />
            <MealLogButton meal="dinner" result={result} />
          </div>
        </div>
      )}
    </div>
  );
}

function SourceBadge({ source }: { source: ScanResult["source"] }) {
  const map = {
    menu: { text: "From your mess menu", color: "bg-[var(--leaf)]/20 text-foreground border-[var(--leaf)]/40" },
    api: { text: "Open Food Facts", color: "bg-[var(--mid)]/15 text-foreground border-[var(--mid)]/40" },
    fallback: { text: "Estimated", color: "bg-muted text-muted-foreground border-border" },
  } as const;
  const m = map[source];
  return (
    <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border font-semibold ${m.color}`}>
      {m.text}
    </span>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className={`rounded-xl py-3 text-center ${accent ? "bg-[var(--leaf)]/20" : "bg-secondary"}`}>
      <div className="font-display text-lg leading-none tabular-nums">{value}</div>
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function MealLogButton({ meal, result }: { meal: MealType; result: ScanResult }) {
  return (
    <button
      onClick={() => {
        logMeal(meal, [{
          id: Date.now(),
          name: result.name,
          type: "veg",
          calories: result.calories,
          protein: result.protein,
          carbs: result.carbs,
          fat: result.fat,
          fiber: result.fiber,
          tags: [],
        }]);
        toast.success(`Logged to ${meal}`);
      }}
      className="py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 flex items-center justify-center gap-1.5 capitalize min-tap"
    >
      <Plus className="size-4" /> Log to {meal}
    </button>
  );
}
