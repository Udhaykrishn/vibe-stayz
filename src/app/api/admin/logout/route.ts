import { cookies, draftMode } from "next/headers";
import { runtime } from "@/lib/env";
import { sha256 } from "@/lib/auth";
export async function POST() {
  const store = await cookies();
  const token = store.get("vibe_admin")?.value;
  if (token)
    await runtime()
      .supabase.from("admin_sessions")
      .delete()
      .eq("token_hash", await sha256(token));
  store.delete("vibe_admin");
  // Signing out ends any preview too, so the next visit is the live site.
  (await draftMode()).disable();
  return Response.json({ ok: true });
}
