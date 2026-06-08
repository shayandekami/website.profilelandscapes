import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

/**
 * Edge-runtime middleware. Uses ONLY the edge-safe authConfig (no DB).
 * The real Credentials provider lives in lib/auth.ts and is loaded by
 * the Node-runtime auth handlers (/api/auth/[...nextauth]).
 */
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isAdminPath = req.nextUrl.pathname.startsWith("/admin");
  const isLoginPath = req.nextUrl.pathname === "/admin/login";

  if (isAdminPath && !isLoginPath && !req.auth) {
    const url = new URL("/admin/login", req.nextUrl.origin);
    url.searchParams.set("from", req.nextUrl.pathname);
    return Response.redirect(url);
  }
  if (isLoginPath && req.auth) {
    return Response.redirect(new URL("/admin", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
