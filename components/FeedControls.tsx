import { ChevronDown, ChevronUp } from "lucide-react";

type Props = {
  idx: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
};

export function FeedControls({ idx, total, onPrev, onNext }: Props) {
  return (
    <div className="feed-controls flex flex-col gap-3">
      <button
        type="button"
        aria-label="Previous"
        disabled={idx <= 0}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/80 text-zinc-100 disabled:opacity-30"
        onClick={onPrev}
      >
        <ChevronUp className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Next"
        disabled={idx >= total - 1}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/80 text-zinc-100 disabled:opacity-30"
        onClick={onNext}
      >
        <ChevronDown className="h-5 w-5" />
      </button>
    </div>
  );
}
