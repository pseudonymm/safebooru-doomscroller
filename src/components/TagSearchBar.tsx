import { useEffect, useRef, useState } from "preact/hooks";
import { Search, X } from "lucide-react";
import { autocomplete } from "../lib/fetcher.server";
import { log } from "../lib/log";
import { applyTagSearch, tagsFromUrl } from "../lib/urlTags";

const L = log("search");
const DEBOUNCE_MS = 250;

type Props = {
  compact?: boolean;
  loading?: boolean;
};

const Highlight = ({ label, q }: { label: string; q: string }) => {
  const i = label.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return <>{label}</>;
  return (
    <>
      {label.slice(0, i)}
      <mark class="rounded-sm bg-yellow-400/90 px-0.5 text-zinc-900">{label.slice(i, i + q.length)}</mark>
      {label.slice(i + q.length)}
    </>
  );
};

export function TagSearchBar({ compact, loading }: Props) {
  const active = tagsFromUrl();
  const [q, setQ] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [hints, setHints] = useState<{ label: string; value: string }[]>([]);
  const [hintLoad, setHintLoad] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout>>();
  const seq = useRef(0);

  useEffect(() => {
    clearTimeout(t.current);
    const term = q.trim();
    if (!term) {
      setHints([]);
      setHintLoad(false);
      return;
    }
    t.current = setTimeout(async () => {
      const id = ++seq.current;
      setHintLoad(true);
      try {
        const items = await autocomplete(term);
        if (id !== seq.current) return;
        setHints(items.slice(0, 12));
        L.debug("hints", { q: term, n: items.length });
      } catch (e) {
        if (id === seq.current) setHints([]);
        L.warn("autocomplete", e);
      } finally {
        if (id === seq.current) setHintLoad(false);
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(t.current);
  }, [q]);

  const pick = (tag: string) => {
    const v = tag.trim().toLowerCase();
    if (!v) return;
    if (compact) return applyTagSearch([v], true);
    if (!tags.includes(v)) setTags([...tags, v]);
    setQ("");
    setHints([]);
  };

  const submit = () => {
    const all = [...tags, ...(q.trim() ? [q.trim()] : [])];
    if (!all.length) return applyTagSearch([]);
    L.info("submit", all);
    applyTagSearch(all, false);
  };

  const open = !!q.trim() && (hintLoad || hints.length > 0);

  return (
    <div class={compact ? "relative w-full" : "relative w-full max-w-md"}>
      {compact && active.length > 0 && (
        <div class="mb-2 flex flex-wrap items-center gap-1.5">
          {active.map((t) => (
            <span key={t} class="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-200">
              {t}
            </span>
          ))}
          <button
            type="button"
            class="text-xs text-zinc-500 hover:text-zinc-300"
            onClick={() => applyTagSearch([])}
          >
            Clear
          </button>
        </div>
      )}
      <div class="relative">
        <span
          class="pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-center text-zinc-500"
          aria-hidden
        >
          <Search size={16} strokeWidth={2} />
        </span>
        <input
          class={`w-full rounded-xl border border-zinc-800 bg-zinc-900 text-sm outline-none focus:border-zinc-600 ${
            compact ? "py-2 pr-3 pl-10" : "py-2.5 pr-4 pl-10"
          }`}
          placeholder={compact && active.length ? active.join(" ") : "Search tags…"}
          value={q}
          autoComplete="off"
          onInput={(e) => setQ((e.target as HTMLInputElement).value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            if (hints[0]) pick(hints[0].value);
            else if (compact) applyTagSearch(q.trim() ? [q.trim()] : [], true);
            else submit();
          }}
        />
      </div>
      {open && (
        <ul class="absolute top-full right-0 left-0 z-30 mt-1 max-h-48 overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-100 text-zinc-900 shadow-xl">
          {hintLoad && !hints.length ? (
            <li class="px-3 py-2 text-sm text-zinc-500">Searching…</li>
          ) : (
            hints.map((h) => (
              <li key={h.value}>
                <button
                  type="button"
                  class="w-full px-3 py-1.5 text-left text-sm hover:bg-yellow-100"
                  onClick={() => pick(h.value)}
                >
                  <Highlight label={h.label} q={q.trim()} />
                </button>
              </li>
            ))
          )}
        </ul>
      )}
      {!compact && tags.length > 0 && (
        <div class="mt-2 flex flex-wrap gap-2">
          {tags.map((t) => (
            <span key={t} class="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-200">
              {t}
              <button type="button" aria-label={`Remove ${t}`} onClick={() => setTags(tags.filter((x) => x !== t))}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      {!compact && (
        <button
          type="button"
          disabled={loading || (!tags.length && !q.trim())}
          class="mt-4 w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-zinc-950 disabled:opacity-40"
          onClick={submit}
        >
          {loading ? "Loading…" : "Start doomscrolling"}
        </button>
      )}
    </div>
  );
}
