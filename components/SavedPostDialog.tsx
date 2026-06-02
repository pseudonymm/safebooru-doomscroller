"use client";

import { useEffect } from "react";
import { ExternalLink, Heart, Trash2, X } from "lucide-react";
import type { Post } from "@/types/fetcher";

type Props = {
  post: Post;
  liked: boolean;
  onLike: () => void;
  onRemove: () => void;
  onClose: () => void;
};

export function SavedPostDialog({ post, liked, onLike, onRemove, onClose }: Props) {
  const src = post.sample_url || post.file_url;
  const orig = post.file_url || post.sample_url;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="saved-dialog fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={onClose}>
      <div
        className="relative max-h-[92vh] max-w-[min(96vw,56rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close"
          className="absolute -top-10 right-0 rounded-lg p-1.5 text-zinc-400 hover:text-white"
          onClick={onClose}
        >
          <X size={22} />
        </button>
        <div className="relative overflow-hidden rounded-xl bg-zinc-950">
          <img className="max-h-[80vh] max-w-full object-contain" src={src} alt="" />
          <button
            type="button"
            aria-label={liked ? "Unlike" : "Like"}
            className={`absolute top-4 right-4 flex h-12 w-12 items-center justify-center rounded-full backdrop-blur ${
              liked ? "bg-rose-500/90 text-white" : "bg-black/50 text-white hover:bg-black/70"
            }`}
            onClick={onLike}
          >
            <Heart className={`h-6 w-6 ${liked ? "fill-current" : ""}`} />
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={orig}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-700"
          >
            <ExternalLink size={14} />
            Full image
          </a>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-sm text-rose-400 hover:bg-zinc-800"
            onClick={onRemove}
          >
            <Trash2 size={14} />
            Remove saved
          </button>
        </div>
      </div>
    </div>
  );
}
