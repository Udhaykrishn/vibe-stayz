"use server";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { safePath } from "./preview";
/** Turns preview off and returns to wherever the editor pressed the button. */
export async function exitPreview(formData: FormData) {
  const draft = await draftMode();
  draft.disable();
  redirect(safePath(formData.get("back")?.toString(), "/admin/preview"));
}
