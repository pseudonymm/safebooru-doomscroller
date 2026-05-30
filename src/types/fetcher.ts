/**
 * A set of parameters for the list posts for Safebooru public API.
 */
export interface ListPostsParams {
    /**
     * How many posts you want to retrieve. There is a hard limit of 1000 posts per request.
     */
    limit?: number;
    /**
     * The page number.
     */
    pid?: number;
    /**
     * The tags to search for. Any tag combination that works on the web site will work here. This includes all the meta-tags. See cheatsheet for more information.
     */
    tags?: string;
    /**
     * Change ID of the post. This is in Unix time so there are likely others with the same value if updated at the same time.
     */
    cid?: number;
    /**
     * The post id.
     */
    id?: number;
}

/**
 * A single post returned by the Safebooru public API.
 */
export interface Post {
    /** 
     * The absolute URL pointing to the small thumbnail image.
     */
    preview_url: string;

    /** 
     * The absolute URL pointing to the medium-sized "sample" image used for web viewing.
     */
    sample_url: string;

    /** 
     * The absolute URL pointing to the original full-sized uploaded image file.
     */
    file_url: string;

    /** 
     * The internal server directory ID where the file assets are stored.
     */
    directory: number;

    /** 
     * The MD5 hash string of the original full-sized image file.
     */
    hash: string;

    /** 
     * The width of the original image file in pixels.
     */
    width: number;

    /** 
     * The height of the original image file in pixels.
     */
    height: number;

    /** 
     * The unique database ID identifier for this post.
     */
    id: number;

    /** 
     * The exact filename of the uploaded image on the server (e.g., "image.jpg").
     */
    image: string;

    /** 
     * A UNIX timestamp or incremental counter indicating when the post was last modified.
     */
    change: number;

    /** 
     * The username of the user who uploaded the post.
     */
    owner: string;

    /** 
     * The database ID of the parent post, or `0` if this post has no parent relationship.
     */
    parent_id: number;

    /** 
     * The content rating of the post. 
     * Always `"s"` (Safe) on Safebooru, but follows the standard Booru layout (`"s"`, `"q"`, `"e"`).
     */
    rating: string;

    /** 
     * Indicates whether a downscaled web sample version of the image was generated.
     */
    sample: boolean;

    /** 
     * The height of the sample image in pixels.
     */
    sample_height: number;

    /** 
     * The width of the sample image in pixels.
     */
    sample_width: number;

    /** 
     * The net upvote/downvote score of the post (commonly returned as a `number` or `string`).
     */
    score: any;

    /** 
     * A space-delimited string listing all tags associated with the post.
     */
    tags: string;

    /** 
     * The source URL or text string indicating where the image originated from.
     */
    source: string;

    /** 
     * The moderation status of the post (e.g., `"active"`, `"pending"`, `"deleted"`).
     */
    status: string;

    /** 
     * Indicates whether the image has any image notes/canvas annotations attached to it.
     */
    has_notes: boolean;

    /** 
     * The total count of user comments left on this post.
     */
    comment_count: number;
}


/**
 * A single item returned by the autocomplete for Safebooru public API.
 */
export interface AutocompleteItem {
    /**
     * The label of the tag.
     */
    label: string;
    /**
     * The value of the tag.
     */
    value: string;
}

