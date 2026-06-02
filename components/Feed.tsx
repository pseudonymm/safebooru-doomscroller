"use client";

import { useCallback, useEffect, useRef } from "react";
import { RotateCcw } from "lucide-react";
import type { Post } from "@/types/fetcher";
import { isNerd } from "@/lib/nerd";
import { scorePost } from "@/lib/postScorer";
import { parseTags, resumeRec } from "@/lib/recommendation";
import { log } from "@/lib/log";
import { TagSearchBar } from "./TagSearchBar";
import { FeedControls } from "./FeedControls";
import { FeedItem } from "./FeedItem";
import { FeedSkeleton } from "./FeedSkeleton";

const L = log("feed-ui");

type Props = {
  posts: Post[];
  idx: number;
  liked: Set<number>;
  saved: Set<number>;
  loading: boolean;
  searchError: string | null;
  setActive: (i: number) => void;
  onLike: (p: Post) => void;
  onSave: (p: Post) => void;
  onRefresh: () => void;
};

export function Feed({ posts, idx, liked, saved, loading, searchError, setActive, onLike, onSave, onRefresh }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const scrollLock = useRef(false);
  const needScroll = useRef(true);
  const skeleton = !posts.length && loading && !searchError;
  const empty = !posts.length && !loading && searchError;
  const nerd = isNerd();

  const snapTo = useCallback(
    (i: number) => {
      const el = scroller.current;
      if (!el || skeleton || i < 0 || i >= posts.length) return;
      scrollLock.current = true;
      el.scrollTo({ top: i * el.clientHeight, behavior: "smooth" });
      setActive(i);
      setTimeout(() => (scrollLock.current = false), 400);
    },
    [posts.length, setActive, skeleton]
  );

  useEffect(() => {
    if (!posts.length) needScroll.current = true;
  }, [posts.length]);

  useEffect(() => {
    if (skeleton || !posts.length || !needScroll.current) return;
    const el = scroller.current;
    if (!el) return;
    needScroll.current = false;
    scrollLock.current = true;
    el.scrollTop = idx * el.clientHeight;
    requestAnimationFrame(() => (scrollLock.current = false));
  }, [skeleton, posts.length, idx]);

  const onScroll = () => {
    const el = scroller.current;
    if (!el || scrollLock.current || skeleton) return;
    const i = Math.round(el.scrollTop / el.clientHeight);
    if (i !== idx) {
      L.debug("scroll", { i, idx });
      setActive(i);
    }
  };

  const cur = posts[idx];

  return (
    <div className="feed-layout h-screen w-full bg-black">
      <header className="feed-header z-20 flex shrink-0 items-center gap-2 border-b border-zinc-800/80 bg-zinc-950/95 px-3 py-2 backdrop-blur">
        <div className="min-w-0 flex-1">
          <TagSearchBar compact loading={loading} />
        </div>
        <button
          type="button"
          aria-label="Refresh feed"
          title="Refresh feed"
          disabled={loading}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
          onClick={onRefresh}
        >
          <RotateCcw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </header>
      <div className="feed-shell relative min-h-0 flex-1">
        <div ref={scroller} className="feed-scroller h-full w-full" onScroll={onScroll}>
          {empty ? (
            <div className="feed-slide flex h-full w-full shrink-0 items-center justify-center px-8">
              <p className="max-w-md text-center text-sm text-zinc-400">{searchError}</p>
            </div>
          ) : skeleton ? (
            <>
              <div className="feed-slide h-full w-full shrink-0">
                <FeedSkeleton />
              </div>
              <div className="feed-slide h-full w-full shrink-0">
                <FeedSkeleton />
              </div>
            </>
          ) : (
            posts.map((p) => (
              <div key={p.id} className="feed-slide h-full w-full shrink-0">
                <FeedItem
                  post={p}
                  liked={liked.has(p.id)}
                  saved={saved.has(p.id)}
                  onLike={() => onLike(p)}
                  onSave={() => onSave(p)}
                />
              </div>
            ))
          )}
        </div>
        {!skeleton && (
          <FeedControls
            idx={idx}
            total={posts.length}
            onPrev={() => snapTo(idx - 1)}
            onNext={() => snapTo(idx + 1)}
          />
        )}
        {loading && posts.length > 0 && (
          <div className="pointer-events-none absolute top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-zinc-900/90 px-3 py-1 text-xs text-zinc-300">
            Loading…
          </div>
        )}
        {nerd && cur && (
          <div className="pointer-events-none absolute bottom-20 left-3 z-10 max-w-xs rounded-lg bg-black/75 px-2 py-1.5 font-mono text-[10px] text-emerald-400/90">
            id={cur.id} idx={idx}/{posts.length} score={scorePost(cur, resumeRec()).toFixed(1)}{" "}
            tags={parseTags(cur.tags).length}
          </div>
        )}
      </div>
    </div>
  );
}
