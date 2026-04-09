"use client";

import { useOptimistic, useState, useTransition } from "react";
import { addCommentAction } from "@/lib/actions";
import { Comment } from "@/lib/store";

type Props = {
  postId: string;
  initialComments: Comment[];
  currentUserId: string;
  currentUsername: string;
};

export default function CommentSection({ postId, initialComments, currentUserId, currentUsername }: Props) {
  const [comments, setOptimisticComments] = useOptimistic(initialComments);
  const [, startTransition] = useTransition();
  const [text, setText] = useState("");
  const [failedComment, setFailedComment] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submitComment(commentText: string) {
    if (!commentText.trim()) return;

    const optimistic: Comment = {
      id: `temp-${Date.now()}`,
      post_id: postId,
      author: currentUsername,
      author_id: currentUserId,
      text: commentText,
      created_at: Date.now(),
    };

    setError(null);
    setFailedComment(null);
    setText("");

    startTransition(async () => {
      setOptimisticComments((prev) => [...prev, optimistic]);
      try {
        await addCommentAction(postId, commentText);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Алдаа гарлаа");
        setFailedComment(commentText);
      }
    });
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
        💬 Сэтгэгдэл
        <span className="text-sm font-normal text-gray-400">({comments.length})</span>
      </h3>

      <div className="space-y-3">
        {comments.map((comment) => {
          const isOptimistic = comment.id.startsWith("temp-");
          return (
            <div key={comment.id} className={`flex gap-3 transition-all duration-300 ${isOptimistic ? "opacity-60" : "opacity-100"}`}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {comment.author[0].toUpperCase()}
              </div>
              <div className="flex-1 bg-gray-50 rounded-xl px-4 py-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-700">{comment.author}</span>
                  {comment.author_id === currentUserId && (
                    <span className="text-xs text-indigo-400">Та</span>
                  )}
                  {isOptimistic && <span className="text-xs text-gray-400 animate-pulse">Илгээж байна...</span>}
                </div>
                <p className="text-sm text-gray-600">{comment.text}</p>
              </div>
            </div>
          );
        })}
      </div>

      {error && failedComment && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-red-600">❌ {error}</span>
          <button onClick={() => submitComment(failedComment)} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium ml-3">
            🔄 Дахин оролдох
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {currentUsername[0].toUpperCase()}
        </div>
        <div className="flex-1 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitComment(text); } }}
            placeholder="Сэтгэгдэл бичнэ үү... (Enter)"
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
          />
          <button
            onClick={() => submitComment(text)}
            disabled={!text.trim()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Илгээх
          </button>
        </div>
      </div>
    </div>
  );
}
