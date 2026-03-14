"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { MobileDrawer } from "./MobileDrawer";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, switchingAccount } = useAuth();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-[var(--background)] relative">
      {switchingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--background)]/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[var(--muted)]">Switching account...</p>
          </div>
        </div>
      )}
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header onOpenDrawer={() => setDrawerOpen(true)} />
        <main className="flex-1 p-4 md:p-6 overflow-auto pb-28 md:pb-6">{children}</main>
        <BottomNav />
      </div>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
