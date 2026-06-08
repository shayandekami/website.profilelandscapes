import type { products, productCategories } from "@/lib/db/schema";
import { AddToCartButton } from "./AddToCartButton";

type Product = typeof products.$inferSelect & {
  category: typeof productCategories.$inferSelect | null;
};

interface DefaultProductPageProps {
  product: Product;
  related: Product[];
}

function centsToDisplay(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function DefaultProductPage({ product, related }: DefaultProductPageProps) {
  const mainImg = product.images?.[0];
  const isOutOfStock = product.stockQty === 0;
  const isLowStock = product.stockQty > 0 && product.stockQty < 5;

  return (
    <>
      {/* Breadcrumbs */}
      <section style={{ padding: "16px 0", borderBottom: "1px solid var(--line-2, #e5e7eb)" }}>
        <div className="wrap">
          <div style={{ fontSize: 13, color: "var(--text-muted, #6b7280)" }}>
            <a href="/" style={{ color: "inherit" }}>Home</a>
            &nbsp;&middot;&nbsp;
            <a href="/shop" style={{ color: "inherit" }}>Shop</a>
            &nbsp;&middot;&nbsp;
            {product.category && (
              <>
                <a href={`/shop?category=${product.category.slug}`} style={{ color: "inherit" }}>
                  {product.category.name}
                </a>
                &nbsp;&middot;&nbsp;
              </>
            )}
            {product.name}
          </div>
        </div>
      </section>

      {/* Product detail */}
      <section style={{ padding: "48px 0" }}>
        <div className="wrap">
          <div
            className="prod-detail-grid"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "start" }}
          >
            {/* Images */}
            <div>
              {mainImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mainImg.url}
                  alt={mainImg.alt || product.name}
                  style={{ width: "100%", borderRadius: 12, objectFit: "cover", aspectRatio: "4/3" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "4/3",
                    background: "var(--color-surface, #f3f4f6)",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-muted, #9ca3af)",
                  }}
                >
                  No image
                </div>
              )}
              {product.images.length > 1 && (
                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  {product.images.map((img, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={img.url}
                      alt={img.alt || ""}
                      style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 6, border: "1px solid var(--line-2, #e5e7eb)" }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              {product.category && (
                <div style={{ fontSize: 12, color: "var(--text-muted, #9ca3af)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                  <a href={`/shop?category=${product.category.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
                    {product.category.name}
                  </a>
                </div>
              )}

              <h1 style={{ fontSize: 30, fontWeight: 700, margin: "0 0 12px", lineHeight: 1.2 }}>
                {product.name}
              </h1>

              {product.badge && (
                <span
                  style={{
                    display: "inline-block",
                    background: product.badge === "SALE" ? "#dc2626" : product.badge === "NEW" ? "#2563eb" : "#16a34a",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 4,
                    marginBottom: 12,
                    letterSpacing: "0.05em",
                  }}
                >
                  {product.badge}
                </span>
              )}

              {/* Price */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 20 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: "var(--color-accent, #2563eb)" }}>
                  {centsToDisplay(product.priceCents)}
                </span>
                {product.compareAtCents && product.compareAtCents > product.priceCents && (
                  <span style={{ fontSize: 18, color: "var(--text-muted, #9ca3af)", textDecoration: "line-through" }}>
                    {centsToDisplay(product.compareAtCents)}
                  </span>
                )}
              </div>

              {product.shortDescription && (
                <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--text-base, #374151)", margin: "0 0 20px" }}>
                  {product.shortDescription}
                </p>
              )}

              {/* Stock */}
              {isOutOfStock && (
                <div style={{ color: "#dc2626", fontSize: 14, fontWeight: 500, marginBottom: 16 }}>Out of stock</div>
              )}
              {isLowStock && (
                <div style={{ color: "#d97706", fontSize: 14, fontWeight: 500, marginBottom: 16 }}>
                  Only {product.stockQty} left in stock
                </div>
              )}

              {/* Add to cart */}
              {!isOutOfStock ? (
                <AddToCartButton
                  item={{
                    type: "product",
                    id: product.id,
                    name: product.name,
                    image: mainImg?.url,
                    priceCents: product.priceCents,
                  }}
                  label="Add to Cart"
                />
              ) : (
                <button
                  disabled
                  style={{
                    padding: "12px 28px",
                    background: "var(--color-surface, #f3f4f6)",
                    color: "var(--text-muted, #9ca3af)",
                    border: "1px solid var(--line-2, #e5e7eb)",
                    borderRadius: 8,
                    fontSize: 15,
                    cursor: "not-allowed",
                  }}
                >
                  Out of Stock
                </button>
              )}

              <div style={{ marginTop: 24, borderTop: "1px solid var(--line-2, #e5e7eb)", paddingTop: 24 }}>
                {product.sku && (
                  <div style={{ fontSize: 12, color: "var(--text-muted, #9ca3af)", marginBottom: 6 }}>
                    SKU: {product.sku}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Full description */}
          {product.description && (
            <div
              style={{
                marginTop: 56,
                borderTop: "1px solid var(--line-2, #e5e7eb)",
                paddingTop: 40,
                maxWidth: 720,
              }}
            >
              <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>Description</h2>
              <div
                style={{ fontSize: 15, lineHeight: 1.7, color: "var(--text-base, #374151)" }}
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}
        </div>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section style={{ padding: "48px 0 64px", background: "var(--color-surface, #f8f8f6)", borderTop: "1px solid var(--line-2, #e5e7eb)" }}>
          <div className="wrap">
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 28 }}>You might also like</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 20,
              }}
              className="related-grid"
            >
              {related.map((rel) => {
                const img = rel.images?.[0];
                return (
                  <a
                    key={rel.id}
                    href={`/shop/${rel.slug}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <div
                      style={{
                        border: "1px solid var(--line-2, #e5e7eb)",
                        borderRadius: 10,
                        overflow: "hidden",
                        background: "#fff",
                      }}
                    >
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img.url}
                          alt={img.alt || rel.name}
                          style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover" }}
                        />
                      ) : (
                        <div style={{ width: "100%", aspectRatio: "4/3", background: "#f3f4f6" }} />
                      )}
                      <div style={{ padding: "12px 14px" }}>
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{rel.name}</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-accent, #2563eb)" }}>
                          {centsToDisplay(rel.priceCents)}
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <style>{`
        @media (max-width: 768px) {
          .prod-detail-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .related-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </>
  );
}
