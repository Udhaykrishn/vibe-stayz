import { cookies } from "next/headers";
import { sessionValid } from "./auth";
export async function requireAdmin() {
  const token = (await cookies()).get("vibe_admin")?.value;
  try {
    if (await sessionValid(token)) return null;
  } catch {}
  return Response.json({ error: "Please sign in again." }, { status: 401 });
}
