import { describe, expect, test } from "bun:test";
import { scorePost } from "../src/lib/postScorer";
import {
  bump,
  coldPool,
  createRec,
  parseTags,
  quartileThreshold,
  weightedTag,
  type RecState,
} from "../src/lib/recommendation";

const mk = (w: Record<string, number>, seen: string[] = []): RecState => ({
  weights: new Map(Object.entries(w)),
  seen: new Set(seen),
  seeds: ["seed"],
});

describe("parseTags", () => {
  test("splits tag string", () => {
    expect(parseTags("a b  c")).toEqual(["a", "b", "c"]);
  });
});

describe("scorer", () => {
  test("sums weights", () => {
    const s = mk({ cat: 2, dog: 1 });
    expect(scorePost({ tags: "cat dog", id: 1 } as never, s)).toBe(3);
  });
});

describe("quartile", () => {
  test("bottom quartile threshold", () => {
    const s = mk({ a: 1, b: 2, c: 3, d: 4 });
    expect(quartileThreshold(s)).toBe(2);
    expect(coldPool({ ...s, seen: new Set(["a", "b", "c", "d"]) })).toContain("a");
  });
});

describe("weightedTag", () => {
  test("favors high weight", () => {
    const s = mk({ hot: 100, cold: 0.01 });
    const counts: Record<string, number> = {};
    for (let i = 0; i < 200; i++) counts[weightedTag(s)] = (counts[weightedTag(s)] ?? 0) + 1;
    expect(counts.hot ?? 0).toBeGreaterThan(counts.cold ?? 0);
  });
});

describe("bump", () => {
  test("like delta", () => {
    const s = mk({});
    bump(s, ["x"], 1);
    expect(s.weights.get("x")).toBe(1);
  });
});
