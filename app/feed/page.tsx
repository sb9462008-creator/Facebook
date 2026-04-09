import { getPosts, getPopularPosts } from "@/lib/store";
import { getSession } from "@/lib/session";
import { logoutAction } from "@/lib/actions";
import PostFeed from "@/components/PostFeed";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [latestPosts, popularPosts] = await Promise.all([
    getPosts(),
    getPopularPosts(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">✨ Content Hub</h1>
            <p className="text-gray-500 mt-1">Сайн байна уу, <span className="font-medium text-indigo-600">{session.username}</span>!</p>
          </div>
          <form action={logoutAction}>
            <button className="px-4 py-2 text-sm text-gray-500 hover:text-red-500 border border-gray-200 rounded-xl hover:border-red-200 transition-colors">
              Гарах
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-semibold text-gray-700 flex items-center gap-2">
              🕐 Сүүлийн нийтлэлүүд
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">SSR • Live</span>
            </h2>
            <PostFeed initialPosts={latestPosts} currentUserId={session.id} currentUsername={session.username} />
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                🔥 Trending
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">Cache 60s</span>
              </h3>
              {popularPosts.length === 0 ? (
                <p className="text-sm text-gray-400">Одоохондоо нийтлэл байхгүй</p>
              ) : (
                <div className="space-y-3">
                  {popularPosts.map((post, i) => (
                    <Link key={post.id} href={`/post/${post.id}`} className="flex items-start gap-3 group">
                      <span className="text-lg font-bold text-gray-200 group-hover:text-indigo-300 transition-colors">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors truncate">{post.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">❤️ {post.likes} · 👁 {post.views}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-5 text-white">
              <h3 className="font-semibold mb-3">📊 Статистик</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-indigo-200">Нийт нийтлэл</span>
                  <span className="font-bold">{latestPosts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-200">Нийт like</span>
                  <span className="font-bold">{latestPosts.reduce((s, p) => s + p.likes, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-200">Миний нийтлэл</span>
                  <span className="font-bold">{latestPosts.filter((p) => p.author_id === session.id).length}</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <h4 className="text-xs font-semibold text-amber-700 mb-2">🏗 Architecture</h4>
              <ul className="text-xs text-amber-600 space-y-1">
                <li>• DB → Supabase (PostgreSQL)</li>
                <li>• Cache → Upstash Redis</li>
                <li>• Popular posts → Cache 60s</li>
                <li>• Drafts → Redis 24h</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
