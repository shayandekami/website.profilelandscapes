"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db, siteSettings, auditLog } from "@/lib/db";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

const Input = z.object({
  studio_name: z.string().min(1).max(120),
  tagline: z.string().max(200),
  phone: z.string().max(60),
  mobile: z.string().max(60).optional(),
  email: z.string().email().max(255),
  address: z.string().max(300),
  legal: z.object({
    acn: z.string().max(40),
    abn: z.string().max(40),
    licence: z.string().max(40),
    founded: z.number().int().min(1900).max(2100),
  }),
  theme_tokens: z.object({
    ink: z.string().regex(/^#[0-9a-fA-F]{3,8}$/, "Use a hex colour, e.g. #133024"),
    paper: z.string().regex(/^#[0-9a-fA-F]{3,8}$/),
    bone: z.string().regex(/^#[0-9a-fA-F]{3,8}$/),
    accent: z.string().regex(/^#[0-9a-fA-F]{3,8}$/),
    cream: z.string().regex(/^#[0-9a-fA-F]{3,8}$/),
  }),
});

export type SaveResult =
  | { ok: true; updatedAt: string }
  | { ok: false; error: string };

export async function saveSettings(input: unknown): Promise<SaveResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Not signed in" };
  if (session.user.role !== "owner" && session.user.role !== "editor") {
    return { ok: false, error: "Only owners and editors can change site settings" };
  }

  const parsed = Input.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }
  const d = parsed.data;

  const upserts: { key: string; value: unknown }[] = [
    { key: "studio_name", value: d.studio_name },
    { key: "tagline", value: d.tagline },
    { key: "phone", value: d.phone },
    { key: "mobile", value: d.mobile || "" },
    { key: "email", value: d.email },
    { key: "address", value: d.address },
    { key: "legal", value: d.legal },
    { key: "theme_tokens", value: d.theme_tokens },
  ];

  const now = new Date();
  for (const s of upserts) {
    await db
      .insert(siteSettings)
      .values(s)
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: s.value, updatedAt: now },
      });
  }

  await db.insert(auditLog).values({
    userId: Number(session.user.id),
    action: "settings.save",
    resource: "site_settings",
  });

  // Settings show up in every public page header/footer — bust the whole site.
  revalidatePath("/", "layout");

  return { ok: true, updatedAt: now.toISOString() };
}

export async function changePassword(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");

  const current = String(formData.get("current") || "");
  const next = String(formData.get("next") || "");

  if (next.length < 8) {
    throw new Error("New password must be at least 8 characters");
  }

  const { db: dbi, users } = await import("@/lib/db");
  const { eq: e } = await import("drizzle-orm");
  const bcrypt = await import("bcryptjs");

  const u = await dbi.query.users.findFirst({
    where: e(users.id, Number(session.user.id)),
  });
  if (!u) throw new Error("User not found");

  const ok = await bcrypt.compare(current, u.passwordHash);
  if (!ok) throw new Error("Current password is incorrect");

  const newHash = await bcrypt.hash(next, 10);
  await dbi.update(users).set({ passwordHash: newHash }).where(eq(users.id, u.id));

  await dbi.insert(auditLog).values({
    userId: u.id,
    action: "user.password_change",
    resource: "user",
    resourceId: String(u.id),
  });
}
