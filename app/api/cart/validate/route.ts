import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, plants } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { calcShipping } from "@/lib/commerce";
import { getTradeAccount, tierMultiplier } from "@/lib/tradeAuth";

export const dynamic = "force-dynamic";

interface CartItem {
  type: "product" | "plant";
  id: number;
  quantity: number;
}

interface ValidatedItem {
  type: "product" | "plant";
  id: number;
  name: string;
  image?: string;
  priceCents: number;
  quantity: number;
}

export async function POST(req: Request) {
  let body: { items?: CartItem[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const items: CartItem[] = body?.items ?? [];
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "No items provided" }, { status: 400 });
  }

  const errors: string[] = [];
  const validated: ValidatedItem[] = [];
  const tradeAcct = await getTradeAccount();
  const mult = tradeAcct ? tierMultiplier(tradeAcct.tier) : 1;
  const priced = (cents: number) => Math.round(cents * mult);

  for (const item of items) {
    if (!item.id || !item.type || item.quantity < 1) {
      errors.push(`Invalid item: ${JSON.stringify(item)}`);
      continue;
    }

    if (item.type === "product") {
      const [row] = await db
        .select()
        .from(products)
        .where(and(eq(products.id, item.id), eq(products.status, "live")))
        .limit(1);

      if (!row) {
        errors.push(`Product ID ${item.id} not found or unavailable`);
        continue;
      }
      if (row.stockQty < item.quantity) {
        errors.push(
          `"${row.name}" only has ${row.stockQty} in stock (requested ${item.quantity})`
        );
        continue;
      }
      validated.push({
        type: "product",
        id: row.id,
        name: row.name,
        image: (row.images as Array<{ url: string }>)[0]?.url,
        priceCents: priced(row.priceCents),
        quantity: item.quantity,
      });
    } else if (item.type === "plant") {
      const [row] = await db
        .select()
        .from(plants)
        .where(and(eq(plants.id, item.id), eq(plants.status, "live")))
        .limit(1);

      if (!row) {
        errors.push(`Plant ID ${item.id} not found or unavailable`);
        continue;
      }
      if (row.stockQty < item.quantity) {
        errors.push(
          `"${row.commonName ?? row.latinName}" only has ${row.stockQty} in stock (requested ${item.quantity})`
        );
        continue;
      }
      validated.push({
        type: "plant",
        id: row.id,
        name: row.commonName ?? row.latinName,
        image: (row.images as Array<{ url: string }>)[0]?.url,
        priceCents: priced(row.priceCents),
        quantity: item.quantity,
      });
    } else {
      errors.push(`Unknown item type: ${(item as CartItem).type}`);
    }
  }

  if (errors.length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const subtotalCents = validated.reduce(
    (sum, i) => sum + i.priceCents * i.quantity,
    0
  );
  const shippingCents = calcShipping(subtotalCents);
  const totalCents = subtotalCents + shippingCents;

  return NextResponse.json({
    ok: true,
    items: validated,
    subtotalCents,
    shippingCents,
    totalCents,
  });
}
