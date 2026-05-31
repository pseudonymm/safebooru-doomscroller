import { TagSearchBar } from "./TagSearchBar";

export function TagSearch() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-950 px-4 text-zinc-100">
      <h1 className="text-3xl font-bold tracking-tight">Safebooru Doomscroller</h1>
      <p className="max-w-md text-center text-sm text-zinc-400">
        Search for tags to setup your feed for the first time.
      </p>
      <TagSearchBar />
    </div>
  );
}
