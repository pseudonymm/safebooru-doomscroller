import type { Post } from "../types/fetcher";
import { dedupePosts } from "./postFilter";
import { rankPosts } from "./postScorer";
import { parseTags, trackSeen, type RecState } from "./recommendation";

export const mergePosts = (buf: Post[], incoming: Post[], s: RecState, ids: Set<number>) => {
  trackSeen(
    s,
    incoming.map((p) => parseTags(p.tags))
  );
  const next = [...buf, ...dedupePosts(rankPosts(incoming, s), ids)];
  incoming.forEach((p) => ids.add(p.id));
  return next;
};
