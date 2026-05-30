import type { Post } from "./fetcher";

/**
 * A global storage interface for the user's feed.
 */
export interface Feed {
    /**
     * The entries in the feed.
     */
    entries: FeedEntry[];
    /**
     * The posts that the user has liked.
     */
    liked: Post[];
    /**
     * The posts that the user has saved.
     */
    saved: Post[];
    /**
     * The time spent on the app in seconds.
     */
    timeSpent: number;
    /**
     * The version of the app.
     */
    version: number;
}

/**
 * A single entry in the feed.
 */
export interface FeedEntry {
    /**
     * The tag of the entry.
     */
    tag: string;
    /**
     * The weight of the entry.
     */
    weight: number;
}