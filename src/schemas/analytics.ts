import { z } from "zod/v4";

import { siteUrlSchema } from "./common.js";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected a date in YYYY-MM-DD format.");

const filterSchema = z.object({
  dimension: z.enum(["country", "device", "page", "query", "searchAppearance"]),
  operator: z
    .enum(["contains", "equals", "notContains", "notEquals", "includingRegex", "excludingRegex"])
    .default("equals"),
  expression: z.string().min(1),
});

export const querySearchAnalyticsInputSchema = z
  .object({
    siteUrl: siteUrlSchema,
    startDate: dateSchema.describe("Inclusive start date."),
    endDate: dateSchema.describe("Inclusive end date."),
    dimensions: z
      .array(z.enum(["country", "device", "page", "query", "searchAppearance", "date", "hour"]))
      .max(7)
      .optional(),
    type: z.enum(["web", "image", "video", "news", "discover", "googleNews"]).default("web"),
    dimensionFilterGroups: z
      .array(
        z.object({
          groupType: z.literal("and").default("and"),
          filters: z.array(filterSchema).min(1),
        }),
      )
      .optional(),
    aggregationType: z.enum(["auto", "byPage", "byProperty", "byNewsShowcasePanel"]).optional(),
    dataState: z.enum(["final", "all", "hourly_all"]).default("final"),
    rowLimit: z.number().int().min(1).max(25_000).default(1_000),
    startRow: z.number().int().min(0).default(0),
  })
  .refine((value) => value.startDate <= value.endDate, {
    message: "startDate must be on or before endDate.",
    path: ["startDate"],
  });
