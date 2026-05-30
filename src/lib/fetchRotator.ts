import { DISCOVERY_P, FETCH_LIMIT } from "./config";
import { listPosts } from "./fetcher.server";
import { log } from "./log";
import { coldTag, type RecState, weightedTag } from "./recommendation";

const L = log("rotator");

export const pickTag = (s: RecState) => {
  const discovery = Math.random() < DISCOVERY_P;
  const tag = discovery ? coldTag(s) : weightedTag(s);
  L.info("pick", { discovery, tag });
  return tag;
};

export const fetchByTag = (tag: string) =>
  listPosts({ tags: tag, limit: FETCH_LIMIT });
