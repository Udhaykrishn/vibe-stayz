import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sessionValid } from "@/lib/auth";
export default async function Protected({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = (await cookies()).get("vibe_admin")?.value;
  let valid = false;
  try {
    valid = await sessionValid(token);
  } catch {}
  if (!valid) redirect("/admin/login");
  return children;
}
