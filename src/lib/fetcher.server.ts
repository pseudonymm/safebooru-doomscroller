import type { AutocompleteItem, ListPostsParams, Post } from "../types/fetcher";
import { log } from "./log.ts";

const BASE_URL = `https://safebooru.org`;
const API_URL = `${BASE_URL}/index.php`;
const AUTOCOMPLETE_URL = `${BASE_URL}/autocomplete.php`;

const L = log("fetcher");

const qs = (p: object) =>
  new URLSearchParams(
    Object.fromEntries(
      Object.entries(p)
        .filter(([, v]) => v != null)
        .map(([k, v]) => [k, String(v)])
    )
  ).toString();

/**
 * List posts from Safebooru public API.
 * @param params - The parameters for the list posts.
 * @returns The list of posts.
 */
export async function listPosts(params: ListPostsParams): Promise<Post[]> {
  L.info(`listPosts: ${API_URL}?${qs({ page: "dapi", s: "post", q: "index", ...params, json: 1 })}`);
  const res = await fetch(`${API_URL}?${qs({ page: "dapi", s: "post", q: "index", ...params, json: 1 })}`);
  if (!res.ok) {
    L.error(`listPosts: ${res.status} ${res.statusText}`);
    throw new Error(`listPosts: ${res.status} ${res.statusText}`);
  }
  L.info(`listPosts: ${res.status} ${res.statusText}`);
  const data = await res.json() as Post[];
  L.info(`listPosts: ${data.length} posts`);
  return data;
}

/**
 * Autocomplete tags from Safebooru public API.
 * @param q - The query to autocomplete.
 * @returns The list of autocomplete items.
 */
export async function autocomplete(q: string): Promise<AutocompleteItem[]> {
  L.info(`autocomplete: ${AUTOCOMPLETE_URL}?${new URLSearchParams({ q })}`);
  const res = await fetch(`${AUTOCOMPLETE_URL}?${new URLSearchParams({ q })}`);
  if (!res.ok) {
    L.error(`autocomplete: ${res.status} ${res.statusText}`);
    throw new Error(`autocomplete: ${res.status} ${res.statusText}`);
  }
  L.info(`autocomplete: ${res.status} ${res.statusText}`);
  const data = await res.json() as AutocompleteItem[];
  L.info(`autocomplete: ${data.length} items`);
  return data;
}
