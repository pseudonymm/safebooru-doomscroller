"use client";

import { useEffect, useRef, useState } from "react";
import { loadRec } from "@/lib/recommendation";
import { isNerd, setNerd } from "@/lib/nerd";
import { exportFeedData, importFeedData, resetFeedData } from "@/lib/store/backup";
import { loadStats, type Stats } from "@/lib/store/stats";
import { visitedCount } from "@/lib/store/visited";
import { loadSaved } from "@/lib/store/saved";
import { loadLiked } from "@/lib/store/liked";

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
  const [nerd, setNerdOn] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setStats(loadStats());
    setNerdOn(isNerd());
    const rec = loadRec();
    setTop(
      rec
        ? [...rec.weights.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)
        : []
    );
  }, []);

  if (!stats)
    return <div className="flex h-full items-center justify-center text-zinc-500 text-sm">Loading...</div>;

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

  const dl = () => {
    const blob = new Blob([exportFeedData()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `sbd-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const onImport = (f: File) => {
    const r = new FileReader();
    r.onload = () => {
      try {
        importFeedData(String(r.result));
        location.reload();
      } catch {
        alert("Invalid backup file");
      }
    };
    r.readAsText(f);
  };

  return (
    <div className="stats-page h-full overflow-y-auto bg-black px-6 py-8 text-zinc-100">
      <h1 className="text-2xl font-semibold">Stats</h1>
      <p className="mt-1 text-sm text-zinc-500">Your doomscroll metrics</p>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={nerd}
            onChange={(e) => {
              setNerd(e.target.checked);
              setNerdOn(e.target.checked);
            }}
            className="rounded border-zinc-600"
          />
          Nerd mode
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm hover:bg-zinc-900"
            onClick={dl}
          >
            Export data
          </button>
          <button
            type="button"
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm hover:bg-zinc-900"
            onClick={() => fileRef.current?.click()}
          >
            Import data
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImport(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            className="rounded-lg border border-rose-900/60 px-3 py-1.5 text-sm text-rose-400 hover:bg-rose-950/40"
            onClick={() => {
              if (confirm("Reset all feed data? This cannot be undone.")) {
                resetFeedData();
                location.reload();
              }
            }}
          >
            Reset all
          </button>
        </div>
      </div>

      <dl className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([k, v]) => (
          <div key={k} className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
            <dt className="text-xs text-zinc-500">{k}</dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
      {top.length > 0 && (
        <section className="mt-10">
          <h2 className="text-sm font-medium text-zinc-400">Top tag weights</h2>
          <ul className="mt-3 space-y-2">
            {top.map(([tag, w]) => (
              <li key={tag} className="flex items-center justify-between rounded-lg bg-zinc-950 px-3 py-2 text-sm">
                <span className="text-zinc-200">{tag}</span>
                <span className="tabular-nums text-zinc-500">{w.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
