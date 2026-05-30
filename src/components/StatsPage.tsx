import { useEffect, useState } from "preact/hooks";
import { loadRec } from "../lib/recommendation";
import { loadStats, type Stats } from "../lib/store/stats";
import { visitedCount } from "../lib/store/visited";
import { loadSaved } from "../lib/store/saved";
import { loadLiked } from "../lib/store/liked";

const fmt = (n: number) => n.toLocaleString();
const fmtDur = (ms: number) => {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  return h ? `${h}h ${m % 60}m` : m ? `${m}m ${s % 60}s` : `${s}s`;
};

export function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [top, setTop] = useState<[string, number][]>([]);

  useEffect(() => {
    setStats(loadStats());
    const rec = loadRec();
    setTop(
      rec
        ? [...rec.weights.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)
        : []
    );
  }, []);

  if (!stats)
    return <div class="flex h-full items-center justify-center text-zinc-500 text-sm">Loading...</div>;

  const cards: [string, string][] = [
    ["Posts viewed", fmt(stats.viewed)],
    ["Liked", fmt(stats.liked)],
    ["Saved", fmt(loadSaved().length)],
    ["Ignored (scroll-past)", fmt(stats.ignored)],
    ["Tag searches", fmt(stats.searches)],
    ["Unique posts visited", fmt(visitedCount())],
    ["Liked (stored)", fmt(loadLiked().size)],
    ["Time in app", fmtDur(stats.sessionMs)],
    ["Tracking since", new Date(stats.since).toLocaleDateString()],
  ];

  return (
    <div class="stats-page h-full overflow-y-auto bg-black px-6 py-8 text-zinc-100">
      <h1 class="text-2xl font-semibold">Stats</h1>
      <p class="mt-1 text-sm text-zinc-500">Your doomscroll metrics</p>
      <dl class="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([k, v]) => (
          <div key={k} class="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
            <dt class="text-xs text-zinc-500">{k}</dt>
            <dd class="mt-1 text-xl font-semibold tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
      {top.length > 0 && (
        <section class="mt-10">
          <h2 class="text-sm font-medium text-zinc-400">Top tag weights</h2>
          <ul class="mt-3 space-y-2">
            {top.map(([tag, w]) => (
              <li key={tag} class="flex items-center justify-between rounded-lg bg-zinc-950 px-3 py-2 text-sm">
                <span class="text-zinc-200">{tag}</span>
                <span class="tabular-nums text-zinc-500">{w.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
