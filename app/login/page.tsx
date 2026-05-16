"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth";
import { motion } from "framer-motion";
import Link from "next/link";
import { KeyRound } from "lucide-react";

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const r = await login(email, password);
    setSubmitting(false);
    if (r.ok) router.replace("/dashboard");
    else setError(r.error || "Sign in failed");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card-glass p-8 w-full max-w-md"
      >
        <h1 className="text-2xl font-semibold mb-6">Sign in</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--muted)] mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--muted)] mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              required
            />
          </div>
          {error && (
            <p className="text-sm text-[var(--negative)]">{error}</p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg bg-[var(--accent)] text-white font-medium hover:opacity-90 disabled:opacity-60 transition"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--card-border)]" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[var(--card-bg)] px-3 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
              Or continue with
            </span>
          </div>
        </div>
        <Link
          href="/login/lyrae"
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-3 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--accent)]/15"
        >
          <KeyRound className="h-5 w-5 text-[var(--accent)]" />
          Sign in with Lyrae Key
        </Link>
        <p className="mt-6 text-sm text-[var(--muted)] text-center">
          New here?{" "}
          <Link href="/register" className="text-[var(--accent)] hover:underline">
            Create account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
