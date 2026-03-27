"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth";
import { LandingHeader } from "@/components/LandingHeader";
import { LandingHero } from "@/components/LandingHero";
import { LandingContent } from "@/components/LandingContent";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (user) router.replace("/dashboard");
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-[var(--background)] bg-mesh">
      <LandingHeader />
      <LandingHero />
      <LandingContent />
    </div>
  );
}
