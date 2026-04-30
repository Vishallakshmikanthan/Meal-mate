import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, Plus, Sparkles } from "lucide-react";
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
      // wait for image decode
      if (!imgRef.current.complete) {
        await new Promise((r) => {
          imgRef.current!.onload = r;
        });
      }
      const r = await identifyAndGetNutrition(imgRef.current);
      setResult(r);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not identify the food.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-5 sm:px-8 lg:px-12 py-8 lg:py-12 max-w-5xl mx-auto">
      <header className="mb-8">
        <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          AI Food Scanner
        </div>
        <h1 className="font-display text-4xl sm:text-5xl mt-2">
          Point. Shoot. <span className="italic">Know.</span>
        </h1>
        <p className="text-muted-foreground mt-2 max-w-xl">
          MobileNet runs locally in your browser to identify food, then we look up nutrition from{" "}
          <span className="font-medium">Open Food Facts</span>. Nothing leaves your device unless we
          query the public food database.
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload zone */}
        <div className="rounded-3xl bg-card border border-border p-6 ink-shadow">
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
            className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition flex flex-col items-center justify-center text-center p-6 group"
          >
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                ref={imgRef}
                src={image}
                alt="To scan"
                crossOrigin="anonymous"
                className="max-h-full max-w-full rounded-xl object-contain"
              />
            ) : (
              <>
                <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition">
                  <ImagePlus className="size-7" />
                </div>
                <div className="font-display text-xl">Drop a plate photo</div>
                <div className="text-sm text-muted-foreground mt-1">
                  PNG, JPG · or use your phone camera
                </div>
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={() => inputRef.current?.click()}
              className="py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:bg-secondary/70"
            >
              <Camera className="size-4" /> Choose photo
            </button>
            <button
              onClick={identify}
              disabled={!image || loading}
              className="py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Identifying...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" /> Identify food
                </>
              )}
            </button>
          </div>
          {loading && (
            <p className="text-[11px] text-muted-foreground mt-3 text-center">
              First scan downloads the model (~16MB). Subsequent scans are instant.
            </p>
          )}
          {error && (
            <p className="text-xs text-destructive mt-3 text-center">{error}</p>
          )}
        </div>

        {/* Result */}
        <div className="rounded-3xl bg-card border border-border p-6 ink-shadow flex flex-col">
          <h2 className="font-display text-xl mb-4">Nutrition estimate</h2>
          {!result ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground py-12">
              <Sparkles className="size-8 mb-3 opacity-40" />
              <p className="text-sm">Upload a photo and tap "Identify food".</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="mb-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Identified as
                </div>
                <div className="font-display text-3xl mt-1 capitalize">{result.name}</div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <SourceBadge source={result.source} />
                  {typeof result.confidence === "number" && (
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {Math.round(result.confidence * 100)}% match
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2 mb-5">
                <Stat label="Cal" value={result.calories} accent />
                <Stat label="Protein" value={`${result.protein}g`} />
                <Stat label="Carbs" value={`${result.carbs}g`} />
                <Stat label="Fat" value={`${result.fat}g`} />
                <Stat label="Fiber" value={`${result.fiber}g`} />
              </div>

              {result.source === "api" && (
                <p className="text-[11px] text-muted-foreground mb-4">
                  Per 100g, from Open Food Facts. Adjust for portion size as needed.
                </p>
              )}

              <div className="grid grid-cols-2 gap-3 mt-auto">
                <MealLogButton meal="lunch" result={result} />
                <MealLogButton meal="dinner" result={result} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SourceBadge({ source }: { source: ScanResult["source"] }) {
  const map = {
    menu: { text: "From your mess menu", color: "bg-leaf/15 text-foreground border-leaf/30" },
    api: { text: "Open Food Facts", color: "bg-accent/20 text-foreground border-accent/40" },
    fallback: { text: "Estimated", color: "bg-muted text-muted-foreground border-border" },
  } as const;
  const m = map[source];
  return (
    <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border ${m.color}`}>
      {m.text}
    </span>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl py-3 text-center ${accent ? "bg-accent/30" : "bg-secondary"}`}
    >
      <div className="font-display text-xl leading-none">{value}</div>
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground mt-1">
        {label}
      </div>
    </div>
  );
}

function MealLogButton({ meal, result }: { meal: MealType; result: ScanResult }) {
  return (
    <button
      onClick={() =>
        logMeal(meal, [
          {
            id: Date.now(),
            name: result.name,
            type: "veg",
            calories: result.calories,
            protein: result.protein,
            carbs: result.carbs,
            fat: result.fat,
            fiber: result.fiber,
            tags: [],
          },
        ])
      }
      className="py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 flex items-center justify-center gap-1.5 capitalize"
    >
      <Plus className="size-3.5" /> Log to {meal}
    </button>
  );
}
