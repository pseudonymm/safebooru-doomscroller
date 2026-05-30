import { log } from "./log";
import { resumeRec, searchBoost } from "./recommendation";
import { bumpStat } from "./store/stats";

const L = log("url-tags");

export const tagsFromUrl = (): string[] => {
  if (typeof location === "undefined") return [];
  const t = new URLSearchParams(location.search).get("tags");
  return t ? t.trim().split(/\s+/).filter(Boolean) : [];
};

export const setUrlTags = (tags: string[]) => {
  const u = new URL(location.href);
  tags.length ? u.searchParams.set("tags", tags.join(" ")) : u.searchParams.delete("tags");
  L.info("navigate", { tags, href: u.pathname + u.search });
  location.assign(u.pathname + u.search);
};

export const applyTagSearch = (incoming: string[], append = false) => {
  const add = incoming.map((t) => t.trim().toLowerCase()).filter(Boolean);
  const tags = append ? [...new Set([...tagsFromUrl(), ...add])] : add;
  if (!tags.length) return setUrlTags([]);
  if (add.length) {
    searchBoost(resumeRec(), add);
    bumpStat("searches");
  }
  setUrlTags(tags);
};

export const removeUrlTag = (tag: string) => {
  const t = tag.trim().toLowerCase();
  setUrlTags(tagsFromUrl().filter((x) => x !== t));
};
