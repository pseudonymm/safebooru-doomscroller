/** Booru OR: `(+tag1+~+tag2+)` — algorithmic discovery */
export const orTagQuery = (tags: string[]) => {
  const t = tags.map((x) => x.trim()).filter(Boolean);
  if (!t.length) return "";
  if (t.length === 1) return t[0]!;
  return `(+${t.join("+~+")}+)`;
};

/** Booru AND: space-separated tags — explicit user watch search */
export const andTagQuery = (tags: string[]) => tags.map((x) => x.trim()).filter(Boolean).join(" ");
