import { getComments, getDraft, getPostById } from "@/lib/store";
import { getSession } from "@/lib/session";
import CommentSection from "@/components/CommentSection";
import LikeButton from "@/components/LikeButton";
import LiveEditor from "@/components/LiveEditor";
import RealtimePoller from "@/components/RealtimePoller";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function PostPage({ params }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  const isOwner = post.author_id === session.id;
  if (!isOwner) await getPostById(id, session.id);

  const [comments, draft] = await Promise.all([
    getComments(id),
    getDraft(id),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/feed" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
          ← Feed руу буцах
        </Link>

        <article className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
              {post.author[0].toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-800">{post.author}</p>
              <p className="text-xs text-gray-400">{new Date(post.created_at).toISOString().slice(0, 10)}</p>
            </div>
            {isOwner && (
              <span className="ml-auto text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">
                ✏️ Миний нийтлэл
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">{post.title}</h1>
          <p className="text-gray-600 leading-relaxed">{post.content}</p>

          <div className="flex items-center gap-3 mt-5 pt-5 border-t border-gray-100">
            <LikeButton
              postId={post.id}
              initialLikes={post.likes}
              initialLikedBy={post.liked_by}
              currentUserId={session.id}
            />
            <span className="text-sm text-gray-400">👁 {post.views} үзэлт</span>
          </div>
        </article>

        {isOwner && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-semibold text-gray-800">✏️ Засварлах</h2>
              {draft && (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                  Draft хадгалагдсан
                </span>
              )}
            </div>
            <LiveEditor postId={post.id} initialContent={draft?.content ?? post.content} />
            <p className="text-xs text-gray-400 mt-2">💡 Автоматаар хадгалагдана</p>
          </div>
        )}

        <RealtimePoller postId={post.id} interval={5000} />

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <CommentSection
            postId={post.id}
            initialComments={comments}
            currentUserId={session.id}
            currentUsername={session.username}
          />
        </div>
      </div>
    </div>
  );
}
