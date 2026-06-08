"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db, quotes, auditLog } from "@/lib/db";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

const Input = z.object({
  id: z.number(),
  status: z.enum(["new", "in_reply", "site_visit", "won", "lost", "out_of_scope"]),
  notes: z.string().max(10000).optional(),
});

export type SaveResult = { ok: true } | { ok: false; error: string };

export async function saveQuote(input: unknown): Promise<SaveResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Not signed in" };

  const parsed = Input.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  await db
    .update(quotes)
    .set({ status: parsed.data.status, notes: parsed.data.notes || null })
    .where(eq(quotes.id, parsed.data.id));

  await db.insert(auditLog).values({
    userId: Number(session.user.id),
    action: "quote.update",
    resource: "quote",
    resourceId: String(parsed.data.id),
    meta: { status: parsed.data.status },
  });

  revalidatePath("/admin/quotes");
  revalidatePath(`/admin/quotes/${parsed.data.id}`);
  return { ok: true };
}
