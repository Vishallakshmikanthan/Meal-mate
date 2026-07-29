import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { Camera, CameraOff, Loader2 } from "lucide-react";

interface Props {
  onResult: (text: string) => void;
}

/** Live camera QR scanner. Streams the rear camera and decodes QR codes in-browser. */
export function CameraQrScanner({ onResult }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [active, setActive] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => controlsRef.current?.stop();
  }, []);

  const stop = () => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setActive(false);
  };

  const start = async () => {
    setError("");
    setStarting(true);
    try {
      const reader = new BrowserQRCodeReader();
      const controls = await reader.decodeFromConstraints(
        { video: { facingMode: { ideal: "environment" } } },
        videoRef.current!,
        (result) => {
          if (!result) return;
          const text = result.getText();
          stop();
          onResult(extractToken(text));
        },
      );
      controlsRef.current = controls;
      setActive(true);
    } catch {
      setError("Camera unavailable. Allow camera access or enter the code manually.");
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-background border border-border">
        <video ref={videoRef} className="size-full object-cover" muted playsInline />
        {!active && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-6">
            <div className="size-14 rounded-2xl bg-[var(--leaf)]/15 text-primary flex items-center justify-center">
              <Camera className="size-6" />
            </div>
            <p className="text-sm text-muted-foreground">
              Point your camera at the counter QR code.
            </p>
          </div>
        )}
        {active && (
          <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-[var(--leaf)]/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.25)]" />
        )}
      </div>
      <button
        onClick={active ? stop : start}
        disabled={starting}
        className="w-full py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50 min-tap"
      >
        {starting ? (
          <><Loader2 className="size-4 animate-spin" /> Starting camera…</>
        ) : active ? (
          <><CameraOff className="size-4" /> Stop camera</>
        ) : (
          <><Camera className="size-4" /> Open camera</>
        )}
      </button>
      {error && <p className="text-[12px] text-destructive">{error}</p>}
    </div>
  );
}

/** QR payloads may be a full /collect?t=CODE URL or a bare token. */
function extractToken(text: string) {
  try {
    const url = new URL(text);
    return (url.searchParams.get("t") || text).toUpperCase();
  } catch {
    return text.trim().toUpperCase();
  }
}
