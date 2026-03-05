export type CoverContext = "thumb" | "small" | "cover";

export interface OptimizableMediaItem {
    cover_url?: string | null;
    cover_small_url?: string | null;
    cover_thumb_url?: string | null;
}

// Supabase Storage Transform API configuration per context
const RESIZE_PARAMS: Record<"thumb" | "small", { width: number; height: number; quality: number }> = {
    thumb: { width: 300, height: 158, quality: 75 },
    small: { width: 600, height: 315, quality: 82 },
};

/**
 * Derives an auto-resized URL from a Supabase Storage public URL by converting
 * the path to use the image transformation endpoint (`/render/image/public/`).
 *
 * Returns null if the URL is not a Supabase Storage URL (e.g. external CDN).
 */
function supabaseResizeUrl(originalUrl: string, width: number, height: number, quality: number): string | null {
    try {
        const url = new URL(originalUrl);
        // Only transform `storage/v1/object/public/` paths
        if (!url.pathname.includes("/storage/v1/object/public/")) return null;

        // Replace object path with render/image/public
        const transformedPath = url.pathname.replace(
            "/storage/v1/object/public/",
            "/storage/v1/render/image/public/"
        );
        url.pathname = transformedPath;
        url.searchParams.set("width", String(width));
        url.searchParams.set("height", String(height));
        url.searchParams.set("quality", String(quality));
        url.searchParams.set("resize", "cover");
        return url.toString();
    } catch {
        return null;
    }
}

/**
 * Returns the best image URL for the requested context, with this priority:
 * 1. Explicit `cover_small_url` / `cover_thumb_url` column in the DB (manually set).
 * 2. Auto-derived Supabase Image Transform URL from `cover_url` (zero extra uploads).
 * 3. Fallback to `cover_url` as-is.
 *
 * Context hierarchy: thumb -> small -> cover
 */
export function getOptimizedCover(item: OptimizableMediaItem | null, context: CoverContext): string | null {
    if (!item) return null;

    if (context === "thumb") {
        if (item.cover_thumb_url) return item.cover_thumb_url;
        if (item.cover_small_url) return item.cover_small_url;
        // Auto-derive via Supabase Transform
        if (item.cover_url) {
            const auto = supabaseResizeUrl(item.cover_url, RESIZE_PARAMS.thumb.width, RESIZE_PARAMS.thumb.height, RESIZE_PARAMS.thumb.quality);
            return auto ?? item.cover_url;
        }
        return null;
    }

    if (context === "small") {
        if (item.cover_small_url) return item.cover_small_url;
        // Auto-derive via Supabase Transform
        if (item.cover_url) {
            const auto = supabaseResizeUrl(item.cover_url, RESIZE_PARAMS.small.width, RESIZE_PARAMS.small.height, RESIZE_PARAMS.small.quality);
            return auto ?? item.cover_url;
        }
        return null;
    }

    // default: full cover
    return item.cover_url ?? null;
}
