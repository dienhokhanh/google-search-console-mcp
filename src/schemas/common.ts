import { z } from "zod/v4";

export const emptyInputSchema = z.object({});

export const siteUrlSchema = z
  .string()
  .trim()
  .min(1)
  .refine(
    (value) => value.startsWith("sc-domain:") || URL.canParse(value),
    "Expected a Search Console property URL or an sc-domain: property.",
  )
  .describe(
    'Search Console property, such as "sc-domain:example.com" or "https://www.example.com/".',
  );

export const sitemapUrlSchema = z.url().describe("Absolute URL of the sitemap.");
