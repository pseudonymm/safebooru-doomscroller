import { Bookmark, ExternalLink, Heart } from "lucide-react";
import type { Post } from "@/types/fetcher";
import { parseTags } from "@/lib/recommendation";

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
    <article className="feed-item relative flex h-full w-full items-center justify-center bg-black">
      <img className="feed-media max-h-full max-w-full object-contain" src={src} alt="" loading="lazy" decoding="async" />
      <a
        href={orig}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-lg bg-black/50 px-3 py-1.5 text-xs text-zinc-100 backdrop-blur hover:bg-black/70"
      >
        <ExternalLink size={14} />
        Open original image
      </a>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pb-8">
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span key={t} className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-zinc-200">
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="absolute right-4 bottom-24 flex flex-col gap-3">
        <button
          type="button"
          aria-label={liked ? "Unlike" : "Like"}
          className={`flex h-12 w-12 items-center justify-center rounded-full backdrop-blur transition ${
            liked ? "bg-rose-500/90 text-white" : "bg-black/40 text-white hover:bg-black/60"
          }`}
          onClick={onLike}
        >
          <Heart className={`h-6 w-6 ${liked ? "fill-current" : ""}`} />
        </button>
        <button
          type="button"
          aria-label="Save"
          className={`flex h-12 w-12 items-center justify-center rounded-full backdrop-blur transition ${
            saved ? "bg-amber-500/90 text-white" : "bg-black/40 text-white hover:bg-black/60"
          }`}
          onClick={onSave}
        >
          <Bookmark className={`h-6 w-6 ${saved ? "fill-current" : ""}`} />
        </button>
      </div>
    </article>
  );
}
