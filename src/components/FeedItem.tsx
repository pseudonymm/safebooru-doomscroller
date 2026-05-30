import { Bookmark, ExternalLink, Heart } from "lucide-react";
import type { Post } from "../types/fetcher";
import { parseTags } from "../lib/recommendation";

type Props = {
  post: Post;
  liked: boolean;
  saved: boolean;
  onLike: () => void;
  onSave: () => void;
};

export function FeedItem({ post, liked, saved, onLike, onSave }: Props) {
  const src = post.sample_url || post.file_url;
  const orig = post.file_url || post.sample_url;
  const tags = parseTags(post.tags).slice(0, 12);

  return (
    <article class="feed-item relative flex h-full w-full items-center justify-center bg-black">
      <img class="feed-media max-h-full max-w-full object-contain" src={src} alt="" loading="lazy" decoding="async" />
      <a
        href={orig}
        target="_blank"
        rel="noopener noreferrer"
        class="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-lg bg-black/50 px-3 py-1.5 text-xs text-zinc-100 backdrop-blur hover:bg-black/70"
      >
        <ExternalLink size={14} />
        Open original image
      </a>
      <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pb-8">
        <div class="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span key={t} class="rounded-md bg-white/10 px-2 py-0.5 text-xs text-zinc-200">
              {t}
            </span>
          ))}
        </div>
      </div>
      <div class="absolute right-4 bottom-24 flex flex-col gap-3">
        <button
          type="button"
          aria-label="Like"
          class={`flex h-12 w-12 items-center justify-center rounded-full backdrop-blur transition ${
            liked ? "bg-rose-500/90 text-white" : "bg-black/40 text-white hover:bg-black/60"
          }`}
          onClick={onLike}
        >
          <Heart class={`h-6 w-6 ${liked ? "fill-current" : ""}`} />
        </button>
        <button
          type="button"
          aria-label="Save"
          class={`flex h-12 w-12 items-center justify-center rounded-full backdrop-blur transition ${
            saved ? "bg-amber-500/90 text-white" : "bg-black/40 text-white hover:bg-black/60"
          }`}
          onClick={onSave}
        >
          <Bookmark class={`h-6 w-6 ${saved ? "fill-current" : ""}`} />
        </button>
      </div>
    </article>
  );
}
