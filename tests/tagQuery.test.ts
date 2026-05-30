import { describe, expect, test } from "bun:test";
import { andTagQuery, orTagQuery } from "../src/lib/tagQuery";

describe("orTagQuery", () => {
  test("single tag unchanged", () => {
    expect(orTagQuery(["1girl"])).toBe("1girl");
  });

  test("two tags OR syntax", () => {
    expect(orTagQuery(["cat", "dog"])).toBe("(+cat+~+dog+)");
  });
});

describe("andTagQuery", () => {
  test("joins with spaces", () => {
    expect(andTagQuery(["cat", "dog"])).toBe("cat dog");
  });
});
