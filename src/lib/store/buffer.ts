import type { Post } from "../../types/fetcher";
import { MAX_BUFFER_POSTS } from "../config";
import { KEYS } from "./keys";
import { read, write } from "./json";

export const loadBuffer = () => read<Post[]>(KEYS.buffer, []);

export const saveBuffer = (posts: Post[]) =>
  write(KEYS.buffer, posts.slice(-MAX_BUFFER_POSTS));
