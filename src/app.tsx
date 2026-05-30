import { useState } from "preact/hooks";
import { AppShell, type AppView } from "./components/AppShell";
import { Feed } from "./components/Feed";
import { SavedPage } from "./components/SavedPage";
import { StatsPage } from "./components/StatsPage";
import { TagSearch } from "./components/TagSearch";
import { useFeed } from "./hooks/useFeed";
import { useSession } from "./hooks/useSession";

export function App() {
  const [view, setView] = useState<AppView>("home");
  const feed = useFeed();
  useSession();

  if (feed.phase === "boot")
    return <div class="flex h-screen items-center justify-center bg-black text-zinc-500 text-sm">Loading...</div>;

  if (feed.phase === "search") return <TagSearch />;

  return (
    <AppShell view={view} onView={setView}>
      {view === "home" && (
        <Feed
          posts={feed.posts}
          idx={feed.idx}
          liked={feed.likedIds}
          saved={feed.savedIds}
          loading={feed.loading}
          setActive={feed.setActive}
          onLike={feed.onLike}
          onSave={feed.onSave}
        />
      )}
      {view === "saved" && <SavedPage />}
      {view === "stats" && <StatsPage />}
    </AppShell>
  );
}
