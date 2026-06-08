import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "./auth.config";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "owner" | "editor" | "designer" | "nursery" | "contributor";
    } & DefaultSession["user"];
  }
}

const Cred = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const entraConfigured =
  !!process.env.AZURE_CLIENT_ID &&
  !!process.env.AZURE_CLIENT_SECRET &&
  !!process.env.AZURE_TENANT_ID;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = Cred.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const { db, users } = await import("@/lib/db");
        const { eq } = await import("drizzle-orm");

        const u = await db.query.users.findFirst({
          where: eq(users.email, email),
        });
        if (!u) return null;

        const ok = await bcrypt.compare(password, u.passwordHash);
        if (!ok) return null;

        await db
          .update(users)
          .set({ lastLoginAt: new Date() })
          .where(eq(users.id, u.id));

        return {
          id: String(u.id),
          email: u.email,
          name: u.name,
          role: u.role,
        };
      },
    }),
    // Microsoft Entra ID (Azure AD) — uses the PL-Platform tenant.
    // Only registered if env vars are set.
    ...(entraConfigured
      ? [
          MicrosoftEntraID({
            clientId: process.env.AZURE_CLIENT_ID,
            clientSecret: process.env.AZURE_CLIENT_SECRET,
            issuer: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0`,
          }),
        ]
      : []),
  ],
  callbacks: {
    ...authConfig.callbacks,
    /**
     * On Microsoft Entra sign-in, look up (or auto-create) the matching row
     * in our users table. The Credentials provider already returns a populated
     * user, so this is a no-op for that path.
     */
    async signIn({ user, account }) {
      if (account?.provider !== "microsoft-entra-id") return true;
      const email = user.email?.toLowerCase();
      if (!email) return false;

      const { db, users, auditLog } = await import("@/lib/db");
      const { eq } = await import("drizzle-orm");

      let row = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (!row) {
        // Auto-provision new SSO users. Default role: editor.
        // Owner-level rights still require an existing owner to elevate them.
        const placeholderHash = await bcrypt.hash(
          Math.random().toString(36).slice(2),
          10
        );
        const [created] = await db
          .insert(users)
          .values({
            email,
            name: user.name || email.split("@")[0],
            passwordHash: placeholderHash,
            role: "editor",
            avatarInitials: (user.name || email)
              .split(/[\s.]+/)
              .map((w) => w[0])
              .slice(0, 2)
              .join("")
              .toUpperCase(),
            lastLoginAt: new Date(),
          })
          .returning();
        row = created;
        await db.insert(auditLog).values({
          userId: row.id,
          action: "user.sso_provision",
          resource: "user",
          resourceId: String(row.id),
          meta: { provider: "microsoft-entra-id", email },
        });
      } else {
        await db
          .update(users)
          .set({ lastLoginAt: new Date() })
          .where(eq(users.id, row.id));
      }

      // Stash internal id + role on the user object for the jwt callback.
      (user as { id?: string; role?: string }).id = String(row.id);
      (user as { id?: string; role?: string }).role = row.role;
      return true;
    },
  },
});
