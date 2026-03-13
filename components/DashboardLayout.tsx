"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth";
import { Header } from "./Header";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const redirectingRef = useRef(false);

  useEffect(() => {
    if (loading || user) return;
    if (redirectingRef.current) return;
    redirectingRef.current = true;
    router.replace("/login");
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-mesh flex flex-col">
      <Header />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
