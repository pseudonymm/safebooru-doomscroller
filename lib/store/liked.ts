import { KEYS } from "./keys";
import { read, write } from "./json";

export const loadLiked = () => new Set(read<number[]>(KEYS.liked, []));

export const saveLiked = (ids: Iterable<number>) => write(KEYS.liked, [...ids]);
