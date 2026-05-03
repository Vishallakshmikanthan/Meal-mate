import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, History, ImagePlus, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { identifyAndGetNutrition, type ScanResult } from "@/lib/foodScanner";
import {
  addScanToHistory,
  clearScanHistory,
  deleteScanFromHistory,
  getScanHistory,
  logMeal,
  type ScanHistoryEntry,
} from "@/lib/storage";
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

async function makeThumbnail(dataUrl: string, maxSize = 96): Promise<string | undefined> {
  try {
    return await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(undefined);
        ctx.drawImage(img, 0, 0, w, h);
        try {
          resolve(canvas.toDataURL("image/jpeg", 0.6));
        } catch {
          resolve(undefined);
        }
      };
      img.onerror = () => resolve(undefined);
      img.src = dataUrl;
    });
  } catch {
    return undefined;
  }
}

function ScanPage() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ScanHistoryEntry[]>([]);
  const imgRef = useRef<HTMLImageElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const refresh = () => setHistory(getScanHistory());
    refresh();
    window.addEventListener("mealops:update", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("mealops:update", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

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
      const thumbnail = image ? await makeThumbnail(image) : undefined;
      addScanToHistory({
        name: r.name,
        source: r.source,
        calories: r.calories,
        protein: r.protein,
        carbs: r.carbs,
        fat: r.fat,
        fiber: r.fiber,
        confidence: r.confidence,
        thumbnail,
      });
      toast.success(`Identified: ${r.name}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not identify the food.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logHistoryEntry = (entry: ScanHistoryEntry, meal: MealType) => {
    logMeal(meal, [{
      id: Date.now(),
      name: entry.name,
      type: "veg",
      calories: entry.calories,
      protein: entry.protein,
      carbs: entry.carbs,
      fat: entry.fat,
      fiber: entry.fiber,
      tags: [],
    }]);
    toast.success(`Logged ${entry.name} to ${meal}`);
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

      {/* Scan history */}
      <section className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-[var(--leaf)]/15 text-primary flex items-center justify-center">
              <History className="size-4" />
            </div>
            <div>
              <h2 className="font-display text-xl leading-none">Scan history</h2>
              <p className="text-[11px] text-muted-foreground mt-1">
                Last {history.length} scan{history.length === 1 ? "" : "s"} · stored on this device
              </p>
            </div>
          </div>
          {history.length > 0 && (
            <button
              onClick={() => {
                clearScanHistory();
                toast.success("Scan history cleared");
              }}
              className="text-[11px] uppercase tracking-wider text-muted-foreground hover:text-destructive px-2 py-1.5 rounded-md min-tap"
            >
              Clear
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No scans yet. Identify a plate and it'll show up here.
            </p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {history.map((entry) => (
              <li
                key={entry.id}
                className="rounded-2xl bg-card border border-border p-3 flex items-center gap-3"
              >
                <div className="size-14 rounded-xl bg-secondary overflow-hidden flex items-center justify-center shrink-0">
                  {entry.thumbnail ? (
                    <img src={entry.thumbnail} alt={entry.name} className="size-full object-cover" />
                  ) : (
                    <Sparkles className="size-5 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold capitalize truncate">{entry.name}</div>
                    <SourceBadge source={entry.source} />
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">
                    {entry.calories} kcal · P {entry.protein}g · C {entry.carbs}g · F {entry.fat}g
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                    {new Date(entry.timestamp).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => logHistoryEntry(entry, "lunch")}
                      className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 min-tap flex items-center gap-1"
                      title="Log to lunch"
                    >
                      <Plus className="size-3" /> Lunch
                    </button>
                    <button
                      onClick={() => logHistoryEntry(entry, "dinner")}
                      className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 min-tap flex items-center gap-1"
                      title="Log to dinner"
                    >
                      <Plus className="size-3" /> Dinner
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      deleteScanFromHistory(entry.id);
                      toast.success("Removed from history");
                    }}
                    className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-destructive px-2 py-1 rounded-md flex items-center justify-center gap-1"
                  >
                    <Trash2 className="size-3" /> Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
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
