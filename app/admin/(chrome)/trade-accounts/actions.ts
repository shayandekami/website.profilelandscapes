"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db, tradeAccounts, auditLog } from "@/lib/db";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

const Input = z.object({
  id: z.number(),
  status: z.enum(["pending", "approved", "suspended"]).optional(),
  priceTier: z.enum(["retail", "trade", "contract"]).optional(),
});

export type Result = { ok: true } | { ok: false; error: string };

export async function updateTradeAccount(input: unknown): Promise<Result> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Not signed in" };
  const parsed = Input.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const set: Record<string, unknown> = {};
  if (parsed.data.status) set.status = parsed.data.status;
  if (parsed.data.priceTier) set.priceTier = parsed.data.priceTier;
  if (Object.keys(set).length === 0) return { ok: false, error: "Nothing to update" };

  await db.update(tradeAccounts).set(set).where(eq(tradeAccounts.id, parsed.data.id));
  await db.insert(auditLog).values({
    userId: Number(session.user.id),
    action: "trade_account.update",
    resource: "trade_account",
    resourceId: String(parsed.data.id),
    meta: set,
  });
  revalidatePath("/admin/trade-accounts");
  return { ok: true };
}
