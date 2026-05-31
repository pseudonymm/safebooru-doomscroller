export const read = <T>(key: string, fallback: T): T => {
  if (typeof localStorage === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : fallback;
};

export const write = (key: string, v: unknown) => {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(key, JSON.stringify(v));
};
