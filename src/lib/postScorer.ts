import type { Post } from "../types/fetcher";
import { parseTags, w, type RecState } from "./recommendation";

export const scorePost = (p: Post, s: RecState) =>
  parseTags(p.tags).reduce((a, t) => a + w(s, t), 0);

export const rankPosts = (posts: Post[], s: RecState) =>
  [...posts].sort((a, b) => scorePost(b, s) - scorePost(a, s));
