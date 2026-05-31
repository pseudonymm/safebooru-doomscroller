import { MAX_VISITED_IDS } from "@/lib/config";
import { KEYS } from "./keys";
import { read, write } from "./json";

const load = () => new Set(read<number[]>(KEYS.visited, []));

export const isVisited = (id: number) => load().has(id);

export const markVisited = (id: number) => {
  const s = load();
  if (s.has(id)) return;
  s.add(id);
  const arr = [...s];
  write(KEYS.visited, arr.length > MAX_VISITED_IDS ? arr.slice(-MAX_VISITED_IDS) : arr);
};

export const visitedCount = () => load().size;
