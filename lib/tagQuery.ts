export const orTagQuery = (tags: string[]) => {
  const t = tags.map((x) => x.trim()).filter(Boolean);
  if (!t.length) return "";
  if (t.length === 1) return t[0]!;
  return `(+${t.join("+~+")}+)`;
};

export const andTagQuery = (tags: string[]) => tags.map((x) => x.trim()).filter(Boolean).join(" ");
