import { runtime } from "@/lib/env";
import { storageUrl } from "@/lib/media";
import type { Media } from "@/types";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^[a-f0-9-]{36}$/.test(id))
    return new Response("Not found", { status: 404 });
  const result = await runtime()
    .supabase.from("media")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (result.error || !result.data)
    return new Response("Not found", { status: 404 });
  return Response.redirect(storageUrl(result.data as Media), 307);
}
