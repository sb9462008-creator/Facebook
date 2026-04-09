"use client";

import { useOptimistic, useTransition, useRef } from "react";
import { toggleLikeAction } from "@/lib/actions";

type Props = {
  postId: string;
  initialLikes: number;
  initialLikedBy: string[];
  currentUserId: string;
};

export default function LikeButton({ postId, initialLikes, initialLikedBy, currentUserId }: Props) {
  const [optimisticState, setOptimistic] = useOptimistic(
    { likes: initialLikes, likedBy: initialLikedBy },
    (state, _: "toggle") => {
      const liked = state.likedBy.includes(currentUserId);
      return {
        likes: liked ? state.likes - 1 : state.likes + 1,
        likedBy: liked
          ? state.likedBy.filter((id) => id !== currentUserId)
          : [...state.likedBy, currentUserId],
      };
    }
  );
  const [, startTransition] = useTransition();
  const pendingRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isLiked = optimisticState.likedBy.includes(currentUserId);

  function handleLike() {
    if (pendingRef.current) return;
    pendingRef.current = true;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { pendingRef.current = false; }, 500);

    startTransition(async () => {
      setOptimistic("toggle");
      try {
        await toggleLikeAction(postId);
      } catch {}
    });
  }

  return (
    <button
      onClick={handleLike}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 select-none ${
        isLiked
          ? "bg-red-50 text-red-500 border border-red-200 hover:bg-red-100"
          : "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100"
      }`}
    >
      <span className={`text-lg transition-transform duration-150 ${isLiked ? "scale-125" : "scale-100"}`}>
        {isLiked ? "❤️" : "🤍"}
      </span>
      <span>{optimisticState.likes}</span>
    </button>
  );
}
