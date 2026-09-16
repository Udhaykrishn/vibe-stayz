import { ZodError } from "zod";
import { cms } from "@/lib/cms-config";
import { runtime } from "@/lib/env";
import { validateFields, gallerySchema, idsSchema, offerLinksSchema, featureLinesSchema } from "@/lib/validation";
import { requireAdmin } from "@/lib/admin-request";
type Context = { params: Promise<{ entity: string }> };
const usable = (entity: string) => !!cms[entity];
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
      offer_links?: unknown;
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
    fields.updated_at = new Date().toISOString();
    if (entity === "offers") {
      if (fields.location_id === "") fields.location_id = null;
      const links = body.offer_links !== undefined ? offerLinksSchema.parse(body.offer_links) : body.resort_ids !== undefined ? idsSchema.parse(body.resort_ids).map(resort_id => ({ resort_id, offer_price: null })) : null;
      const previous = await db.from("offers").select("*").eq("id", id).maybeSingle();
      if (previous.error) throw previous.error;
      const merged = { ...previous.data, ...fields };
      if (merged.cta_type === "custom" && !merged.cta_url) return Response.json({ error: "Add a destination for the custom button." }, { status: 422 });
      if (links) {
        const stays = await db.from("resorts").select("id,location_id,starting_price").in("id", links.map(l => l.resort_id));
        if (stays.error) throw stays.error;
        if (links.some(l => { const r = stays.data.find(r => r.id === l.resort_id); return !r || (merged.location_id && r.location_id !== merged.location_id) || (l.offer_price !== null && (r.starting_price === null || l.offer_price >= r.starting_price)); })) return Response.json({ error: "Every selected stay must match the destination. Offer prices must be below each stay’s base price." }, { status: 422 });
      }
      const result = await db.rpc("save_offer", { p_id: id, p_fields: fields, p_links: links });
      if (result.error) throw result.error;
      return Response.json({ ok: true, id });
    }
    if (entity === "resorts") {
      // Validate every relation before performing any write. The RPC commits them together.
      const gallery = body.gallery === undefined ? null : gallerySchema.parse(body.gallery);
      const amenities = body.amenity_ids === undefined ? null : [...new Set(idsSchema.parse(body.amenity_ids))];
      const highlights = body.fields.highlights === undefined ? null : featureLinesSchema.parse(body.fields.highlights);
      const rules = body.fields.rules === undefined ? null : featureLinesSchema.parse(body.fields.rules);
      const saved = await db.rpc("save_resort", {
        p_id: id, p_fields: fields, p_gallery: gallery, p_amenities: amenities,
        p_highlights: highlights, p_rules: rules,
      });
      if (saved.error) throw saved.error;
    } else {
      const saved = current.data
        ? await db.from(entity).update(fields).eq("id", id)
        : await db.from(entity).insert({ id, ...fields });
      if (saved.error) throw saved.error;
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
    const message = (error && typeof error === "object" && "message" in error ? String(error.message) : String(error)).toLowerCase();
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
    if (entity === "locations") {
      // A destination is only removable once nothing points at it: the resorts
      // foreign key is ON DELETE RESTRICT, so the database would reject it anyway.
      const inUse = await db
        .from("resorts")
        .select("name", { count: "exact" })
        .eq("location_id", id)
        .order("name")
        .limit(3);
      if (inUse.error) throw inUse.error;
      const count = inUse.count ?? inUse.data.length;
      if (count) {
        const names = inUse.data.map((r) => r.name).join(", ");
        return Response.json(
          {
            error: `${count} ${count === 1 ? "stay" : "stays"} still belong to this destination (${names}${count > inUse.data.length ? ", …" : ""}). Archived stays count too. Move ${count === 1 ? "it" : "them"} to another destination first, then delete this one.`,
          },
          { status: 409 },
        );
      }
      const removed = await db.from("locations").delete().eq("id", id);
      if (removed.error) throw removed.error;
      return Response.json({ ok: true });
    }
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
