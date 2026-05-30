import type { Post } from "../types/fetcher";
import { pickIncoming } from "./postFilter";
import { rankPosts } from "./postScorer";
import { parseTags, trackSeen, type RecState } from "./recommendation";

export const mergePosts = (buf: Post[], incoming: Post[], s: RecState, ids: Set<number>) => {
  trackSeen(
    s,
    incoming.map((p) => parseTags(p.tags))
  );
  const pool = pickIncoming(incoming, ids);
  const next = [...buf, ...rankPosts(pool, s)];
  pool.forEach((p) => ids.add(p.id));
  return next;
};
