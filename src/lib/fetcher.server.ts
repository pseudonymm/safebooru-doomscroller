import type { AutocompleteItem, ListPostsParams, Post } from "../types/fetcher";
import { FetchEmptyError } from "./fetchErrors.ts";
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

const parsePostJson = async (res: Response): Promise<Post[]> => {
  const text = await res.text();
  if (!text.trim()) return [];
  try {
    const data = JSON.parse(text);
    return Array.isArray(data) ? (data as Post[]) : [];
  } catch {
    L.warn("parsePostJson: invalid or truncated JSON");
    throw new FetchEmptyError();
  }
};

export async function listPosts(params: ListPostsParams): Promise<Post[]> {
  const url = `${API_URL}?${qs({ page: "dapi", s: "post", q: "index", ...params, json: 1 })}`;
  L.info(`listPosts: ${url}`);
  const res = await fetch(url);
  if (!res.ok) {
    L.error(`listPosts: ${res.status} ${res.statusText}`);
    throw new Error(`listPosts: ${res.status} ${res.statusText}`);
  }
  const data = await parsePostJson(res);
  L.info(`listPosts: ${data.length} posts`);
  return data;
}

export async function autocomplete(q: string): Promise<AutocompleteItem[]> {
  const res = await fetch(`${AUTOCOMPLETE_URL}?${new URLSearchParams({ q })}`);
  if (!res.ok) throw new Error(`autocomplete: ${res.status}`);
  const text = await res.text();
  if (!text.trim()) return [];
  try {
    return JSON.parse(text) as AutocompleteItem[];
  } catch {
    return [];
  }
}
