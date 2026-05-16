"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, Keyboard, ScanLine } from "lucide-react";
import { loginWithLyraeKey } from "@/lib/api";
import { useAuth } from "@/providers/auth";

type BarcodeDetectorLike = {
  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>>;
};

type BarcodeDetectorCtor = new (options?: { formats?: string[] }) => BarcodeDetectorLike;

export default function LyraeLoginPage() {
  const router = useRouter();
  const { loginWithAccessToken } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<number | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualKey, setManualKey] = useState("");
  const [status, setStatus] = useState<"idle" | "starting" | "scanning" | "unsupported" | "authorizing">("idle");
  const [error, setError] = useState("");

  async function authorize(key: string) {
    if (status === "authorizing") return;
    setStatus("authorizing");
    setError("");
    const r = await loginWithLyraeKey(key.trim());
    if (!r.ok || !r.data?.access_token) {
      setStatus(manualMode ? "idle" : "scanning");
      setError(r.error || "Lyrae Key sign-in failed");
      return;
    }
    const auth = await loginWithAccessToken(r.data.access_token);
    if (!auth.ok) {
      setStatus(manualMode ? "idle" : "scanning");
      setError(auth.error || "Lyrae Key sign-in failed");
      return;
    }
    router.replace("/dashboard");
  }

  async function startScanner() {
    setError("");
    setManualMode(false);
    setStatus("starting");
    try {
      const BarcodeDetector = (window as Window & { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
      if (!BarcodeDetector) {
        setStatus("unsupported");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      streamRef.current = stream;
      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      const detector = new BarcodeDetector({ formats: ["qr_code"] });
      setStatus("scanning");
      scanTimerRef.current = window.setInterval(async () => {
        if (!videoRef.current || status === "authorizing") return;
        const codes = await detector.detect(videoRef.current).catch(() => []);
        const value = codes[0]?.rawValue;
        if (value?.startsWith("lyrae_")) {
          stopScanner();
          await authorize(value);
        }
      }, 450);
    } catch {
      setStatus("idle");
      setError("Camera access is unavailable. You can enter the key manually.");
    }
  }

  function stopScanner() {
    if (scanTimerRef.current) window.clearInterval(scanTimerRef.current);
    scanTimerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  useEffect(() => () => stopScanner(), []);

  async function handleManualSubmit(e: FormEvent) {
    e.preventDefault();
    await authorize(manualKey);
  }

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      <div className="card-glass w-full max-w-md p-6 md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)]">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Lyrae Key</h1>
            <p className="text-sm text-[var(--muted)]">Sign in with your access card</p>
          </div>
        </div>

        {!manualMode ? (
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-[var(--card-border)] bg-black/80">
              <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
              <div className="pointer-events-none absolute inset-8 rounded-3xl border-2 border-white/70">
                <span className="absolute -left-px -top-px h-8 w-8 rounded-tl-3xl border-l-4 border-t-4 border-[var(--accent)]" />
                <span className="absolute -right-px -top-px h-8 w-8 rounded-tr-3xl border-r-4 border-t-4 border-[var(--accent)]" />
                <span className="absolute -bottom-px -left-px h-8 w-8 rounded-bl-3xl border-b-4 border-l-4 border-[var(--accent)]" />
                <span className="absolute -bottom-px -right-px h-8 w-8 rounded-br-3xl border-b-4 border-r-4 border-[var(--accent)]" />
              </div>
              {status !== "scanning" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/55 px-6 text-center text-white">
                  <ScanLine className="h-8 w-8" />
                  <p className="text-sm">Bring the Lyrae Key QR into the frame</p>
                </div>
              )}
            </div>
            {status === "unsupported" ? (
              <p className="text-sm text-[var(--muted)]">This browser cannot scan QR codes directly yet.</p>
            ) : (
              <button onClick={startScanner} className="w-full rounded-xl bg-[var(--accent)] px-4 py-3 font-medium text-white hover:opacity-90">
                {status === "starting" ? "Opening camera..." : status === "scanning" ? "Scanning..." : "Open camera"}
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <input
              value={manualKey}
              onChange={(e) => setManualKey(e.target.value)}
              placeholder="lyrae_..."
              className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--accent)]"
              required
            />
            <button className="w-full rounded-xl bg-[var(--accent)] px-4 py-3 font-medium text-white hover:opacity-90">
              {status === "authorizing" ? "Signing in..." : "Sign in"}
            </button>
          </form>
        )}

        {error && <p className="mt-4 text-sm text-[var(--negative)]">{error}</p>}

        <div className="mt-5 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => {
              stopScanner();
              setManualMode((v) => !v);
              setStatus("idle");
            }}
            className="inline-flex items-center gap-2 text-[var(--accent)] hover:underline"
          >
            <Keyboard className="h-4 w-4" />
            {manualMode ? "Use camera" : "Enter manually"}
          </button>
          <Link href="/login" className="text-[var(--muted)] hover:text-[var(--foreground)]">
            Back
          </Link>
        </div>
      </div>
    </div>
  );
}
