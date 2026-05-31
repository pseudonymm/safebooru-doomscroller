import type { Post } from "@/types/fetcher";
import type { RecState } from "@/lib/recommendation";
import { saveBuffer } from "./buffer";
import { saveLiked } from "./liked";
import { hasRec, saveRec } from "./rec";

export { KEYS } from "./keys";
export * from "./rec";
export * from "./buffer";
export * from "./liked";
export * from "./saved";
export * from "./visited";
export * from "./stats";

export const hasStoredFeed = () => hasRec();

export const syncFeed = (rec: RecState, posts: Post[], liked: Iterable<number>) => {
  saveRec(rec);
  saveBuffer(posts);
  saveLiked(liked);
};
