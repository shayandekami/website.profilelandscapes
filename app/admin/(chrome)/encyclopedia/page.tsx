import Link from "next/link";
import { db, encyclopediaEntries } from "@/lib/db";
import { and, asc, count, eq, ilike, or } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

type Props = { searchParams: Promise<{ q?: string; status?: string; page?: string }> };
const PAGE_SIZE = 48;

export default async function EncyclopediaList({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const status = params.status === "live" || params.status === "draft" ? params.status : "";
  const requestedPage = Math.max(1, Number(params.page) || 1);
  const where = and(
    q
      ? or(
          ilike(encyclopediaEntries.latinName, `%${q}%`),
          ilike(encyclopediaEntries.commonName, `%${q}%`),
          ilike(encyclopediaEntries.family, `%${q}%`),
        )
      : undefined,
    status ? eq(encyclopediaEntries.status, status) : undefined,
  );
  const [{ value: total }] = await db
    .select({ value: count() })
    .from(encyclopediaEntries)
    .where(where);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requestedPage, pageCount);

  const rows = await db
    .select()
    .from(encyclopediaEntries)
    .where(where)
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE)
    .orderBy(asc(encyclopediaEntries.latinName));
  const pageHref = (nextPage: number) => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (status) next.set("status", status);
    next.set("page", String(nextPage));
    return `/admin/encyclopedia?${next.toString()}`;
  };

  return (
    <main className="main-content">
      <div className="page-head-a">
        <div>
          <h1>
            Plant <span className="it">encyclopedia.</span>
          </h1>
          <div className="sub">
            {total} entr{total !== 1 ? "ies" : "y"} in the botanical reference.
            Showing {total ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, total)}.
          </div>
        </div>
        <Link href="/admin/encyclopedia/new" className="btn pri">
          + New entry
        </Link>
      </div>

      <div className="catalog-toolbar encyclopedia-toolbar">
        <form method="get">
          <input type="search" name="q" defaultValue={q} placeholder="Search Latin name, common name or family…" aria-label="Search encyclopedia" />
          <select name="status" defaultValue={status} aria-label="Filter publication status">
            <option value="">All statuses</option>
            <option value="live">Live</option>
            <option value="draft">Draft</option>
          </select>
          <button className="btn pri" type="submit">Filter</button>
          {(q || status) && <Link className="btn" href="/admin/encyclopedia">Clear</Link>}
        </form>
      </div>

      <div className="panel admin-table-panel">
        {rows.length === 0 ? (
          <div
            style={{
              padding: "40px 22px",
              textAlign: "center",
              color: "var(--muted)",
            }}
          >
            No encyclopedia entries yet.{" "}
            <Link href="/admin/encyclopedia/new" style={{ color: "var(--accent)" }}>
              Add the first one
            </Link>
            .
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Latin name</th>
                <th>Common name</th>
                <th>Family</th>
                <th>Tags</th>
                <th>Featured</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id}>
                  <td>
                    <Link
                      href={`/admin/encyclopedia/${e.id}`}
                      style={{ fontWeight: 500, color: "var(--ink)", fontStyle: "italic" }}
                    >
                      {e.latinName}
                    </Link>
                    <div className="sub" style={{ fontSize: 12.5 }}>
                      /encyclopedia/{e.slug}
                    </div>
                  </td>
                  <td>{e.commonName || <span className="muted">—</span>}</td>
                  <td>{e.family || <span className="muted">—</span>}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {((e.tags as string[]) ?? []).length === 0 ? (
                        <span className="muted">—</span>
                      ) : (
                        (e.tags as string[]).map((tag) => (
                          <span
                            key={tag}
                            style={{
                              display: "inline-block",
                              padding: "2px 6px",
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 600,
                              background: "var(--surface2, #f0f0f0)",
                              color: "var(--ink)",
                            }}
                          >
                            {tag}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td>{e.featured ? "★" : <span className="muted">—</span>}</td>
                  <td>
                    <span className={`chip ${e.status === "live" ? "paid" : "draft"}`}>
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {pageCount > 1 && (
        <nav className="catalog-pagination" aria-label="Encyclopedia pages">
          {page > 1 ? <Link className="btn" href={pageHref(page - 1)}>← Previous</Link> : <span />}
          <p>Page {page} of {pageCount}</p>
          {page < pageCount ? <Link className="btn" href={pageHref(page + 1)}>Next →</Link> : <span />}
        </nav>
      )}
    </main>
  );
}
