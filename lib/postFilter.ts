import type { Post } from "@/types/fetcher";
import { isVisited } from "@/lib/store/visited";

export const pickIncoming = (posts: Post[], ids: Set<number>) => {
  const fresh = posts.filter((p) => !ids.has(p.id) && !isVisited(p.id));
  return fresh.length ? fresh : posts.filter((p) => !ids.has(p.id));
};
