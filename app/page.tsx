import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="text-6xl mb-6">✨</div>
        <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
          Content Hub
        </h1>
        <p className="text-indigo-300 text-lg mb-2">
          AI Content Collaboration Platform
        </p>
        <p className="text-indigo-400 text-sm mb-10">
          Optimistic UX · Server-first · Real-time feel
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <Link
            href="/register"
            className="px-8 py-3.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5"
          >
            🚀 Бүртгүүлэх
          </Link>
          <Link
            href="/login"
            className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all duration-200 backdrop-blur-sm border border-white/20"
          >
            Нэвтрэх
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
          {[
            { icon: "⚡", title: "Instant Post", desc: "Optimistic create + rollback" },
            { icon: "💬", title: "Live Comments", desc: "Optimistic + retry on fail" },
            { icon: "❤️", title: "Like System", desc: "Debounced spam protection" },
            { icon: "📝", title: "Auto-save Draft", desc: "No save button needed" },
            { icon: "🔄", title: "Fake Realtime", desc: "Polling every 5s" },
            { icon: "🏗", title: "SSR + Cache", desc: "Hybrid feed strategy" },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm"
            >
              <div className="text-xl mb-1">{f.icon}</div>
              <div className="text-white text-sm font-medium">{f.title}</div>
              <div className="text-indigo-400 text-xs mt-0.5">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
