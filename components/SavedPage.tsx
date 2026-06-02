"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Post } from "@/types/fetcher";
import { like, parseTags, resumeRec, unlike, type RecState } from "@/lib/recommendation";
import { loadLiked, saveLiked } from "@/lib/store/liked";
import { loadSaved, saveSaved } from "@/lib/store/saved";
import { bumpStat } from "@/lib/store/stats";
import { SavedPostDialog } from "./SavedPostDialog";

export function SavedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [sel, setSel] = useState<Post | null>(null);
  const [liked, setLiked] = useState<Set<number>>(() => loadLiked());
  const rec = useRef<RecState>(resumeRec());

  useEffect(() => setPosts(loadSaved()), []);

  const onLike = useCallback((p: Post) => {
    const tags = parseTags(p.tags);
    const s = liked;
    if (s.has(p.id)) {
      s.delete(p.id);
      unlike(rec.current, tags);
      bumpStat("liked", -1);
    } else {
      s.add(p.id);
      like(rec.current, tags);
      bumpStat("liked");
    }
    saveLiked(s);
    setLiked(new Set(s));
  }, [liked]);

  const onRemove = useCallback((p: Post) => {
    const next = loadSaved().filter((x) => x.id !== p.id);
    saveSaved(next);
    setPosts(next);
    setSel(null);
  }, []);

  return (
    <div className="saved-page h-full overflow-y-auto bg-black text-zinc-100">
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-black/95 px-6 py-4 backdrop-blur">
        <h1 className="text-xl font-semibold">Saved</h1>
        <p className="text-sm text-zinc-500">{posts.length} posts</p>
      </header>
      {!posts.length ? (
        <p className="px-6 py-16 text-center text-sm text-zinc-500">Save posts from the feed with the bookmark button.</p>
      ) : (
        <div className="saved-grid">
          {posts.map((p) => (
            <button
              key={p.id}
              type="button"
              className="saved-thumb group relative aspect-square overflow-hidden bg-zinc-900"
              onClick={() => setSel(p)}
            >
              <img
                className="h-full w-full object-cover transition group-hover:opacity-90"
                src={p.preview_url || p.sample_url || p.file_url}
                alt=""
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
      {sel && (
        <SavedPostDialog
          post={sel}
          liked={liked.has(sel.id)}
          onLike={() => onLike(sel)}
          onRemove={() => onRemove(sel)}
          onClose={() => setSel(null)}
        />
      )}
    </div>
  );
}
