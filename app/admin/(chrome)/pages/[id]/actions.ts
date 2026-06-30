"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db, pages, pageRevisions, auditLog, type Section } from "@/lib/db";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

const Body = z.object({
  id: z.number(),
  title: z.string().min(1).max(200),
  lede: z.string().max(2000).optional(),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(400).optional(),
  status: z.enum(["draft", "live"]),
  sections: z.array(
    z.object({
      type: z.string(),
      props: z.record(z.string(), z.unknown()),
    })
  ),
});

export type SaveResult =
  | { ok: true; updatedAt: string }
  | { ok: false; error: string };

export async function savePage(input: unknown): Promise<SaveResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Not signed in" };

  const parsed = Body.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const { id, title, lede, seoTitle, seoDescription, status, sections } = parsed.data;

  // Snapshot current state into revisions before we overwrite.
  const current = await db.query.pages.findFirst({ where: eq(pages.id, id) });
  if (!current) return { ok: false, error: "Page not found" };

  await db.insert(pageRevisions).values({
    pageId: current.id,
    sections: current.sections as Section[],
    title: current.title,
    lede: current.lede,
    authorId: Number(session.user.id),
  });

  const now = new Date();
  await db
    .update(pages)
    .set({
      title,
      lede: lede || null,
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
      status,
      sections: sections as Section[],
      updatedAt: now,
      updatedById: Number(session.user.id),
      publishedAt: status === "live" ? (current.publishedAt ?? now) : current.publishedAt,
    })
    .where(eq(pages.id, id));

  await db.insert(auditLog).values({
    userId: Number(session.user.id),
    action: "pages.save",
    resource: "page",
    resourceId: String(id),
    meta: { slug: current.slug },
  });

  // Revalidate both the public page and the editor itself.
  revalidatePath(current.slug);
  revalidatePath(`/admin/pages/${id}`);

  return { ok: true, updatedAt: now.toISOString() };
}

export type RestoreResult = { ok: true } | { ok: false; error: string };

/** Restore a page to a saved revision. Snapshots the current state first, so a
 *  restore is itself undoable. */
export async function restoreRevision(input: unknown): Promise<RestoreResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Not signed in" };
  const parsed = z.object({ pageId: z.number(), revisionId: z.number() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const rev = await db.query.pageRevisions.findFirst({ where: eq(pageRevisions.id, parsed.data.revisionId) });
  const current = await db.query.pages.findFirst({ where: eq(pages.id, parsed.data.pageId) });
  if (!rev || !current || rev.pageId !== current.id) return { ok: false, error: "Revision not found" };

  // Snapshot current before overwriting (restore is undoable).
  await db.insert(pageRevisions).values({
    pageId: current.id,
    sections: current.sections as Section[],
    title: current.title,
    lede: current.lede,
    authorId: Number(session.user.id),
  });

  await db.update(pages).set({
    title: rev.title,
    lede: rev.lede,
    sections: rev.sections as Section[],
    updatedAt: new Date(),
    updatedById: Number(session.user.id),
  }).where(eq(pages.id, current.id));

  await db.insert(auditLog).values({
    userId: Number(session.user.id),
    action: "pages.restore",
    resource: "page",
    resourceId: String(current.id),
    meta: { revisionId: rev.id },
  });

  revalidatePath(current.slug);
  revalidatePath(`/admin/pages/${current.id}`);
  return { ok: true };
}
