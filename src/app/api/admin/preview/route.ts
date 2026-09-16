import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-request";
import { previewPath } from "@/lib/preview";
/**
 * The way into preview. `?path=/about` turns Draft Mode on and hands the browser to
 * that public page, so every link followed from there stays in preview. Leaving again
 * is a POST — see `exitPreview` in src/lib/preview-actions.ts.
 */
export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const path = previewPath(new URL(request.url).searchParams.get("path"));
  const draft = await draftMode();
  draft.enable();
  redirect(path);
}
