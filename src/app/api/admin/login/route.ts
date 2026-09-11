import { cookies } from "next/headers";
import { runtime } from "@/lib/env";
import { checkPassword, randomToken, sha256 } from "@/lib/auth";
import { initializeContent } from "@/lib/seed";
export async function POST(request: Request) {
  const env = runtime();
  if (!env.ADMIN_PASSWORD_HASH)
    return Response.json(
      {
        error:
          "Admin access has not been configured. Set the server admin credentials first.",
      },
      { status: 503 },
    );
  try {
    if (Number(request.headers.get("content-length")) > 4096)
      return Response.json(
        { error: "Invalid sign-in request." },
        { status: 413 },
      );
    const { username, password } = (await request.json()) as {
      username: string;
      password: string;
    };
    if (
      typeof password !== "string" ||
      password.length > 256 ||
      typeof username !== "string"
    )
      return Response.json(
        { error: "Please enter your username and password." },
        { status: 400 },
      );
    await initializeContent(env);
    const now = Date.now();
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const key = await sha256(ip);
    const reset = now + 15 * 60 * 1000;
    const attemptResult = await env.supabase
      .from("login_attempts")
      .select("attempts,reset_at")
      .eq("key", key)
      .maybeSingle();
    if (attemptResult.error) throw attemptResult.error;
    const attempts =
      !attemptResult.data || Number(attemptResult.data.reset_at) < now
        ? 1
        : Number(attemptResult.data.attempts) + 1;
    const attemptWrite = await env.supabase
      .from("login_attempts")
      .upsert({
        key,
        attempts,
        reset_at:
          Number(attemptResult.data?.reset_at) < now
            ? reset
            : attemptResult.data?.reset_at || reset,
      });
    if (attemptWrite.error) throw attemptWrite.error;
    if (attempts > 8)
      return Response.json(
        { error: "Too many sign-in attempts. Please try again in 15 minutes." },
        { status: 429, headers: { "Retry-After": "900" } },
      );
    const valid = await checkPassword(password, env.ADMIN_PASSWORD_HASH);
    if (!valid || username !== (env.ADMIN_USERNAME || "admin"))
      return Response.json(
        { error: "The username or password is incorrect." },
        { status: 401 },
      );
    const token = randomToken();
    const session = await env.supabase
      .from("admin_sessions")
      .insert({
        token_hash: await sha256(token),
        created_at: now,
        expires_at: now + 8 * 3600 * 1000,
      });
    if (session.error) throw session.error;
    await Promise.all([
      env.supabase.from("admin_sessions").delete().lt("expires_at", now),
      env.supabase
        .from("login_attempts")
        .delete()
        .or(`key.eq.${key},reset_at.lt.${now}`),
    ]);
    const store = await cookies();
    store.set("vibe_admin", token, {
      httpOnly: true,
      secure: new URL(request.url).protocol === "https:",
      sameSite: "strict",
      path: "/",
      maxAge: 8 * 3600,
    });
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Admin login failed", error);
    return Response.json(
      { error: "We couldn’t sign you in. Please try again." },
      { status: 503 },
    );
  }
}
