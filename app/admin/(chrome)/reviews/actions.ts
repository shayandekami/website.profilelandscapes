"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db, plantReviews, auditLog } from "@/lib/db";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

const Input = z.object({ id: z.number(), action: z.enum(["approve", "reject", "delete"]) });
export type Result = { ok: true } | { ok: false; error: string };

export async function moderateReview(input: unknown): Promise<Result> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Not signed in" };
  const parsed = Input.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  if (parsed.data.action === "delete" || parsed.data.action === "reject") {
    await db.delete(plantReviews).where(eq(plantReviews.id, parsed.data.id));
  } else {
    await db.update(plantReviews).set({ approved: true }).where(eq(plantReviews.id, parsed.data.id));
  }
  await db.insert(auditLog).values({
    userId: Number(session.user.id),
    action: `review.${parsed.data.action}`,
    resource: "plant_review",
    resourceId: String(parsed.data.id),
  });
  revalidatePath("/admin/reviews");
  return { ok: true };
}
