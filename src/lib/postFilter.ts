import type { Post } from "../types/fetcher";

export const dedupePosts = (posts: Post[], ids: Set<number>) =>
  posts.filter((p) => !ids.has(p.id));
