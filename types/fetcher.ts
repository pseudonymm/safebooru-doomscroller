export interface ListPostsParams {
    limit?: number;
    pid?: number;
    tags?: string;
    cid?: number;
    id?: number;
}

export interface Post {
    preview_url: string;
    sample_url: string;
    file_url: string;
    directory: number;
    hash: string;
    width: number;
    height: number;
    id: number;
    image: string;
    change: number;
    owner: string;
    parent_id: number;
    rating: string;
    sample: boolean;
    sample_height: number;
    sample_width: number;
    score: any;
    tags: string;
    source: string;
    status: string;
    has_notes: boolean;
    comment_count: number;
}

export interface AutocompleteItem {
    label: string;
    value: string;
}
