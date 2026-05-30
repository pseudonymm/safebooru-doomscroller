import type { AutocompleteItem, ListPostsParams, Post } from "../types/fetcher";

const BASE_URL = `https://safebooru.org`;
const POSTS_URL = `${BASE_URL}/index.php?page=dapi&s=post&q=index`;
const AUTOCOMPLETE_URL = `${BASE_URL}/autocomplete.php`;

const qs = (p: object) =>
  new URLSearchParams(
    Object.fromEntries(
      Object.entries(p)
        .filter(([, v]) => v != null)
        .map(([k, v]) => [k, String(v)])
    )
  ).toString();

export const listPosts = async (
  params: ListPostsParams
): Promise<Post[]> =>
  (
    await fetch(
      `${POSTS_URL}?${qs({ ...params, json: 1 })}`
    )
  ).json() as Promise<Post[]>;

export const autocomplete = async (
  q: string
): Promise<AutocompleteItem[]> =>
  JSON.parse(
    await (
      await fetch(
        `${AUTOCOMPLETE_URL}?${new URLSearchParams({ q })}`
      )
    ).text()
  ) as AutocompleteItem[];
