import { z } from "zod/v4";

import { sitemapUrlSchema, siteUrlSchema } from "./common.js";

export const listSitemapsInputSchema = z.object({
  siteUrl: siteUrlSchema,
  sitemapIndex: sitemapUrlSchema
    .optional()
    .describe("Optional sitemap index URL used to filter results."),
});

export const sitemapInputSchema = z.object({
  siteUrl: siteUrlSchema,
  sitemapUrl: sitemapUrlSchema,
});
