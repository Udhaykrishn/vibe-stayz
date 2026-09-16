import { z } from "zod";
import { cms } from "./cms-config";
import { validMapEmbed } from "./maps";
export const safeLink = (value: string) =>
  !value ||
  /^\/(?!\/)[^\s\\]*$/.test(value) ||
  /^https:\/\/[^\s\\]+$/i.test(value);
export const safeImage = (value: string) =>
  !value ||
  /^\/(images|media)\/[^\s\\]+$/.test(value) ||
  /^https:\/\/[^\s\\]+$/i.test(value);
export function validateFields(entity: string, input: unknown) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of cms[entity].groups.flatMap((g) => g.fields)) {
    if (["highlights", "rules"].includes(field.key)) continue;
    let validator: z.ZodTypeAny;
    if (field.type === "checkbox")
      validator = z
        .union([z.boolean(), z.literal(0), z.literal(1)])
        .transform((x) => (x ? 1 : 0));
    else if (field.type === "decimal") {
      const limit = field.key === "latitude" ? 90 : 180;
      validator = z.number().finite().min(-limit).max(limit).nullable();
    } else if (field.type === "number") {
      let n = z
        .number()
        .int()
        .min(0)
        .max(field.key === "starting_price" ? 10000000 : 10000);
      if (field.key === "rating") n = z.number().int().min(1).max(5);
      if (field.key === "max_guests") n = z.number().int().min(1).max(1000);
      validator = field.required ? n : n.nullable();
    } else {
      let s = z
        .string()
        .trim()
        .max(field.type === "textarea" ? 20000 : 1000);
      if (field.required) s = s.min(1, "This field is required.");
      validator = s;
      if (field.type === "select" && field.options)
        validator = s.refine(
          (v) => field.options!.includes(v),
          "Select a valid option.",
        );
      if (field.key === "slug")
        validator = s
          .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Use lowercase words separated by hyphens.",
          )
          .max(120);
      if (field.type === "image")
        validator = s.refine(
          safeImage,
          "Enter an image URL beginning with https://, /images/ or /media/.",
        );
      if (field.key === "map_embed_url") validator = s.refine(validMapEmbed, "Use a Google Maps embed URL, not iframe HTML.");
      if (
        [
          "url",
          "cta_url",
          "instagram",
          "facebook",
          "youtube",
          "linkedin",
          "map_url",
        ].includes(field.key)
      )
        validator = s.refine(
          safeLink,
          "Use a relative path or a secure https:// URL.",
        );
      if (field.type === "email")
        validator = s.refine(
          (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
          "Enter a valid email.",
        );
      if (["whatsapp", "whatsapp_override"].includes(field.key))
        validator = s.refine(
          (v) => !v || /^[1-9][0-9]{7,14}$/.test(v),
          "Include country code, using 8–15 digits only.",
        );
      if (field.type === "date")
        validator = s.refine(
          (v) =>
            !v ||
            (/^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0,10) === v),
          "Enter a valid date.",
        );
    }
    shape[field.key] = validator.optional();
  }
  return z.object(shape).parse(input);
}
export const gallerySchema = z
  .array(
    z.object({
      url: z.string().max(2000).refine(safeImage),
      alt: z.string().max(500),
    }),
  )
  .max(30);
export const idsSchema = z.array(z.string().min(1).max(150)).max(50);
export const offerLinksSchema = z.array(z.object({ resort_id: z.string().min(1).max(150), offer_price: z.number().int().positive().max(10000000).nullable() })).max(50).refine(rows => new Set(rows.map(r => r.resort_id)).size === rows.length, "Select each stay once.");

export const featureLinesSchema = z.string().max(10000).transform(value => value.split("\n").map(line => line.trim()).filter(Boolean)).refine(lines => lines.length <= 25, "Use at most 25 lines.");
