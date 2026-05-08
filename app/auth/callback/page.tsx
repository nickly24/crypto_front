"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth";

function parseHash(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams();
  return new URLSearchParams(window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "");
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const { loginWithAccessToken } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function complete() {
      const params = parseHash();
      const token = params.get("token");
      const next = params.get("next") || "/dashboard";
      const providerError = params.get("error");

      if (providerError) {
        if (!cancelled) setError(providerError);
        return;
      }
      if (!token) {
        if (!cancelled) setError("Authentication token is missing");
        return;
      }

      const r = await loginWithAccessToken(token);
      if (cancelled) return;
      if (!r.ok) {
        setError(r.error || "Authentication failed");
        return;
      }
      router.replace(next);
    }

    complete();
    return () => {
      cancelled = true;
    };
  }, [loginWithAccessToken, router]);

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      <div className="card-glass p-8 w-full max-w-md text-center">
        {error ? (
          <>
            <h1 className="text-2xl font-semibold mb-3">Authentication failed</h1>
            <p className="text-sm text-[var(--negative)]">{error}</p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 h-8 w-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
            <h1 className="text-2xl font-semibold mb-3">Finishing sign-in</h1>
            <p className="text-sm text-[var(--muted)]">Please wait while we connect your account.</p>
          </>
        )}
      </div>
    </div>
  );
}
