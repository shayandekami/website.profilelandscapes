import Link from "next/link";
import { db, plants } from "@/lib/db";
import { and, asc, count, eq, ilike, or } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const price = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const PAGE_SIZE = 48;
type Props = { searchParams: Promise<{ q?: string; status?: "live" | "draft"; page?: string }> };

export default async function NurseryList({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const page = Math.max(1, Number(params.page) || 1);
  const status = params.status === "draft" ? "draft" : params.status === "live" ? "live" : undefined;
  const where = and(
    status ? eq(plants.status, status) : undefined,
    q ? or(ilike(plants.latinName, `%${q}%`), ilike(plants.commonName, `%${q}%`), ilike(plants.family, `%${q}%`)) : undefined,
  );
  const [[summary], rows] = await Promise.all([
    db.select({ n: count() }).from(plants).where(where),
    db.select().from(plants).where(where).orderBy(asc(plants.latinName)).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE),
  ]);
  const total = Number(summary?.n || 0);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hrefFor = (nextPage: number) => `/admin/nursery?${new URLSearchParams({ ...(q ? { q } : {}), ...(status ? { status } : {}), page: String(nextPage) })}`;

  return <main className="main-content">
    <div className="page-head-a">
      <div><h1>Nursery <span className="it">stock.</span></h1><div className="sub">{total} matching plants · photography, taxonomy and availability together.</div></div>
      <Link href="/admin/nursery/new" className="btn pri">+ New plant</Link>
    </div>
    <div className="catalog-toolbar nursery-toolbar">
      <form method="get">
        <input type="search" name="q" defaultValue={q} placeholder="Search botanical name, common name or family…" aria-label="Search nursery stock" />
        <select name="status" defaultValue={status || ""} aria-label="Filter publication status">
          <option value="">All statuses</option><option value="live">Live</option><option value="draft">Draft</option>
        </select>
        <button className="btn pri">Filter</button>
        {(q || status) && <Link className="btn" href="/admin/nursery">Clear</Link>}
      </form>
      <a href="/plants" target="_blank" rel="noreferrer" className="btn">View nursery ↗</a>
    </div>
    <div className="catalog-grid nursery-catalog">
      {!rows.length && <div className="catalog-empty">No plants match these filters. <Link href="/admin/nursery">Clear the search.</Link></div>}
      {rows.map((p) => {
        const image = p.images?.[0];
        return <Link className="catalog-card" href={`/admin/nursery/${p.id}`} key={p.id}>
          <div className="catalog-image">
            {image ? <img src={image.url} alt={image.alt || p.commonName || p.latinName} /> : <span className="plant-placeholder">✦</span>}
            <div className="catalog-flags"><span className={`chip ${p.status === "live" ? "paid" : "draft"}`}>{p.status}</span>{p.featured && <b>Featured</b>}</div>
          </div>
          <div className="catalog-card-body">
            <p>{p.commonName || p.family || "Nursery stock"}</p><h2><em>{p.latinName}</em></h2>
            <div className="catalog-tags">{(p.tags || []).slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div>
            <div className="catalog-meta"><strong>{price(p.priceCents)}{p.size ? <small> · {p.size}</small> : null}</strong><span className={p.stockQty ? "" : "is-empty"}>{p.stockQty ? `${p.stockQty} available` : "Out of stock"}</span></div>
            <small>Edit plant →</small>
          </div>
        </Link>;
      })}
    </div>
    {pages > 1 && <nav className="catalog-pagination" aria-label="Nursery catalogue pages">
      {page > 1 ? <Link className="btn" href={hrefFor(page - 1)}>← Previous</Link> : <span />}
      <p>Page {page} of {pages} · {total} plants</p>
      {page < pages ? <Link className="btn" href={hrefFor(page + 1)}>Next →</Link> : <span />}
    </nav>}
  </main>;
}
