"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card-glass p-8 w-full max-w-md"
      >
        <h1 className="text-2xl font-semibold mb-2">Create account</h1>
        <p className="text-sm text-[var(--muted)]">
          Account creation is temporarily unavailable.
        </p>

        <p className="mt-6 text-sm text-[var(--muted)] text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--accent)] hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
