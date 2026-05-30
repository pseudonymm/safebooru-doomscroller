import type { Post } from "../../types/fetcher";
import { KEYS } from "./keys";
import { read, write } from "./json";

export const loadSaved = () => read<Post[]>(KEYS.saved, []);

export const saveSaved = (posts: Post[]) => write(KEYS.saved, posts);

export const isSaved = (id: number) => loadSaved().some((p) => p.id === id);

export const toggleSaved = (post: Post) => {
  const list = loadSaved();
  const i = list.findIndex((p) => p.id === post.id);
  if (i >= 0) list.splice(i, 1);
  else list.unshift(post);
  saveSaved(list);
  return i < 0;
};
