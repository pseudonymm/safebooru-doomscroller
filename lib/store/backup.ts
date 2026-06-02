import { KEYS } from "./keys";

export const exportFeedData = () =>
  JSON.stringify(
    Object.fromEntries(
      (Object.values(KEYS) as string[]).map((k) => [k, localStorage.getItem(k)])
    ),
    null,
    0
  );

export const importFeedData = (raw: string) => {
  const o = JSON.parse(raw) as Record<string, string | null>;
  Object.entries(o).forEach(([k, v]) =>
    v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v)
  );
};

export const resetFeedData = () =>
  (Object.values(KEYS) as string[]).forEach((k) => localStorage.removeItem(k));
