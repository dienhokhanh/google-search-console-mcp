import { z } from "zod/v4";

import { siteUrlSchema } from "./common.js";

export const inspectUrlInputSchema = z.object({
  siteUrl: siteUrlSchema,
  inspectionUrl: z.url().describe("Fully qualified URL to inspect."),
  languageCode: z
    .string()
    .regex(/^[a-z]{2,3}(?:-[A-Z]{2})?$/, "Expected a BCP-47 language code such as en-US.")
    .optional(),
});
