import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import type { Post } from "../types/fetcher";
import { FETCH_LIMIT, IGNORE_MS, PREFETCH } from "../lib/config";
import { listPosts } from "../lib/fetcher.server";
import { mergePosts } from "../lib/feedBuffer";
import { fetchByTag, pickTag } from "../lib/fetchRotator";
import { log } from "../lib/log";
import { tagsFromUrl } from "../lib/urlTags";
import {
  hasStoredFeed,
  ignore,
  like,
  loadStored,
  parseTags,
  persistRec,
  resumeRec,
  trackSeen,
  type RecState,
} from "../lib/recommendation";

const L = log("feed");

const syncPersist = (s: RecState, posts: Post[], liked: Set<number>) =>
  persistRec(s, { posts, liked: [...liked] });

export const useFeed = () => {
  const watch = useRef(tagsFromUrl());
  const [phase, setPhase] = useState<"boot" | "search" | "feed">("boot");
  const [posts, setPosts] = useState<Post[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [likedIds, setLikedIds] = useState(() => new Set<number>());
  const likedR = useRef(new Set<number>());
  const rec = useRef<RecState>(resumeRec());
  const ids = useRef(new Set<number>());
  const postsRef = useRef(posts);
  postsRef.current = posts;
  const dwellOk = useRef(false);
  const dwellT = useRef<ReturnType<typeof setTimeout>>();
  const fetching = useRef(false);
  const booted = useRef(false);

  const fetchBatch = useCallback(async () => {
    const q = watch.current;
    return q.length
      ? listPosts({ tags: q.join(" "), limit: FETCH_LIMIT })
      : fetchByTag(pickTag(rec.current));
  }, []);

  const refill = useCallback(async (from: number, buf: Post[]) => {
    if (fetching.current || buf.length - from >= PREFETCH) return;
    fetching.current = true;
    setLoading(true);
    let cur = buf;
    try {
      while (cur.length - from < PREFETCH) {
        L.info("fetch", { watch: watch.current, buf: cur.length, from });
        const batch = await fetchBatch();
        cur = mergePosts(cur, batch, rec.current, ids.current);
      }
      setPosts(cur);
      syncPersist(rec.current, cur, likedR.current);
    } catch (e) {
      L.error("refill", e);
    } finally {
      fetching.current = false;
      setLoading(false);
    }
  }, [fetchBatch]);

  const loadFiltered = useCallback(
    async (filterTags: string[], reset: boolean) => {
      watch.current = filterTags;
      setLoading(true);
      const batch = await listPosts({ tags: filterTags.join(" "), limit: FETCH_LIMIT });
      trackSeen(rec.current, batch.map((p) => parseTags(p.tags)));
      if (reset) {
        ids.current.clear();
        likedR.current.clear();
        setLikedIds(new Set());
        setIdx(0);
      }
      const buf = mergePosts([], batch, rec.current, ids.current);
      setPosts(buf);
      setPhase("feed");
      syncPersist(rec.current, buf, likedR.current);
      setLoading(false);
      refill(0, buf);
    },
    [refill]
  );

  const loadBootstrap = useCallback(
    async (seeds: string[], reset: boolean) => {
      watch.current = [];
      setLoading(true);
      const batch = seeds.length
        ? await listPosts({ tags: seeds.join(" "), limit: FETCH_LIMIT })
        : await fetchByTag(pickTag(rec.current));
      trackSeen(rec.current, batch.map((p) => parseTags(p.tags)));
      if (reset) {
        ids.current.clear();
        likedR.current.clear();
        setLikedIds(new Set());
        setIdx(0);
      }
      const buf = mergePosts([], batch, rec.current, ids.current);
      setPosts(buf);
      setPhase("feed");
      syncPersist(rec.current, buf, likedR.current);
      setLoading(false);
      refill(0, buf);
    },
    [refill]
  );

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    (async () => {
      const urlTags = tagsFromUrl();
      watch.current = urlTags;
      rec.current = resumeRec();

      if (urlTags.length) {
        if (loadStored()?.liked?.length) {
          likedR.current = new Set(loadStored()!.liked);
          setLikedIds(new Set(loadStored()!.liked));
        }
        L.info("bootWatch", { tags: urlTags });
        await loadFiltered(urlTags, true);
        return;
      }

      if (!hasStoredFeed()) {
        setPhase("search");
        return;
      }

      const snap = loadStored()!;
      if (snap.liked?.length) {
        likedR.current = new Set(snap.liked);
        setLikedIds(new Set(snap.liked));
      }
      if (snap.posts?.length) {
        snap.posts.forEach((p) => ids.current.add(p.id));
        setPosts(snap.posts);
        setPhase("feed");
        L.info("resume", { posts: snap.posts.length });
        refill(0, snap.posts);
        return;
      }
      const seeds = snap.seeds.length ? snap.seeds : snap.weights.slice(0, 3).map(([t]) => t);
      seeds.length ? await loadBootstrap(seeds, false) : setPhase("search");
    })();
  }, [loadFiltered, loadBootstrap, refill]);

  const onLike = useCallback((p: Post) => {
    if (likedR.current.has(p.id)) return;
    likedR.current.add(p.id);
    like(rec.current, parseTags(p.tags));
    setLikedIds(new Set(likedR.current));
    syncPersist(rec.current, postsRef.current, likedR.current);
    L.info("like", { id: p.id });
  }, []);

  const leavePost = useCallback((prev: number, forward: boolean) => {
    clearTimeout(dwellT.current);
    const p = postsRef.current[prev];
    if (!p || !forward) {
      dwellOk.current = false;
      return;
    }
    if (dwellOk.current && !likedR.current.has(p.id)) {
      ignore(rec.current, parseTags(p.tags));
      L.info("ignore", { id: p.id, prev });
    }
    dwellOk.current = false;
  }, []);

  const armDwell = useCallback(() => {
    clearTimeout(dwellT.current);
    dwellOk.current = false;
    dwellT.current = setTimeout(() => {
      dwellOk.current = true;
    }, IGNORE_MS);
  }, []);

  useEffect(() => {
    if (phase !== "feed" || !posts.length) return;
    refill(idx, posts);
  }, [phase, idx, posts, refill]);

  const setActive = useCallback(
    (next: number) => {
      if (next === idx || next < 0 || next >= posts.length) return;
      leavePost(idx, next > idx);
      setIdx(next);
    },
    [idx, posts.length, leavePost]
  );

  useEffect(() => {
    if (phase === "feed") armDwell();
    return () => clearTimeout(dwellT.current);
  }, [idx, phase, armDwell]);

  return { phase, posts, idx, loading, setActive, onLike, likedIds };
};
