"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/auth";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function AddAccountPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const r = await login(email, password, true);
    setSubmitting(false);
    if (r.ok) router.replace("/dashboard");
    else setError(r.error || "Sign in failed");
  }

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card-glass p-8 w-full max-w-md"
      >
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>
        <h1 className="text-2xl font-semibold mb-2">Add account</h1>
        <p className="text-sm text-[var(--muted)] mb-6">Sign in with another account to switch between them</p>
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
            {submitting ? "Adding account..." : "Add account"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
