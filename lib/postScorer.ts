import type { Post } from "@/types/fetcher";
import { VISITED_PENALTY } from "@/lib/config";
import { parseTags, w, type RecState } from "@/lib/recommendation";
import { isVisited } from "@/lib/store/visited";

export const scorePost = (p: Post, s: RecState) => {
  const base = parseTags(p.tags).reduce((a, t) => a + w(s, t), 0);
  return isVisited(p.id) ? base - VISITED_PENALTY : base;
};

export const rankPosts = (posts: Post[], s: RecState) =>
  [...posts].sort((a, b) => scorePost(b, s) - scorePost(a, s));
