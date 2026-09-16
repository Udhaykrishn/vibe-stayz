import { runtime } from "@/lib/env";
import { requireAdmin } from "@/lib/admin-request";
import { mediaPath, mediaUsage, usageTotal } from "@/lib/media";
import type { Media } from "@/types";
const LIMIT = 8 * 1024 * 1024;
const isId = (value: unknown) =>
  typeof value === "string" && /^[a-f0-9-]{36}$/.test(value);
const oversize = (request: Request) =>
  Number(request.headers.get("content-length")) > LIMIT + 1024 * 1024;
const tooLarge = () =>
  Response.json(
    { error: "Please choose an image smaller than 8 MB." },
    { status: 413 },
  );
const unavailable = (message: string) =>
  Response.json({ error: message }, { status: 503 });
/** Read the uploaded photograph, trusting the bytes rather than the stated type. */
function readPicture(file: unknown) {
  if (!(file instanceof File) || file.size > LIMIT)
    return Response.json(
      { error: "Choose a JPEG, PNG or WebP image under 8 MB." },
      { status: 400 },
    );
  return file;
}
function sniff(bytes: Uint8Array) {
  const head = String.fromCharCode(...bytes.slice(0, 12));
  return bytes[0] === 255 && bytes[1] === 216
    ? "image/jpeg"
    : bytes[0] === 137 && head.slice(1, 4) === "PNG"
      ? "image/png"
      : head.startsWith("RIFF") && head.slice(8, 12) === "WEBP"
        ? "image/webp"
        : null;
}
const extensionFor = (mime: string) =>
  mime === "image/jpeg" ? "jpg" : mime.split("/")[1];
const unsupported = () =>
  Response.json(
    { error: "Only JPEG, PNG and WebP images are supported." },
    { status: 415 },
  );
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const result = await runtime()
    .supabase.from("media")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (result.error) return unavailable("We couldn’t load your library.");
  return Response.json(
    (result.data as Media[]).map((item) => ({
      ...item,
      url: mediaPath(item.id),
    })),
  );
}
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    if (oversize(request)) return tooLarge();
    const form = await request.formData();
    const file = readPicture(form.get("file"));
    if (file instanceof Response) return file;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const mime = sniff(bytes);
    if (!mime) return unsupported();
    const id = crypto.randomUUID();
    const env = runtime();
    const object_key = `images/${id}.${extensionFor(mime)}`;
    const uploaded = await env.supabase.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .upload(object_key, bytes, { contentType: mime, upsert: false });
    if (uploaded.error) throw uploaded.error;
    const record: Media = {
      id,
      object_key,
      filename: file.name.slice(0, 200),
      content_type: mime,
      size: file.size,
      alt: String(form.get("alt") || "").slice(0, 500),
      width: Number(form.get("width")) || null,
      height: Number(form.get("height")) || null,
      created_at: new Date().toISOString(),
    };
    const inserted = await env.supabase.from("media").insert(record);
    if (inserted.error) {
      await env.supabase.storage
        .from(env.SUPABASE_STORAGE_BUCKET)
        .remove([object_key]);
      throw inserted.error;
    }
    return Response.json({ ok: true, id, url: mediaPath(id) });
  } catch (error) {
    console.error("Image upload failed", error);
    return unavailable("We couldn’t upload this image. Please try again.");
  }
}
/** Replace the photograph behind an existing library entry. The address stays the
 * same, so every page already using this image shows the new picture. */
