import type { products, productCategories } from "@/lib/db/schema";
import { AddToCartButton } from "./AddToCartButton";

type Product = typeof products.$inferSelect & {
  category: typeof productCategories.$inferSelect | null;
};
type Category = typeof productCategories.$inferSelect;

interface DefaultShopPageProps {
  products: Product[];
  categories: Category[];
  selectedCategory?: string;
  searchQuery?: string;
}

function centsToDisplay(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function DefaultShopPage({
  products,
  categories,
  selectedCategory,
  searchQuery,
}: DefaultShopPageProps) {
  return (
    <>
      {/* Page header */}
      <section
        style={{
          background: "var(--color-surface, #f8f8f6)",
          padding: "48px 0 32px",
          borderBottom: "1px solid var(--line-2, #e5e7eb)",
        }}
      >
        <div className="wrap">
          <div className="crumbs" style={{ marginBottom: 12, fontSize: 13, color: "var(--text-muted, #6b7280)" }}>
            <a href="/">Home</a> &nbsp;&middot;&nbsp; Shop
          </div>
          <h1 style={{ margin: 0, fontSize: 36, fontWeight: 700 }}>Shop</h1>
        </div>
      </section>

      {/* Filters */}
      <section style={{ padding: "24px 0 0", borderBottom: "1px solid var(--line-2, #e5e7eb)" }}>
        <div className="wrap">
          {/* Search */}
          <form method="GET" action="/shop" style={{ marginBottom: 16, display: "flex", gap: 8 }}>
            {selectedCategory && (
              <input type="hidden" name="category" value={selectedCategory} />
            )}
            <input
              type="search"
              name="q"
              defaultValue={searchQuery || ""}
              placeholder="Search products…"
              style={{
                padding: "8px 14px",
                border: "1px solid var(--line-2, #d1d5db)",
                borderRadius: 8,
                fontSize: 14,
                width: 260,
              }}
            />
            <button
              type="submit"
              style={{
                padding: "8px 16px",
                background: "var(--color-accent, #2563eb)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Search
            </button>
          </form>

          {/* Category pills */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingBottom: 0 }}>
            <a
              href={searchQuery ? `/shop?q=${encodeURIComponent(searchQuery)}` : "/shop"}
              style={{
                padding: "6px 16px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 500,
                textDecoration: "none",
                background: !selectedCategory ? "var(--color-accent, #2563eb)" : "var(--color-surface, #f3f4f6)",
                color: !selectedCategory ? "#fff" : "var(--text-base, #374151)",
                border: "1px solid var(--line-2, #e5e7eb)",
              }}
            >
              All
            </a>
            {categories.map((cat) => {
              const active = selectedCategory === cat.slug;
              const href = searchQuery
                ? `/shop?category=${cat.slug}&q=${encodeURIComponent(searchQuery)}`
                : `/shop?category=${cat.slug}`;
              return (
                <a
                  key={cat.id}
                  href={href}
                  style={{
                    padding: "6px 16px",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 500,
                    textDecoration: "none",
                    background: active ? "var(--color-accent, #2563eb)" : "var(--color-surface, #f3f4f6)",
                    color: active ? "#fff" : "var(--text-base, #374151)",
                    border: "1px solid var(--line-2, #e5e7eb)",
                  }}
                >
                  {cat.name}
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section style={{ padding: "40px 0 64px" }}>
        <div className="wrap">
          {products.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted, #6b7280)" }}>
              <p style={{ fontSize: 18 }}>No products found.</p>
              <a href="/shop" style={{ color: "var(--color-accent, #2563eb)", textDecoration: "none" }}>
                Clear filters
              </a>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 24,
              }}
              className="shop-grid"
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <style>{`
        @media (max-width: 1024px) { .shop-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 768px)  { .shop-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 480px)  { .shop-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
}

function ProductCard({ product }: { product: Product & { category: Category | null } }) {
  const img = product.images?.[0];
  const isLowStock = product.stockQty > 0 && product.stockQty < 5;
  const isOutOfStock = product.stockQty === 0;

  return (
    <div
      style={{
        border: "1px solid var(--line-2, #e5e7eb)",
        borderRadius: 12,
        overflow: "hidden",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Image */}
      <a href={`/shop/${product.slug}`} style={{ display: "block", position: "relative" }}>
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img.url}
            alt={img.alt || product.name}
            style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              aspectRatio: "4/3",
              background: "var(--color-surface, #f3f4f6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted, #9ca3af)",
              fontSize: 13,
            }}
          >
            No image
          </div>
        )}
        {product.badge && (
          <span
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              background: product.badge === "SALE" ? "#dc2626" : product.badge === "NEW" ? "#2563eb" : "#16a34a",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              padding: "3px 8px",
              borderRadius: 4,
              letterSpacing: "0.05em",
            }}
          >
            {product.badge}
          </span>
        )}
      </a>

      {/* Info */}
      <div style={{ padding: "14px 16px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        {product.category && (
          <div style={{ fontSize: 11, color: "var(--text-muted, #9ca3af)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {product.category.name}
          </div>
        )}
        <a
          href={`/shop/${product.slug}`}
          style={{ fontWeight: 600, fontSize: 15, color: "var(--text-base, #111827)", textDecoration: "none", lineHeight: 1.3 }}
        >
          {product.name}
        </a>

        {/* Price row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: "var(--color-accent, #2563eb)" }}>
            {centsToDisplay(product.priceCents)}
          </span>
          {product.compareAtCents && product.compareAtCents > product.priceCents && (
            <span style={{ fontSize: 13, color: "var(--text-muted, #9ca3af)", textDecoration: "line-through" }}>
              {centsToDisplay(product.compareAtCents)}
            </span>
          )}
        </div>

        {/* Stock indicator */}
        {isOutOfStock && (
          <div style={{ fontSize: 12, color: "#dc2626", fontWeight: 500 }}>Out of stock</div>
        )}
        {isLowStock && !isOutOfStock && (
          <div style={{ fontSize: 12, color: "#d97706", fontWeight: 500 }}>Only {product.stockQty} left</div>
        )}

        {/* Add to cart */}
        <div style={{ marginTop: "auto", paddingTop: 12 }}>
          {isOutOfStock ? (
            <button
              disabled
              style={{
                width: "100%",
                padding: "9px",
                background: "var(--color-surface, #f3f4f6)",
                color: "var(--text-muted, #9ca3af)",
                border: "1px solid var(--line-2, #e5e7eb)",
                borderRadius: 8,
                fontSize: 14,
                cursor: "not-allowed",
              }}
            >
              Out of stock
            </button>
          ) : (
            <AddToCartButton
              item={{
                type: "product",
                id: product.id,
                name: product.name,
                image: img?.url,
                priceCents: product.priceCents,
              }}
              className="atc-btn-full"
            />
          )}
        </div>
      </div>

      <style>{`.atc-btn-full { width: 100%; text-align: center; }`}</style>
    </div>
  );
}
