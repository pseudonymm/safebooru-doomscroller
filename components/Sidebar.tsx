import { BarChart3, Bookmark, Home } from "lucide-react";

export type AppView = "home" | "saved" | "stats";

type Props = { view: AppView; onView: (v: AppView) => void };

const items: { v: AppView; icon: typeof Home; label: string }[] = [
  { v: "home", icon: Home, label: "Home" },
  { v: "saved", icon: Bookmark, label: "Saved" },
  { v: "stats", icon: BarChart3, label: "Stats" },
];

export function Sidebar({ view, onView }: Props) {
  return (
    <nav className="sidebar flex h-full w-[4.5rem] shrink-0 flex-col items-center gap-2 border-r border-zinc-800/80 bg-zinc-950 py-6">
      {items.map(({ v, icon: Icon, label }) => (
        <button
          key={v}
          type="button"
          aria-label={label}
          title={label}
          className={`flex h-12 w-12 items-center justify-center rounded-xl transition ${
            view === v ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
          }`}
          onClick={() => onView(v)}
        >
          <Icon size={22} strokeWidth={view === v ? 2.25 : 1.75} />
        </button>
      ))}
    </nav>
  );
}
