"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { getTelegramAuthUrl, loginWithGoogleCredential } from "@/lib/api";
import { useAuth } from "@/providers/auth";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

type Props = {
  mode: "login" | "register";
  nextPath?: string;
};

export function SocialAuthButtons({ mode, nextPath = "/dashboard" }: Props) {
  const router = useRouter();
  const { loginWithAccessToken } = useAuth();
  const [error, setError] = useState("");
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogle(credential: string) {
    setError("");
    setGoogleLoading(true);
    const r = await loginWithGoogleCredential(credential);
    setGoogleLoading(false);
    if (!r.ok || !r.data?.access_token) {
      setError(r.error || "Google sign-in failed");
      return;
    }
    const auth = await loginWithAccessToken(r.data.access_token);
    if (!auth.ok) {
      setError(auth.error || "Google sign-in failed");
      return;
    }
    router.replace(nextPath);
  }

  async function handleTelegram() {
    setError("");
    setTelegramLoading(true);
    const r = await getTelegramAuthUrl(nextPath);
    setTelegramLoading(false);
    if (!r.ok || !r.data?.auth_url) {
      setError(r.error || "Telegram sign-in failed");
      return;
    }
    window.location.href = r.data.auth_url;
  }

  return (
    <div className="space-y-3">
      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--card-border)]" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[var(--card-bg)] px-3 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
            {mode === "register" ? "Create account with" : "Or continue with"}
          </span>
        </div>
      </div>

      <div className="flex justify-center">
        <GoogleSignInButton onCredential={handleGoogle} disabled={googleLoading || telegramLoading} />
      </div>

      <button
        type="button"
        onClick={handleTelegram}
        disabled={telegramLoading || googleLoading}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--card-border)] bg-[#229ED9] px-4 py-3 text-sm font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <MessageCircle className="h-5 w-5" />
        {telegramLoading ? "Opening Telegram..." : "Continue with Telegram"}
      </button>

      {error && <p className="text-sm text-[var(--negative)]">{error}</p>}
    </div>
  );
}
