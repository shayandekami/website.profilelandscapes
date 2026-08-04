import Link from "next/link";
import { db, products, productCategories } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const price = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export default async function ShopList() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const rows = await db.select({
    id: products.id, name: products.name, slug: products.slug, sku: products.sku,
    priceCents: products.priceCents, stockQty: products.stockQty, featured: products.featured,
    status: products.status, createdAt: products.createdAt, images: products.images,
    categoryName: productCategories.name,
  }).from(products).leftJoin(productCategories, eq(products.categoryId, productCategories.id)).orderBy(desc(products.createdAt));

  return <main className="main-content">
    <div className="page-head-a">
      <div><h1>Shop <span className="it">products.</span></h1><div className="sub">{rows.length} products · visual merchandising and stock management.</div></div>
      <Link href="/admin/shop/new" className="btn pri">+ New product</Link>
    </div>
    <div className="catalog-toolbar">
      <div><strong>Catalogue view</strong><span>Images, categories and stock at a glance</span></div>
      <a href="/shop" target="_blank" rel="noreferrer" className="btn">View storefront ↗</a>
    </div>
    <div className="catalog-grid">
      {!rows.length && <div className="catalog-empty">No products yet. <Link href="/admin/shop/new">Add the first one.</Link></div>}
      {rows.map((p) => {
        const image = p.images?.[0];
        return <Link className="catalog-card" href={`/admin/shop/${p.id}`} key={p.id}>
          <div className="catalog-image">
            {image ? <img src={image.url} alt={image.alt || p.name} /> : <span>{p.name.charAt(0)}</span>}
            <div className="catalog-flags"><span className={`chip ${p.status === "live" ? "paid" : "draft"}`}>{p.status}</span>{p.featured && <b>Featured</b>}</div>
          </div>
          <div className="catalog-card-body">
            <p>{p.categoryName || "Uncategorised"}{p.sku ? ` · ${p.sku}` : ""}</p>
            <h2>{p.name}</h2>
            <div className="catalog-meta"><strong>{price(p.priceCents)}</strong><span className={p.stockQty ? "" : "is-empty"}>{p.stockQty ? `${p.stockQty} in stock` : "Out of stock"}</span></div>
            <small>Edit product →</small>
          </div>
        </Link>;
      })}
    </div>
  </main>;
}
