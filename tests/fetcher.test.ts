import { afterEach, describe, expect, mock, test } from "bun:test";
import { autocomplete, listPosts } from "../src/lib/fetcher";
import type { AutocompleteItem, Post } from "../src/types/fetcher";

const post = { id: 1 } as Post;
const items = [{ label: "cat", value: "cat" }] as AutocompleteItem[];
const orig = globalThis.fetch;

afterEach(() => { globalThis.fetch = orig; });

describe("listPosts", () => {
    test("json=1 + parses Post[]", async () => {
        globalThis.fetch = mock(async (url) => {
            const u = String(url);
            expect(u).toContain("json=1");
            expect(u).toContain("limit=5");
            expect(u).toContain("tags=1girl");
            return new Response(JSON.stringify([post]));
        }) as unknown as typeof fetch;
        expect(await listPosts({ limit: 5, tags: "1girl" })).toEqual([post]);
    });
});

describe("autocomplete", () => {
    test("parses plaintext json body", async () => {
        globalThis.fetch = mock(async (url) => {
            expect(String(url)).toContain("q=miyo");
            return new Response(JSON.stringify(items), { headers: { "Content-Type": "text/plain" } });
        }) as unknown as typeof fetch;
        expect(await autocomplete("miyo")).toEqual(items);
    });
});
