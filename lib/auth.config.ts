import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config. Used by middleware.ts (which runs in the Edge
 * Runtime where Postgres / Node-only modules are not available).
 *
 * The full config in lib/auth.ts extends this with the Credentials provider
 * that talks to the DB.
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  trustHost: true,
  providers: [], // populated in lib/auth.ts (Credentials + Microsoft Entra)
  callbacks: {
    authorized({ auth, request }) {
      const isAdmin = request.nextUrl.pathname.startsWith("/admin");
      const isLoginPage = request.nextUrl.pathname === "/admin/login";
      if (!isAdmin) return true;
      if (isLoginPage) return true;
      return !!auth?.user;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id?: string }).id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) session.user.id = String(token.id);
      if (token.role) {
        session.user.role = token.role as typeof session.user.role;
      }
      return session;
    },
  },
};
