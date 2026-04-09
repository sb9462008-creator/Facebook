"use client";

import { useState } from "react";
import { loginAction } from "@/lib/actions";
import Link from "next/link";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      await loginAction(fd);
    } catch (err: unknown) {
      if (err instanceof Error && !err.message.includes("NEXT_REDIRECT")) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">✨</div>
          <h1 className="text-2xl font-bold text-white">Нэвтрэх</h1>
          <p className="text-indigo-400 text-sm mt-1">Content Hub</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-sm text-indigo-200 mb-1 block">Хэрэглэгчийн нэр</label>
            <input
              name="username"
              required
              placeholder="username"
              className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="text-sm text-indigo-200 mb-1 block">Нууц үг</label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-400/30 text-red-300 text-sm px-4 py-2.5 rounded-xl">
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors"
          >
            {loading ? "Нэвтэрч байна..." : "Нэвтрэх"}
          </button>

          <p className="text-center text-sm text-indigo-300">
            Бүртгэлгүй юу?{" "}
            <Link href="/register" className="text-white font-medium hover:underline">
              Бүртгүүлэх
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
