import { revalidateTag } from "next/cache";

/** Tag on every cached storefront query that reads products or categories. */
export const CATALOG_TAG = "catalog";

/**
 * Drop the cached storefront data after an admin changes the catalog, so the
 * change shows up on the very next page load instead of up to 30s later.
 * `expire: 0` rather than the "max" profile: "max" is stale-while-revalidate,
 * which would still serve the old data once - e.g. a category the admin just
 * deleted reappearing on the homepage.
 */
export function invalidateCatalog() {
  revalidateTag(CATALOG_TAG, { expire: 0 });
}
