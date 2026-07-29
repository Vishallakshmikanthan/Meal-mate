import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, ImagePlus, Loader2, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { identifyAndGetNutrition, type ScanResult } from "@/lib/foodScanner";
import { addScanToHistory, getScanHistory, logMeal, type ScanHistoryEntry } from "@/lib/storage";
import type { MealType } from "@/lib/menuData";

/** In-browser AI food scanner: live camera capture or gallery upload + nutrition estimate. */
export function FoodScanPanel({ defaultMeal = "lunch" }: { defaultMeal?: MealType }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [live, setLive] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<ScanHistoryEntry[]>([]);

  useEffect(() => {
    const refresh = () => setHistory(getScanHistory().slice(0, 4));
    refresh();
    window.addEventListener("mealops:update", refresh);
    return () => {
      window.removeEventListener("mealops:update", refresh);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setLive(false);
  };

  const startCamera = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
      });
      streamRef.current = stream;
      setLive(true);
      setImage(null);
      setResult(null);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      });
    } catch {
      setError("Camera unavailable. Upload a photo instead.");
    }
  };

  const capture = () => {
    const v = videoRef.current;
    if (!v) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth || 640;
    canvas.height = v.videoHeight || 480;
    canvas.getContext("2d")?.drawImage(v, 0, 0, canvas.width, canvas.height);
    setImage(canvas.toDataURL("image/jpeg", 0.9));
    setResult(null);
    stopCamera();
  };

  const onFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      stopCamera();
      setImage(ev.target?.result as string);
      setResult(null);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const identify = async () => {
    if (!imgRef.current) return;
    setLoading(true);
    setError("");
    try {
      if (!imgRef.current.complete) {
        await new Promise((r) => {
          imgRef.current!.onload = r;
        });
      }
      const r = await identifyAndGetNutrition(imgRef.current);
      setResult(r);
      addScanToHistory({
        name: r.name,
        source: r.source,
        calories: r.calories,
        protein: r.protein,
        carbs: r.carbs,
        fat: r.fat,
        fiber: r.fiber,
        confidence: r.confidence,
        thumbnail: image ?? undefined,
      });
      toast.success(`Identified: ${r.name}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not identify the food.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const log = (meal: MealType) => {
    if (!result) return;
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
    ]);
    toast.success(`Logged ${result.name} to ${meal}`);
  };

  return (
    <div className="space-y-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-background border border-border flex items-center justify-center">
        {live ? (
          <video ref={videoRef} className="size-full object-cover" muted playsInline />
        ) : image ? (
          <img
            ref={imgRef}
            src={image}
            alt="Plate to scan"
            crossOrigin="anonymous"
            className="size-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-center px-6">
            <div className="size-14 rounded-2xl bg-[var(--leaf)]/15 text-primary flex items-center justify-center">
              <Sparkles className="size-6" />
            </div>
            <p className="text-sm text-muted-foreground">
              Snap your plate — MobileNet runs on-device, nothing is uploaded.
            </p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />

      <div className="grid grid-cols-2 gap-2.5">
        {live ? (
          <>
            <button
              onClick={capture}
              className="py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center justify-center gap-2 min-tap"
            >
              <Camera className="size-4" /> Capture
            </button>
            <button
              onClick={stopCamera}
              className="py-3 rounded-2xl bg-secondary text-secondary-foreground text-sm font-semibold inline-flex items-center justify-center gap-2 min-tap"
            >
              <CameraOff className="size-4" /> Stop
            </button>
          </>
        ) : (
          <>
            <button
              onClick={startCamera}
              className="py-3 rounded-2xl bg-secondary text-secondary-foreground text-sm font-semibold inline-flex items-center justify-center gap-2 min-tap"
            >
              <Camera className="size-4" /> Camera
            </button>
            <button
              onClick={() => inputRef.current?.click()}
              className="py-3 rounded-2xl bg-secondary text-secondary-foreground text-sm font-semibold inline-flex items-center justify-center gap-2 min-tap"
            >
              <ImagePlus className="size-4" /> Upload
            </button>
          </>
        )}
      </div>

      {!live && image && (
        <button
          onClick={identify}
          disabled={loading}
          className="w-full py-3 rounded-2xl leaf-gradient text-primary-foreground text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50 min-tap"
        >
          {loading ? (
            <><Loader2 className="size-4 animate-spin" /> Identifying…</>
          ) : (
            <><Sparkles className="size-4" /> Identify nutrition</>
          )}
        </button>
      )}
      {loading && (
        <p className="text-[11px] text-muted-foreground text-center">
          First scan downloads the model (~16MB), then it's instant.
        </p>
      )}
      {error && <p className="text-[12px] text-destructive">{error}</p>}

      {result && (
        <div className="rounded-2xl bg-card border border-border p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Identified as
          </div>
          <div className="font-display text-2xl capitalize mt-0.5">{result.name}</div>
          {typeof result.confidence === "number" && (
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
              {Math.round(result.confidence * 100)}% match · {result.source}
            </div>
          )}
          <div className="grid grid-cols-5 gap-2 mt-3">
            <Stat label="kcal" value={result.calories} accent />
            <Stat label="P" value={`${result.protein}g`} />
            <Stat label="C" value={`${result.carbs}g`} />
            <Stat label="F" value={`${result.fat}g`} />
            <Stat label="Fib" value={`${result.fiber}g`} />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <button
              onClick={() => log(defaultMeal)}
              className="py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center justify-center gap-1.5 capitalize min-tap"
            >
              <Plus className="size-4" /> Log to {defaultMeal}
            </button>
            <button
              onClick={() => log("dinner")}
              className="py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold inline-flex items-center justify-center gap-1.5 min-tap"
            >
              <Plus className="size-4" /> Log to dinner
            </button>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="rounded-2xl bg-card border border-border p-4">
          <h3 className="font-display text-lg mb-2">Recent scans</h3>
          <ul className="space-y-2">
            {history.map((h) => (
              <li key={h.id} className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-secondary overflow-hidden flex items-center justify-center shrink-0">
                  {h.thumbnail ? (
                    <img src={h.thumbnail} alt={h.name} className="size-full object-cover" />
                  ) : (
                    <Sparkles className="size-4 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold capitalize truncate">{h.name}</div>
                  <div className="text-[11px] text-muted-foreground tabular-nums">
                    {h.calories} kcal · P {h.protein}g · C {h.carbs}g
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
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
    <div className={`rounded-xl py-2.5 text-center ${accent ? "bg-[var(--leaf)]/20" : "bg-secondary"}`}>
      <div className="font-display text-base leading-none tabular-nums">{value}</div>
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
