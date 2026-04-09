"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPostAction } from "@/lib/actions";
import { Post } from "@/lib/store";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  initialPosts: Post[];
  currentUserId: string;
  currentUsername: string;
};

export default function PostFeed({ initialPosts, currentUserId, currentUsername }: Props) {
  const [pendingPost, setPendingPost] = useState<Post | null>(null);
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const prevCountRef = useRef(initialPosts.length);

  useEffect(() => {
    if (initialPosts.length > prevCountRef.current) {
      setPendingPost(null);
    }
    prevCountRef.current = initialPosts.length;
  }, [initialPosts]);

  async function handleSubmit(formData: FormData) {
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    if (!title?.trim() || !content?.trim()) return;

    const snapshot = new FormData();
    snapshot.append("title", title);
    snapshot.append("content", content);

    setPendingPost({
      id: `temp-${Date.now()}`,
      title,
      content,
      author: currentUsername,
      author_id: currentUserId,
      likes: 0,
      liked_by: [],
      viewed_by: [],
      created_at: Date.now(),
      views: 0,
    });

    setError(null);
    formRef.current?.reset();
    setShowForm(false);

    startTransition(async () => {
      try {
        await createPostAction(snapshot);
        router.refresh();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Алдаа гарлаа");
        setPendingPost(null);
      }
    });
  }

  const allPosts: Post[] = pendingPost ? [pendingPost, ...initialPosts] : initialPosts;

  return (
    <div className="space-y-4">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-200"
        >
          <span>✍️</span> Шинэ нийтлэл бичих
        </button>
      ) : (
        <form ref={formRef} action={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 space-y-3">
          <input name="title" placeholder="Гарчиг..." required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800 font-medium" />
          <textarea name="content" placeholder="Агуулга бичнэ үү..." required rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700 resize-none" />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors">⚡ Нийтлэх</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors">Болих</button>
          </div>
        </form>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between">
          <span>❌ {error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-2">✕</button>
        </div>
      )}

      <div className="space-y-3">
        {allPosts.map((post) => {
          const isOptimistic = post.id.startsWith("temp-");
          const isOwner = post.author_id === currentUserId;
          return isOptimistic ? (
            <div key={post.id} className="bg-indigo-50/50 rounded-2xl border border-indigo-200 p-5 opacity-75">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  {post.author[0].toUpperCase()}
                </span>
                <span className="text-sm text-gray-500">{post.author}</span>
                <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full animate-pulse">Хадгалж байна...</span>
              </div>
              <h3 className="font-semibold text-gray-900 truncate">{post.title}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.content}</p>
            </div>
          ) : (
            <Link key={post.id} href={`/post/${post.id}`} className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  {post.author[0].toUpperCase()}
                </span>
                <span className="text-sm text-gray-500">{post.author}</span>
                {isOwner && <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">Миний</span>}
              </div>
              <h3 className="font-semibold text-gray-900 truncate">{post.title}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.content}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                <span>❤️ {post.likes}</span>
                <span>👁 {post.views}</span>
                <span>{new Date(post.created_at).toISOString().slice(0, 10)}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
