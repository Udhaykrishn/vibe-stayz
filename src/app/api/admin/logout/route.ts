import { cookies } from "next/headers";
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
  return Response.json({ ok: true });
}
