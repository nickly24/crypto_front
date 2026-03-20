"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function ChartRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get("mode") === "instruments" ? "instruments" : "spread";
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (redirectedRef.current) return;
    redirectedRef.current = true;
    router.replace(`/trading?mode=${mode}`);
  }, [router, mode]);

  return (
    <div className="min-h-screen flex items-center justify-center text-[var(--muted)]">
      Redirecting to Trading...
    </div>
  );
}

export default function ChartPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[var(--muted)]">Loading...</div>}>
      <ChartRedirect />
    </Suspense>
  );
}
