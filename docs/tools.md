# Tool reference

## `gsc_list_sites`

Lists properties visible to the authenticated identity. When an allowlist is configured, only allowed properties are returned.

## `gsc_get_site`

Input:

- `siteUrl`: Search Console property identifier.

Returns the property identifier and permission level.

## `gsc_query_search_analytics`

Required input:

- `siteUrl`
- `startDate` in `YYYY-MM-DD` format
- `endDate` in `YYYY-MM-DD` format

Optional input includes dimensions, search type, filter groups, aggregation type, data state, row limit, and start row.

The API returns at most 25,000 rows per request. Use `startRow` to paginate. The server may enforce a lower limit through `GSC_MAX_ANALYTICS_ROWS`.

## `gsc_list_sitemaps`

Lists submitted sitemaps for a property. An optional `sitemapIndex` URL filters children of a sitemap index.

## `gsc_get_sitemap`

Returns details for a submitted sitemap, including last submission, warnings, errors, and content counts when available.

## `gsc_inspect_url`

Returns index status, canonical information, crawl information, discovered sitemaps, AMP data, and rich-result data when available.

This API reports the indexed version known to Google. It does not perform a live test and does not request indexing.

## `gsc_submit_sitemap`

Submits a sitemap. Available only when write tools are enabled.

## `gsc_delete_sitemap`

Removes a sitemap submission from Search Console. Available only when write tools are enabled and marked destructive in MCP tool annotations.
