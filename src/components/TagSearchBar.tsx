import { useEffect, useRef, useState } from "preact/hooks";
import { Search, X } from "lucide-react";
import { autocomplete } from "../lib/fetcher.server";
import { log } from "../lib/log";
import { applyTagSearch, removeUrlTag, tagsFromUrl } from "../lib/urlTags";

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
      <mark class="rounded-sm bg-amber-500/40 px-0.5 text-amber-100">{label.slice(i, i + q.length)}</mark>
      {label.slice(i + q.length)}
    </>
  );
};

const TagBadge = ({ tag, onRemove }: { tag: string; onRemove: () => void }) => (
  <span class="inline-flex items-center gap-0.5 rounded-full bg-zinc-800 pl-2.5 pr-1 py-0.5 text-xs text-zinc-200">
    {tag}
    <button
      type="button"
      aria-label={`Remove ${tag}`}
      class="rounded p-0.5 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-100"
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
    >
      <X size={12} />
    </button>
  </span>
);

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

  const appendTag = (raw: string) => {
    const v = raw.trim().toLowerCase();
    if (!v) return;
    if (compact) return applyTagSearch([v], true);
    if (!tags.includes(v)) setTags([...tags, v]);
    setQ("");
    setHints([]);
  };

  const submit = () => {
    const pending = q.trim().toLowerCase();
    const all = [...new Set([...tags, ...(pending ? [pending] : [])])];
    if (!all.length) return applyTagSearch([]);
    L.info("submit", all);
    applyTagSearch(all, compact);
  };

  const open = !!q.trim() && (hintLoad || hints.length > 0);
  const showActive = compact ? active : tags;

  return (
    <div class={compact ? "relative w-full" : "relative w-full max-w-md"}>
      {showActive.length > 0 && (
        <div class="mb-2 flex flex-wrap items-center gap-1.5">
          {showActive.map((t) => (
            <TagBadge
              key={t}
              tag={t}
              onRemove={() =>
                compact ? removeUrlTag(t) : setTags(tags.filter((x) => x !== t))
              }
            />
          ))}
          {compact && (
            <button
              type="button"
              class="text-xs text-zinc-500 hover:text-zinc-300"
              onClick={() => applyTagSearch([])}
            >
              Clear all
            </button>
          )}
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
          class={`w-full rounded-xl border border-zinc-800 bg-zinc-900 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-zinc-600 ${
            compact ? "py-2 pr-3 pl-10" : "py-2.5 pr-4 pl-10"
          }`}
          placeholder="Search tags…"
          value={q}
          autoComplete="off"
          onInput={(e) => setQ((e.target as HTMLInputElement).value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            if (hints[0]) appendTag(hints[0].value);
            else submit();
          }}
        />
      </div>
      {open && (
        <ul class="absolute top-full right-0 left-0 z-30 mt-1 max-h-48 overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-200 shadow-xl shadow-black/50">
          {hintLoad && !hints.length ? (
            <li class="px-3 py-2 text-sm text-zinc-500">Searching…</li>
          ) : (
            hints.map((h) => (
              <li key={h.value}>
                <button
                  type="button"
                  class="w-full px-3 py-1.5 text-left text-sm text-zinc-300 hover:bg-zinc-800"
                  onClick={() => appendTag(h.value)}
                >
                  <Highlight label={h.label} q={q.trim()} />
                </button>
              </li>
            ))
          )}
        </ul>
      )}
      {!compact && (
        <button
          type="button"
          disabled={loading || (!tags.length && !q.trim())}
          class="mt-4 w-full rounded-xl border border-zinc-600 bg-zinc-800 py-2.5 text-sm font-semibold text-zinc-100 hover:bg-zinc-700 disabled:opacity-40"
          onClick={submit}
        >
          {loading ? "Loading..." : "Start doomscrolling"}
        </button>
      )}
    </div>
  );
}
