import { z } from "zod";
import { CHAMBER_KEYS, ChamberKeySchema, PRODUCT_KEYS, ProductKeySchema } from "./primitives";

// HURL format (see CLAUDE.md):
//   hurl://<product>/<chamber>/state-<n>/coherence-<nnn>
//   e.g. hurl://soulseed/identity-seed/state-37/coherence-082
const productAlternation = PRODUCT_KEYS.join("|");
const chamberAlternation = CHAMBER_KEYS.join("|");

/** Runtime pattern for a HURL path string, derived from the closed key enums. */
export const HURL_PATTERN = new RegExp(
  `^hurl://(${productAlternation})/(${chamberAlternation})/state-(\\d+)/coherence-(\\d+)$`
);

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
