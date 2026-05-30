import { useCallback, useRef } from "preact/hooks";
import type { Post } from "../types/fetcher";
import { log } from "../lib/log";
import { TagSearchBar } from "./TagSearchBar";
import { FeedControls } from "./FeedControls";
import { FeedItem } from "./FeedItem";

const L = log("ui");

type Props = {
  posts: Post[];
  idx: number;
  liked: Set<number>;
  loading: boolean;
  setActive: (i: number) => void;
  onLike: (p: Post) => void;
};

export function Feed({ posts, idx, liked, loading, setActive, onLike }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const scrollLock = useRef(false);

  const snapTo = useCallback(
    (i: number) => {
      const el = scroller.current;
      if (!el || i < 0 || i >= posts.length) return;
      scrollLock.current = true;
      el.scrollTo({ top: i * el.clientHeight, behavior: "smooth" });
      setActive(i);
      setTimeout(() => (scrollLock.current = false), 400);
    },
    [posts.length, setActive]
  );

  const onScroll = () => {
    const el = scroller.current;
    if (!el || scrollLock.current) return;
    const i = Math.round(el.scrollTop / el.clientHeight);
    if (i !== idx) {
      L.debug("scroll", { i, idx });
      setActive(i);
    }
  };

  return (
    <div class="feed-layout h-screen w-full bg-black">
      <header class="feed-header z-20 shrink-0 border-b border-zinc-800/80 bg-zinc-950/95 px-3 py-2 backdrop-blur">
        <TagSearchBar compact loading={loading} />
      </header>
      <div class="feed-shell relative min-h-0 flex-1">
        <div ref={scroller} class="feed-scroller h-full w-full" onScroll={onScroll}>
          {posts.map((p) => (
            <div key={p.id} class="feed-slide h-full w-full shrink-0">
              <FeedItem post={p} liked={liked.has(p.id)} onLike={() => onLike(p)} />
            </div>
          ))}
        </div>
        <FeedControls
          idx={idx}
          total={posts.length}
          onPrev={() => snapTo(idx - 1)}
          onNext={() => snapTo(idx + 1)}
        />
        {loading && (
          <div class="pointer-events-none absolute top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-zinc-900/90 px-3 py-1 text-xs text-zinc-300">
            Loading…
          </div>
        )}
      </div>
    </div>
  );
}
