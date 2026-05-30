import { describe, expect, test } from "bun:test";
import { orTagQuery } from "../src/lib/tagQuery";

describe("orTagQuery", () => {
  test("single tag unchanged", () => {
    expect(orTagQuery(["1girl"])).toBe("1girl");
  });

  test("two tags OR syntax", () => {
    expect(orTagQuery(["cat", "dog"])).toBe("(+cat+~+dog+)");
  });

  test("three tags", () => {
    expect(orTagQuery(["a", "b", "c"])).toBe("(+a+~+b+~+c+)");
  });
});
