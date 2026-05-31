import { IGNORE_D, LIKE_D, SEARCH_D } from "@/lib/config";
import { log } from "@/lib/log";
import { loadRecSnap, saveRec, toRec } from "@/lib/store/rec";

const L = log("recommendation-engine");

export type RecState = {
  weights: Map<string, number>;
  seen: Set<string>;
  seeds: string[];
};

export const parseTags = (s: string) => s.trim().split(/\s+/).filter(Boolean);

export const w = (s: RecState, t: string) => s.weights.get(t) ?? 0;

export const loadRec = (): RecState | null => {
  const snap = loadRecSnap();
  return snap ? toRec(snap) : null;
};

export const createRec = (seeds: string[] = []): RecState => {
  const s = loadRec() ?? { weights: new Map(), seen: new Set(), seeds };
  if (seeds.length) {
    s.seeds = seeds;
    seeds.forEach((t) => {
      s.seen.add(t);
      s.weights.has(t) || s.weights.set(t, 1);
    });
  }
  L.info("init", { seeds: s.seeds.length, weights: s.weights.size, seen: s.seen.size });
  return s;
};

export const resumeRec = (): RecState => loadRec() ?? createRec();

export const persistRec = (s: RecState) => {
  saveRec(s);
  L.debug("persist", { weights: s.weights.size });
};

export const bump = (s: RecState, tags: string[], d: number) => {
  tags.forEach((t) => {
    s.seen.add(t);
    s.weights.set(t, w(s, t) + d);
  });
  L.debug("bump", { d, tags: tags.slice(0, 8), n: tags.length });
  persistRec(s);
};

export const like = (s: RecState, tags: string[]) => bump(s, tags, LIKE_D);
export const unlike = (s: RecState, tags: string[]) => bump(s, tags, -LIKE_D);
export const ignore = (s: RecState, tags: string[]) => bump(s, tags, -IGNORE_D);
export const searchBoost = (s: RecState, tags: string[]) => {
  tags.forEach((t) => {
    s.seen.add(t);
    if (!s.seeds.includes(t)) s.seeds.push(t);
  });
  bump(s, tags, SEARCH_D);
  L.info("searchBoost", { tags, d: SEARCH_D });
};

export const trackSeen = (s: RecState, tagLists: string[][]) =>
  tagLists.flat().forEach((t) => s.seen.add(t));

const sumW = (entries: [string, number][]) =>
  entries.reduce((a, [, v]) => a + Math.max(0, v), 0);

export const weightedTag = (s: RecState): string => {
  const entries = [...s.weights.entries()].filter(([, v]) => v > 0);
  const pool = entries.length ? entries : s.seeds.map((t) => [t, 1] as [string, number]);
  if (!pool.length) return s.seeds[0] ?? "1girl";
  const total = sumW(pool);
  let r = Math.random() * total;
  for (const [t, v] of pool) if ((r -= Math.max(0, v)) <= 0) return t;
  return pool[pool.length - 1]![0];
};

export const quartileThreshold = (s: RecState) => {
  const vals = [...s.weights.values()].sort((a, b) => a - b);
  if (!vals.length) return 0;
  return vals[Math.floor(vals.length * 0.25)] ?? 0;
};

export const coldPool = (s: RecState): string[] => {
  const q = quartileThreshold(s);
  const pool = [...s.seen].filter((t) => w(s, t) <= q);
  L.debug("coldPool", { q, pool: pool.length });
  return pool.length ? pool : [...s.seen];
};

export const coldTag = (s: RecState): string => {
  const pool = coldPool(s);
  return pool[Math.floor(Math.random() * pool.length)] ?? weightedTag(s);
};
