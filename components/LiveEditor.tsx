"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { saveDraftAction } from "@/lib/actions";

type SaveStatus = "idle" | "saving" | "saved" | "error";

type Props = {
  postId: string;
  initialContent: string;
};

export default function LiveEditor({ postId, initialContent }: Props) {
  const [content, setContent] = useState(initialContent);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (content === initialContent) return;

    setStatus("saving");
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        try {
          await saveDraftAction(postId, content);
          setStatus("saved");
          setTimeout(() => setStatus("idle"), 2000);
        } catch {
          setStatus("error");
        }
      });
    }, 800);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [content, postId, initialContent]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700"> Агуулга засах</label>
        <SaveIndicator status={status} />
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={6}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700 resize-none transition-colors"
        placeholder="Агуулга бичнэ үү..."
      />
    </div>
  );
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;

  const config = {
    saving: { text: "Хадгалж байна...", cls: "text-gray-400", dot: "animate-pulse bg-gray-400" },
    saved: { text: "Хадгалагдлаа ✓", cls: "text-emerald-600", dot: "bg-emerald-500" },
    error: { text: "Алдаа гарлаа", cls: "text-red-500", dot: "bg-red-500" },
  }[status];

  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium ${config.cls} transition-all duration-300`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.text}
    </div>
  );
}
