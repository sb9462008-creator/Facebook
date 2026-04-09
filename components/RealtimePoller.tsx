"use client";

import { useEffect, useState } from "react";

type Props = {
  postId: string;
  interval?: number;
};

export default function RealtimePoller({ postId, interval = 5000 }: Props) {
  const [newCount, setNewCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/poll?postId=${postId}&t=${Date.now()}`);
        const data = await res.json();
        if (data.newComments > 0) {
          setNewCount((prev) => prev + data.newComments);
        }
      } catch {
        // silent fail
      }
    }, interval);

    return () => clearInterval(timer);
  }, [postId, interval]);

  if (newCount === 0) return null;

  return (
    <button
      onClick={() => {
        setNewCount(0);
        window.location.reload();
      }}
      className="w-full py-2.5 mb-4 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors"
    >
      🔔 {newCount} шинэ сэтгэгдэл байна — харах
    </button>
  );
}
