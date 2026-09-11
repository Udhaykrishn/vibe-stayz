import { ZodError } from "zod";
import { cms } from "@/lib/cms-config";
import { runtime } from "@/lib/env";
import { validateFields, gallerySchema, idsSchema } from "@/lib/validation";
import { requireAdmin } from "@/lib/admin-request";
type Context = { params: Promise<{ entity: string }> };
const usable = (entity: string) => !!cms[entity];
async function replace(
  table: string,
  column: string,
  id: string,
  records: Record<string, unknown>[],
) {
  const db = runtime().supabase;
  const removed = await db.from(table).delete().eq(column, id);
  if (removed.error) throw removed.error;
  if (records.length) {
    const added = await db.from(table).insert(records);
    if (added.error) throw added.error;
  }
}
export async function POST(request: Request, { params }: Context) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { entity } = await params;
  if (!usable(entity))
    return Response.json({ error: "Unknown content type." }, { status: 404 });
  try {
    if (Number(request.headers.get("content-length")) > 150000)
      return Response.json(
        { error: "This content is too large." },
        { status: 413 },
      );
    const body = (await request.json()) as {
      id?: string;
      fields: Record<string, unknown>;
      gallery?: unknown;
      amenity_ids?: unknown;
      resort_ids?: unknown;
    };
    const id =
      entity === "site_settings" ? "global" : body.id || crypto.randomUUID();
    if (!/^[a-zA-Z0-9_-]{1,150}$/.test(id))
      return Response.json({ error: "Invalid record." }, { status: 400 });
    const fields = validateFields(entity, body.fields) as Record<
      string,
      string | number | null
    >;
    const db = runtime().supabase;
    const current = await db
      .from(entity)
      .select("id")
      .eq("id", id)
      .maybeSingle();
    if (current.error) throw current.error;
    if (!current.data) {
      for (const field of cms[entity].groups
        .flatMap((group) => group.fields)
        .filter((field) => field.required))
        if (fields[field.key] === undefined || fields[field.key] === "")
          return Response.json(
            {
              error: `${field.label} is required.`,
              fields: { [field.key]: "This field is required." },
            },
            { status: 422 },
          );
    }
    if (
      entity === "offers" &&
      fields.start_date &&
      fields.end_date &&
      String(fields.end_date) < String(fields.start_date)
    )
      return Response.json(
        {
          error: "The end date must be on or after the start date.",
          fields: { end_date: "Choose a later date." },
        },
        { status: 422 },
      );
    if (entity === "testimonials" && fields.resort_id === "")
      fields.resort_id = null;
    fields.updated_at = new Date().toISOString();
    const saved = await db.from(entity).upsert({ id, ...fields });
    if (saved.error) throw saved.error;
    if (entity === "resorts") {
      if (body.gallery !== undefined) {
        const gallery = gallerySchema.parse(body.gallery);
        await replace(
          "resort_images",
          "resort_id",
          id,
          gallery.map((image, index) => ({
            id: crypto.randomUUID(),
            resort_id: id,
            url: image.url,
            alt: image.alt,
            display_order: index,
          })),
        );
      }
      if (body.amenity_ids !== undefined) {
        const ids = [...new Set(idsSchema.parse(body.amenity_ids))];
        await replace(
          "resort_amenities",
          "resort_id",
          id,
          ids.map((amenity_id) => ({ resort_id: id, amenity_id })),
        );
      }
      for (const [field, kind] of [
        ["highlights", "highlight"],
        ["rules", "rule"],
      ] as const) {
        if (body.fields[field] !== undefined) {
          if (
            typeof body.fields[field] !== "string" ||
            body.fields[field].length > 10000
          )
            throw new Error("Invalid property content");
          const lines = body.fields[field]
            .split("\n")
            .map((value) => value.trim())
            .filter(Boolean)
            .slice(0, 25);
          const removed = await db
            .from("resort_features")
            .delete()
            .eq("resort_id", id)
            .eq("kind", kind);
          if (removed.error) throw removed.error;
          if (lines.length) {
            const added = await db
              .from("resort_features")
              .insert(
                lines.map((text, index) => ({
                  id: crypto.randomUUID(),
                  resort_id: id,
                  kind,
                  text,
                  display_order: index,
                })),
              );
            if (added.error) throw added.error;
          }
        }
      }
    }
    if (entity === "offers" && body.resort_ids !== undefined) {
      const ids = [...new Set(idsSchema.parse(body.resort_ids))];
      await replace(
        "offer_resorts",
        "offer_id",
        id,
        ids.map((resort_id) => ({ offer_id: id, resort_id })),
      );
    }
    return Response.json({ ok: true, id });
  } catch (error) {
    if (error instanceof ZodError) {
      const fields = Object.fromEntries(
        error.issues.map((issue) => [issue.path.join("."), issue.message]),
      );
      return Response.json(
        { error: "Please check the highlighted fields.", fields },
        { status: 422 },
      );
    }
    console.error("CMS save failed", error);
    const message = String(error).toLowerCase();
    return Response.json(
      {
        error:
          message.includes("duplicate") || message.includes("unique")
            ? "That page slug is already in use. Choose a different one."
            : message.includes("foreign key")
              ? "A linked destination or resort no longer exists. Refresh and select it again."
              : "We couldn’t save your changes. Your form is still here; please try again.",
      },
      { status: 409 },
    );
  }
}
export async function DELETE(request: Request, { params }: Context) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { entity } = await params;
  if (!usable(entity) || ["site_settings", "page_content"].includes(entity))
    return Response.json(
      { error: "This content cannot be deleted." },
      { status: 400 },
    );
  try {
    const { id } = (await request.json()) as { id: string };
    if (!id)
      return Response.json({ error: "Select a record." }, { status: 400 });
    const db = runtime().supabase;
    const result =
      entity === "resorts"
        ? await db
            .from("resorts")
            .update({
              archived: 1,
              published: 0,
              updated_at: new Date().toISOString(),
            })
            .eq("id", id)
        : entity === "locations"
          ? await db
              .from("locations")
              .update({ published: 0, updated_at: new Date().toISOString() })
              .eq("id", id)
          : await db.from(entity).delete().eq("id", id);
    if (result.error) throw result.error;
    return Response.json({ ok: true });
  } catch (error) {
    console.error("CMS removal failed", error);
    return Response.json(
      {
        error: "This item is in use or could not be removed. Please try again.",
      },
      { status: 409 },
    );
  }
}
