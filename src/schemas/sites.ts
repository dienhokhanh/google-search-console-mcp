import { z } from "zod/v4";

import { siteUrlSchema } from "./common.js";

export const getSiteInputSchema = z.object({
  siteUrl: siteUrlSchema,
});
