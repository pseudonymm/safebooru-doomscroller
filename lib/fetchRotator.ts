import { DISCOVERY_P, FETCH_LIMIT } from "@/lib/config";
import { listPosts } from "@/lib/fetcher";
import { log } from "@/lib/log";
import { coldTag, type RecState, weightedTag } from "@/lib/recommendation";

const L = log("rotator");

export const pickTag = (s: RecState) => {
  const discovery = Math.random() < DISCOVERY_P;
  const tag = discovery ? coldTag(s) : weightedTag(s);
  L.info("pick", { discovery, tag });
  return tag;
};

export const fetchByTag = (tag: string) =>
  listPosts({ tags: tag, limit: FETCH_LIMIT });
