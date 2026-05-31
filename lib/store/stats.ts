import { KEYS } from "./keys";
import { read, write } from "./json";

export type Stats = {
  viewed: number;
  liked: number;
  ignored: number;
  searches: number;
  saved: number;
  sessionMs: number;
  since: number;
};

const empty = (): Stats => ({
  viewed: 0,
  liked: 0,
  ignored: 0,
  searches: 0,
  saved: 0,
  sessionMs: 0,
  since: Date.now(),
});

export const loadStats = () => read<Stats>(KEYS.stats, empty());

export const saveStats = (s: Stats) => write(KEYS.stats, s);

export const bumpStat = (k: keyof Omit<Stats, "sessionMs" | "since">, n = 1) => {
  const s = loadStats();
  s[k] = Math.max(0, s[k] + n);
  saveStats(s);
};

export const tickSession = (ms: number) => {
  const s = loadStats();
  s.sessionMs += ms;
  saveStats(s);
};
