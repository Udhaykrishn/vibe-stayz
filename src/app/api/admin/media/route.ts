import { runtime } from "@/lib/env";
import { storageUrl } from "@/lib/media";
import { requireAdmin } from "@/lib/admin-request";
import type { Media } from "@/types";
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const result = await runtime()
    .supabase.from("media")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (result.error)
    return Response.json(
      { error: "We couldn’t load your library." },
      { status: 503 },
    );
  return Response.json(
    (result.data as Media[]).map((item) => ({
      ...item,
      url: storageUrl(item),
    })),
  );
}
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    if (Number(request.headers.get("content-length")) > 9 * 1024 * 1024)
      return Response.json(
        { error: "Please choose an image smaller than 8 MB." },
        { status: 413 },
      );
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size > 8 * 1024 * 1024)
      return Response.json(
        { error: "Choose a JPEG, PNG or WebP image under 8 MB." },
        { status: 400 },
      );
    const bytes = new Uint8Array(await file.arrayBuffer());
    const head = String.fromCharCode(...bytes.slice(0, 12));
    const mime =
      bytes[0] === 255 && bytes[1] === 216
        ? "image/jpeg"
        : bytes[0] === 137 && head.slice(1, 4) === "PNG"
          ? "image/png"
          : head.startsWith("RIFF") && head.slice(8, 12) === "WEBP"
            ? "image/webp"
            : null;
    if (!mime)
      return Response.json(
        { error: "Only JPEG, PNG and WebP images are supported." },
        { status: 415 },
      );
    const id = crypto.randomUUID();
    const env = runtime();
    const extension = mime === "image/jpeg" ? "jpg" : mime.split("/")[1];
    const object_key = `images/${id}.${extension}`;
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
    return Response.json({ ok: true, id, url: storageUrl(record) });
  } catch (error) {
    console.error("Image upload failed", error);
    return Response.json(
      { error: "We couldn’t upload this image. Please try again." },
      { status: 503 },
    );
  }
}
