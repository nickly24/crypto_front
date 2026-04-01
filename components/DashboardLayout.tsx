"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth";
import { isExpired } from "@/lib/subscription";
import { SubscriptionModalProvider } from "@/providers/subscription-modal";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { MobileDrawer } from "./MobileDrawer";
import { SubscriptionModal } from "./SubscriptionModal";
import { AprilFoolsModal } from "./AprilFoolsModal";
import { AlertTriangle, Zap } from "lucide-react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, switchingAccount } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);

  useEffect(() => {
    if (loading || user) return;
    if (pathname === "/login" || pathname.startsWith("/login")) return;
    router.replace("/login");
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const subscriptionExpired = isExpired(user?.subscription_ends_at);

  return (
    <SubscriptionModalProvider onOpenChange={setSubscriptionModalOpen}>
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
        <Header onOpenDrawer={() => setDrawerOpen(true)} onOpenSubscription={() => setSubscriptionModalOpen(true)} />
        <main className="flex-1 p-4 md:p-6 overflow-auto pb-28 md:pb-6">
          {subscriptionExpired ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 text-amber-500 mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">Subscription expired</h2>
              <p className="text-[var(--muted)] max-w-md mb-6">Your subscription has ended. Renew to access the dashboard, analytics, trading history, and all features.</p>
              <button
                onClick={() => setSubscriptionModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 transition"
              >
                <Zap className="w-5 h-5" />
                <span className="font-medium">Renew subscription</span>
              </button>
            </div>
          ) : (
            <>
              <AprilFoolsModal />
              {children}
            </>
          )}
        </main>
        <BottomNav />
      </div>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <SubscriptionModal open={subscriptionModalOpen} onClose={() => setSubscriptionModalOpen(false)} />
    </div>
    </SubscriptionModalProvider>
  );
}
