import type { Post } from "@/types/fetcher";
import type { RecState } from "@/lib/recommendation";
import { loadBuffer, saveBuffer } from "./buffer";
import { saveLiked } from "./liked";
import { hasRec, saveRec } from "./rec";

export { KEYS } from "./keys";
export * from "./rec";
export * from "./buffer";
export * from "./pos";
export * from "./backup";
export * from "./liked";
export * from "./saved";
export * from "./visited";
export * from "./stats";

export const hasStoredFeed = () => hasRec() || loadBuffer().length > 0;

export const syncFeed = (rec: RecState, posts: Post[], liked: Iterable<number>) => {
  saveRec(rec);
  saveBuffer(posts);
  saveLiked(liked);
};
