export function FeedSkeleton() {
  return (
    <article className="feed-item feed-skeleton flex h-full w-full flex-col items-center justify-center gap-5 bg-black px-6 py-10">
      <div className="skeleton-shimmer aspect-[3/4] w-full max-w-sm rounded-2xl bg-zinc-900" />
      <div className="flex w-full max-w-sm flex-wrap gap-2">
        <div className="skeleton-shimmer h-6 w-20 rounded-md bg-zinc-900" />
        <div className="skeleton-shimmer h-6 w-24 rounded-md bg-zinc-900" />
        <div className="skeleton-shimmer h-6 w-16 rounded-md bg-zinc-900" />
      </div>
      <div className="absolute right-4 bottom-24 flex flex-col gap-3">
        <div className="skeleton-shimmer h-12 w-12 rounded-full bg-zinc-900" />
        <div className="skeleton-shimmer h-12 w-12 rounded-full bg-zinc-900" />
      </div>
    </article>
  );
}
