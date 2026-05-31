"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import type { Post } from "@/types/fetcher";
import { loadSaved } from "@/lib/store/saved";

export function SavedPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    setPosts(loadSaved());
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
            <a
              key={p.id}
              href={p.file_url || p.sample_url}
              target="_blank"
              rel="noopener noreferrer"
              className="saved-thumb group relative aspect-square overflow-hidden bg-zinc-900"
            >
              <img
                className="h-full w-full object-cover transition group-hover:opacity-90"
                src={p.preview_url || p.sample_url || p.file_url}
                alt=""
                loading="lazy"
              />
              <span className="absolute top-2 right-2 rounded-md bg-black/60 p-1 opacity-0 transition group-hover:opacity-100">
                <ExternalLink size={14} />
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
