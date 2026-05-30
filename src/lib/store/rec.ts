import type { RecState } from "../recommendation";
import { KEYS } from "./keys";
import { read, write } from "./json";

type Snap = { weights: [string, number][]; seen: string[]; seeds: string[] };

export const loadRecSnap = (): Snap | null => {
  const s = read<Snap | null>(KEYS.rec, null);
  return s?.weights ? s : null;
};

export const toRec = (o: Snap): RecState => ({
  weights: new Map(o.weights),
  seen: new Set(o.seen),
  seeds: o.seeds ?? [],
});

export const saveRec = (s: RecState) =>
  write(KEYS.rec, { weights: [...s.weights], seen: [...s.seen], seeds: s.seeds });

export const hasRec = () => {
  const s = loadRecSnap();
  return !!s && (s.seeds.length > 0 || s.weights.length > 0);
};
