import { KEYS } from "./keys";
import { read, write } from "./json";

export const loadIdx = () => Math.max(0, read(KEYS.feedIdx, 0));
export const saveIdx = (i: number) => write(KEYS.feedIdx, i);
