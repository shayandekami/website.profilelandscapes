import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

/**
 * Edge-runtime middleware. Uses ONLY the edge-safe authConfig (no DB).
 * The real Credentials provider lives in lib/auth.ts and is loaded by
 * the Node-runtime auth handlers (/api/auth/[...nextauth]).
 */
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const path = req.nextUrl.pathname;
  const isAdminPage = path.startsWith("/admin");
  const isAdminApi = path.startsWith("/api/admin");
  const isLoginPath = path === "/admin/login";
  const isSetupPath = path === "/admin/setup";
  // /admin/setup is public: the zero-users check + redirect lives in the
  // setup/login pages (Node runtime — the edge middleware has no DB access).
  const isPublicAuthPath = isLoginPath || isSetupPath;

  // Backstop for admin APIs: unauthenticated calls get 401 JSON here, so a route
  // that forgets its own auth() check is never silently exposed.
  if (isAdminApi && !req.auth) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (isAdminPage && !isPublicAuthPath && !req.auth) {
    const url = new URL("/admin/login", req.nextUrl.origin);
    url.searchParams.set("from", path);
    return Response.redirect(url);
  }
  if (isLoginPath && req.auth) {
    return Response.redirect(new URL("/admin", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
