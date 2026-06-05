import { z } from "zod";
import { ChamberKeySchema, ProductKeySchema } from "./primitives";

// HURL format (see CLAUDE.md):
//   hurl://<product>/<chamber>/state-<n>/coherence-<nnn>
//   e.g. hurl://soulseed/identity-seed/state-37/coherence-082
// Product/chamber are generic slugs — the engine does not enumerate instances.
export const HURL_PATTERN = /^hurl:\/\/([a-z0-9-]+)\/([a-z0-9-]+)\/state-(\d+)\/coherence-(\d+)$/;

/** A validated HURL path string. */
export const HurlPathSchema = z.string().regex(HURL_PATTERN, "Invalid HURL path");
export type HurlPath = z.infer<typeof HurlPathSchema>;

/** The decoded parts of a HURL. */
export const HurlPartsSchema = z.object({
  productKey: ProductKeySchema,
  chamberKey: ChamberKeySchema,
  state: z.number().int().nonnegative(),
  coherence: z.number().int().nonnegative(),
});
export type HurlParts = z.infer<typeof HurlPartsSchema>;

/** A HURL: the path string plus its decoded parts. */
export const HurlSchema = z.object({
  path: HurlPathSchema,
  parts: HurlPartsSchema,
});
export type Hurl = z.infer<typeof HurlSchema>;
