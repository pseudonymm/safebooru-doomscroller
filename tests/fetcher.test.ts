import { afterEach, describe, expect, mock, test } from "bun:test";
import { autocomplete, listPosts } from "../lib/fetcher";
import type { Post } from "../types/fetcher";

const post = { id: 1 } as Post;
const orig = globalThis.fetch;

afterEach(() => { globalThis.fetch = orig; });

describe("listPosts", () => {
    test("fetches /api/list-posts with params", async () => {
        globalThis.fetch = mock(async (url, init) => {
            expect(url).toBe("/api/list-posts");
            expect(init?.method).toBe("POST");
            const body = JSON.parse(init?.body as string);
            expect(body.limit).toBe(5);
            expect(body.tags).toBe("1girl");
            return new Response(JSON.stringify([post]));
        }) as unknown as typeof fetch;
        expect(await listPosts({ limit: 5, tags: "1girl" })).toEqual([post]);
    });
});

describe("autocomplete", () => {
    test("fetches /api/autocomplete", async () => {
        globalThis.fetch = mock(async (url, init) => {
            expect(url).toBe("/api/autocomplete");
            expect(init?.method).toBe("POST");
            return new Response(JSON.stringify([{ label: "cat", value: "cat" }]));
        }) as unknown as typeof fetch;
        expect(await autocomplete("cat")).toEqual([{ label: "cat", value: "cat" }]);
    });
});
