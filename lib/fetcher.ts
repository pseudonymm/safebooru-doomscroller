import type { AutocompleteItem, ListPostsParams, Post } from "@/types/fetcher";
import { FetchEmptyError } from "./fetchErrors";
import { log } from "./log";

const L = log("fetcher");

export async function listPosts(params: ListPostsParams): Promise<Post[]> {
  L.info("listPosts", params);
  const res = await fetch("/api/list-posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`listPosts: ${res.status} ${res.statusText}`);
  const data: unknown = await res.json();
  if (!Array.isArray(data)) throw new FetchEmptyError();
  L.info(`listPosts: ${data.length} posts`);
  return data as Post[];
}

export async function autocomplete(q: string): Promise<AutocompleteItem[]> {
  const res = await fetch("/api/autocomplete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q }),
  });
  if (!res.ok) throw new Error(`autocomplete: ${res.status}`);
  return res.json() as Promise<AutocompleteItem[]>;
}