export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    if (oversize(request)) return tooLarge();
    const form = await request.formData();
    const id = form.get("id");
    if (!isId(id))
      return Response.json({ error: "Unknown image." }, { status: 400 });
    const env = runtime();
    const current = await env.supabase
      .from("media")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (current.error) throw current.error;
    if (!current.data)
      return Response.json(
        { error: "This image is no longer in your library." },
        { status: 404 },
      );
    const previous = current.data as Media;
    const file = readPicture(form.get("file"));
    if (file instanceof Response) return file;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const mime = sniff(bytes);
    if (!mime) return unsupported();
    const object_key = `images/${id}-${Date.now().toString(36)}.${extensionFor(mime)}`;
    const uploaded = await env.supabase.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .upload(object_key, bytes, { contentType: mime, upsert: false });
    if (uploaded.error) throw uploaded.error;
    const updated = await env.supabase
      .from("media")
      .update({
        object_key,
        content_type: mime,
        size: file.size,
        filename: (file.name || previous.filename).slice(0, 200),
        width: Number(form.get("width")) || null,
        height: Number(form.get("height")) || null,
      })
      .eq("id", id);
    if (updated.error) {
      await env.supabase.storage
        .from(env.SUPABASE_STORAGE_BUCKET)
        .remove([object_key]);
      throw updated.error;
    }
    const removed = await env.supabase.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .remove([previous.object_key]);
    if (removed.error)
      console.error("Old image left in storage", previous.object_key, removed.error);
    return Response.json({ ok: true, id, url: mediaPath(String(id)) });
  } catch (error) {
    console.error("Image replacement failed", error);
    return unavailable("We couldn’t replace this image. Please try again.");
  }
}
/** Rename an image or rewrite its description. */
export async function PATCH(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = (await request.json()) as {
      id?: string;
      filename?: string;
      alt?: string;
    };
    if (!isId(body.id))
      return Response.json({ error: "Unknown image." }, { status: 400 });
    const fields: Partial<Media> = {};
    if (body.filename !== undefined) {
      const filename = body.filename.trim().slice(0, 200);
      if (!filename)
        return Response.json(
          {
            error: "Give this image a file name.",
            fields: { filename: "A file name is required." },
          },
          { status: 422 },
        );
      fields.filename = filename;
    }
    if (body.alt !== undefined) fields.alt = body.alt.trim().slice(0, 500);
    if (!Object.keys(fields).length)
      return Response.json({ error: "Nothing to change." }, { status: 400 });
    const updated = await runtime()
      .supabase.from("media")
      .update(fields)
      .eq("id", body.id)
      .select("id")
      .maybeSingle();
    if (updated.error) throw updated.error;
    if (!updated.data)
      return Response.json(
        { error: "This image is no longer in your library." },
        { status: 404 },
      );
    return Response.json({ ok: true, id: body.id, url: mediaPath(body.id!) });
  } catch (error) {
    console.error("Image details update failed", error);
    return unavailable("We couldn’t save these details. Please try again.");
  }
}
/** Remove an image. Images still shown on the website need `force`. */
export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = (await request.json()) as { id?: string; force?: boolean };
    if (!isId(body.id))
      return Response.json({ error: "Unknown image." }, { status: 400 });
    const env = runtime();
    const current = await env.supabase
      .from("media")
      .select("*")
      .eq("id", body.id)
      .maybeSingle();
    if (current.error) throw current.error;
    if (!current.data)
      return Response.json(
        { error: "This image is no longer in your library." },
        { status: 404 },
      );
    const places = (await mediaUsage()).get(mediaPath(body.id!)) || [];
    if (places.length && !body.force)
      return Response.json(
        {
          error: `This photograph is still shown in ${usageTotal(places)} place${usageTotal(places) === 1 ? "" : "s"}.`,
          usage: places,
        },
        { status: 409 },
      );
    const removed = await env.supabase
      .from("media")
      .delete()
      .eq("id", body.id);
    if (removed.error) throw removed.error;
    const cleared = await env.supabase.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .remove([(current.data as Media).object_key]);
    if (cleared.error)
      console.error("Deleted image left in storage", cleared.error);
    return Response.json({ ok: true, id: body.id });
  } catch (error) {
    console.error("Image delete failed", error);
    return unavailable("We couldn’t delete this image. Please try again.");
  }
}
