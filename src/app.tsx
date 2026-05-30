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

  if (feed.phase === "search") return <TagSearch />;

  return (
    <AppShell view={view} onView={setView}>
      {(feed.phase === "boot" || view === "home") && (
        <Feed
          posts={feed.posts}
          idx={feed.idx}
          liked={feed.likedIds}
          saved={feed.savedIds}
          loading={feed.loading}
          searchError={feed.searchError}
          setActive={feed.setActive}
          onLike={feed.onLike}
          onSave={feed.onSave}
        />
      )}
      {feed.phase !== "boot" && view === "saved" && <SavedPage />}
      {feed.phase !== "boot" && view === "stats" && <StatsPage />}
    </AppShell>
  );
}
