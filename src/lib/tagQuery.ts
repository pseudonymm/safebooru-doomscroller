/** Booru OR: `(+tag1+~+tag2+)` → posts with tag1 OR tag2 */
export const orTagQuery = (tags: string[]) => {
  const t = tags.map((x) => x.trim()).filter(Boolean);
  if (!t.length) return "";
  if (t.length === 1) return t[0]!;
  return `(+${t.join("+~+")}+)`;
};
