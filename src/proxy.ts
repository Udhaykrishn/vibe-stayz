import { NextResponse, type NextRequest } from "next/server";
import { randomToken } from "@/lib/auth";
export function proxy(request: NextRequest) {
  const token = request.cookies.get("vibe_csrf")?.value || randomToken();
  if (!["GET", "HEAD"].includes(request.method)) {
    if (request.headers.get("origin") !== request.nextUrl.origin)
      return new NextResponse("Invalid request origin", { status: 403 });
    if (request.headers.get("x-csrf-token") !== token)
      return NextResponse.json(
        { error: "Your session has changed. Reload the page and try again." },
        { status: 403 },
      );
  }
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-vibe-csrf", token);
  requestHeaders.set("x-vibe-path", request.nextUrl.pathname);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  if (!request.cookies.has("vibe_csrf"))
    response.cookies.set("vibe_csrf", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: request.nextUrl.protocol === "https:",
      path: "/",
      maxAge: 28800,
    });
  if (request.nextUrl.pathname.startsWith("/admin"))
    response.cookies.set("vibe_path", request.nextUrl.pathname, {
      httpOnly: true,
      sameSite: "strict",
      secure: request.nextUrl.protocol === "https:",
      path: "/admin",
      maxAge: 300,
    });
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}
export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
