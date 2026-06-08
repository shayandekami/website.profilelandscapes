"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db, orders, auditLog } from "@/lib/db";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

const OrderStatusEnum = z.enum([
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);

export async function updateOrderStatus(
  id: number,
  formData: FormData
): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");

  const statusRaw = formData.get("status");
  const parsed = OrderStatusEnum.safeParse(statusRaw);
  if (!parsed.success) {
    throw new Error("Invalid status value");
  }

  const notesRaw = (formData.get("notes") as string) || null;

  const existing = await db.query.orders.findFirst({
    where: eq(orders.id, id),
  });
  if (!existing) throw new Error("Order not found");

  await db
    .update(orders)
    .set({
      status: parsed.data,
      notes: notesRaw,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, id));

  await db.insert(auditLog).values({
    userId: Number(session.user.id),
    action: "order.update_status",
    resource: "order",
    resourceId: String(id),
    meta: {
      orderNumber: existing.orderNumber,
      previousStatus: existing.status,
      newStatus: parsed.data,
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}
