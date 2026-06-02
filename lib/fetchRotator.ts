import { DISCOVERY_P, FETCH_LIMIT } from "@/lib/config";
import { listPosts } from "@/lib/fetcher";
import { log } from "@/lib/log";
import { coldTag, type RecState, w, weightedTag } from "@/lib/recommendation";
import { orTagQuery } from "@/lib/tagQuery";

const L = log("rotator");

export const pickTag = (s: RecState) => {
  const discovery = Math.random() < DISCOVERY_P;
  const tag = discovery ? coldTag(s) : weightedTag(s);
  L.info("pick", { discovery, tag });
  return tag;
};

/** Tag query with AND-pairs, OR-pairs, and random page offset. */
export const pickQuery = (s: RecState) => {
  const primary = pickTag(s);
  const r = Math.random();
  if (r < 0.22) {
    const alt = coldTag(s);
    if (alt !== primary) return { tags: `${primary} ${alt}`, mode: "and-pair" as const };
  }
  if (r < 0.38) {
    const pool = [...s.weights.entries()].filter(([, v]) => v > 0).map(([t]) => t);
    if (pool.length >= 2) {
      const a = pool[Math.floor(Math.random() * pool.length)]!;
      let b = pool[Math.floor(Math.random() * pool.length)]!;
      if (a !== b) return { tags: orTagQuery([a, b]), mode: "or-pair" as const };
    }
  }
  if (r < 0.5 && w(s, primary) > 2) {
    const alt = weightedTag(s);
    if (alt !== primary) return { tags: orTagQuery([primary, alt]), mode: "or-weighted" as const };
  }
  return { tags: primary, mode: "single" as const };
};

export const fetchByQuery = (q: ReturnType<typeof pickQuery>) =>
  listPosts({
    tags: q.tags,
    limit: FETCH_LIMIT,
    pid: Math.random() < 0.45 ? Math.floor(Math.random() * 24) : 0,
  });

export const fetchByTag = (tag: string) => fetchByQuery({ tags: tag, mode: "single" });
