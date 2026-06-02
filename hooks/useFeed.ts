"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Post } from "@/types/fetcher";
import { FETCH_LIMIT, IGNORE_MS, PREFETCH } from "@/lib/config";
import { FetchEmptyError } from "@/lib/fetchErrors";
import { listPosts } from "@/lib/fetcher";
import { mergePosts } from "@/lib/feedBuffer";
import { fetchByQuery, pickQuery } from "@/lib/fetchRotator";
import { log } from "@/lib/log";
import { ignore, like, parseTags, resumeRec, trackSeen, unlike, type RecState } from "@/lib/recommendation";
import { hasStoredFeed, loadBuffer, loadLiked, syncFeed } from "@/lib/store";
import { loadIdx, saveIdx } from "@/lib/store/pos";
import { loadSaved, toggleSaved } from "@/lib/store/saved";
import { bumpStat } from "@/lib/store/stats";
import { markVisited } from "@/lib/store/visited";
import { andTagQuery, orTagQuery } from "@/lib/tagQuery";
import { tagsFromUrl } from "@/lib/urlTags";

const L = log("feed-engine");

export const useFeed = () => {
  const watch = useRef(tagsFromUrl());
  const [phase, setPhase] = useState<"boot" | "search" | "feed">("boot");
  const [posts, setPosts] = useState<Post[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState(() => loadLiked());
  const [savedIds, setSavedIds] = useState(() => new Set(loadSaved().map((p) => p.id)));
  const likedR = useRef(loadLiked());
  const rec = useRef<RecState>(resumeRec());
  const ids = useRef(new Set<number>());
  const postsRef = useRef(posts);
  postsRef.current = posts;
  const dwellOk = useRef(false);
  const dwellT = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const fetching = useRef(false);
  const booted = useRef(false);
  const lastViewed = useRef(-1);

  const sync = useCallback(
    () => syncFeed(rec.current, postsRef.current, likedR.current),
    []
  );

  const fetchBatch = useCallback(async () => {
    const q = watch.current;
    return q.length
      ? listPosts({ tags: andTagQuery(q), limit: FETCH_LIMIT })
      : fetchByQuery(pickQuery(rec.current));
  }, []);

  const refill = useCallback(async (from: number, buf: Post[]) => {
    if (fetching.current || buf.length - from >= PREFETCH) return;
    fetching.current = true;
    setLoading(true);
    let cur = buf;
    let stall = 0;
    try {
      while (cur.length - from < PREFETCH && stall < 6) {
        L.info("fetch", { watch: watch.current, buf: cur.length, from });
        const before = cur.length;
        cur = mergePosts(cur, await fetchBatch(), rec.current, ids.current);
        stall = cur.length === before ? stall + 1 : 0;
      }
      setPosts(cur);
      sync();
    } catch (e) {
      L.error("refill", e);
    } finally {
      fetching.current = false;
      setLoading(false);
    }
  }, [fetchBatch, sync]);

  const restoreBuf = useCallback(
    (buf: Post[]) => {
      buf.forEach((p) => ids.current.add(p.id));
      const i = Math.min(loadIdx(), Math.max(0, buf.length - 1));
      setPosts(buf);
      setIdx(i);
      lastViewed.current = buf[i]?.id ?? -1;
      setPhase("feed");
      setLoading(false);
      refill(i, buf);
    },
    [refill]
  );

  const loadFiltered = useCallback(
    async (filterTags: string[], reset: boolean) => {
      watch.current = filterTags;
      setLoading(true);
      setSearchError(null);
      if (reset) {
        setPosts([]);
        ids.current.clear();
        setIdx(0);
        saveIdx(0);
        lastViewed.current = -1;
      }
      try {
        const batch = await listPosts({ tags: andTagQuery(filterTags), limit: FETCH_LIMIT });
        if (!batch.length) {
          setSearchError("No posts match these tags. Try fewer tags or different combinations.");
          setPosts([]);
          setPhase("feed");
          setLoading(false);
          return;
        }
        trackSeen(rec.current, batch.map((p) => parseTags(p.tags)));
        const buf = mergePosts([], batch, rec.current, ids.current);
        setPosts(buf);
        setPhase("feed");
        sync();
        setLoading(false);
        refill(0, buf);
      } catch (e) {
        const msg =
          e instanceof FetchEmptyError
            ? "No posts match this search — tags may contradict or not exist together."
            : "Search failed. Try again.";
        L.warn("loadFiltered", e);
        setSearchError(msg);
        setPosts([]);
        setPhase("feed");
        setLoading(false);
      }
    },
    [refill, sync]
  );

  const loadBootstrap = useCallback(
    async (seeds: string[]) => {
      watch.current = [];
      setLoading(true);
      setPosts([]);
      ids.current.clear();
      setIdx(0);
      saveIdx(0);
      lastViewed.current = -1;
      const batch = seeds.length
        ? await listPosts({ tags: orTagQuery(seeds), limit: FETCH_LIMIT })
        : await fetchByQuery(pickQuery(rec.current));
      trackSeen(rec.current, batch.map((p) => parseTags(p.tags)));
      const buf = mergePosts([], batch, rec.current, ids.current);
      setPosts(buf);
      setPhase("feed");
      sync();
      setLoading(false);
      refill(0, buf);
    },
    [refill, sync]
  );

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    (async () => {
      const urlTags = tagsFromUrl();
      watch.current = urlTags;
      rec.current = resumeRec();
      const liked = loadLiked();
      likedR.current = liked;
      setLikedIds(new Set(liked));

      if (!urlTags.length && !hasStoredFeed()) {
        setPhase("search");
        return;
      }

      setPhase("feed");
      setLoading(true);
      L.info("boot");

      if (urlTags.length) {
        await loadFiltered(urlTags, true);
        return;
      }

      const buf = loadBuffer();
      if (buf.length) {
        restoreBuf(buf);
        return;
      }

      const snap = resumeRec();
      const seeds = snap.seeds.length
        ? snap.seeds
        : [...snap.weights.entries()].slice(0, 3).map(([t]) => t);
      seeds.length ? await loadBootstrap(seeds) : setPhase("search");
    })();
  }, [loadFiltered, loadBootstrap, restoreBuf]);

  const refresh = useCallback(async () => {
    const q = watch.current;
    setSearchError(null);
    if (q.length) return loadFiltered(q, true);
    const snap = resumeRec();
    const seeds = snap.seeds.length
      ? snap.seeds
      : [...snap.weights.entries()].slice(0, 3).map(([t]) => t);
    seeds.length ? await loadBootstrap(seeds) : setPhase("search");
  }, [loadFiltered, loadBootstrap]);

  const onLike = useCallback(
    (p: Post) => {
      const tags = parseTags(p.tags);
      if (likedR.current.has(p.id)) {
        likedR.current.delete(p.id);
        unlike(rec.current, tags);
        bumpStat("liked", -1);
        L.info("unlike", { id: p.id });
      } else {
        likedR.current.add(p.id);
        like(rec.current, tags);
        bumpStat("liked");
        L.info("like", { id: p.id });
      }
      setLikedIds(new Set(likedR.current));
      sync();
    },
    [sync]
  );

  const onSave = useCallback((p: Post) => {
    const added = toggleSaved(p);
    setSavedIds((s) => {
      const n = new Set(s);
      added ? n.add(p.id) : n.delete(p.id);
      return n;
    });
    if (added) bumpStat("saved");
    L.info("save", { id: p.id, added });
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
      bumpStat("ignored");
      sync();
      L.info("ignore", { id: p.id, prev });
    }
    dwellOk.current = false;
  }, [sync]);

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
      saveIdx(next);
    },
    [idx, posts.length, leavePost]
  );

  useEffect(() => {
    if (phase !== "feed") return;
    const p = postsRef.current[idx];
    if (!p || p.id === lastViewed.current) return;
    lastViewed.current = p.id;
    markVisited(p.id);
    bumpStat("viewed");
  }, [phase, idx]);

  useEffect(() => {
    if (phase === "feed") armDwell();
    return () => clearTimeout(dwellT.current);
  }, [idx, phase, armDwell]);

  return {
    phase,
    posts,
    idx,
    loading,
    searchError,
    setActive,
    onLike,
    onSave,
    likedIds,
    savedIds,
    refresh,
  };
};
