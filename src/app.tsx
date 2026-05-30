import { TagSearch } from "./components/TagSearch";
import { Feed } from "./components/Feed";
import { useFeed } from "./hooks/useFeed";

export function App() {
  const { phase, posts, idx, loading, setActive, onLike, likedIds } = useFeed();

  if (phase === "boot")
    return <div class="flex h-screen items-center justify-center bg-black text-zinc-500 text-sm">Loading…</div>;

  if (phase === "search") return <TagSearch />;

  return (
    <Feed
      posts={posts}
      idx={idx}
      liked={likedIds}
      loading={loading}
      setActive={setActive}
      onLike={onLike}
    />
  );
}
