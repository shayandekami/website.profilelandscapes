import Link from "next/link";
import { db, pages, projects, plants, products, quotes, jobPostings } from "@/lib/db";
import { ilike, or } from "drizzle-orm";
type Props = { searchParams: Promise<{ q?: string }> };
type Result = { group: string; title: string; detail: string; href: string };
export default async function AdminSearch({ searchParams }: Props) {
  const q = (await searchParams).q?.trim() || ""; const pattern = `%${q}%`; let results: Result[] = [];
  if (q.length >= 2) {
    const [pageRows, projectRows, plantRows, productRows, quoteRows, jobRows] = await Promise.all([
      db.select({ id: pages.id, title: pages.title, slug: pages.slug }).from(pages).where(or(ilike(pages.title, pattern), ilike(pages.slug, pattern))).limit(8),
      db.select({ id: projects.id, title: projects.title, location: projects.suburb }).from(projects).where(or(ilike(projects.title, pattern), ilike(projects.suburb, pattern))).limit(8),
      db.select({ id: plants.id, latin: plants.latinName, common: plants.commonName }).from(plants).where(or(ilike(plants.latinName, pattern), ilike(plants.commonName, pattern))).limit(8),
      db.select({ id: products.id, name: products.name, sku: products.sku }).from(products).where(or(ilike(products.name, pattern), ilike(products.sku, pattern))).limit(8),
      db.select({ id: quotes.id, name: quotes.name, company: quotes.company, brief: quotes.brief }).from(quotes).where(or(ilike(quotes.name, pattern), ilike(quotes.company, pattern), ilike(quotes.brief, pattern))).limit(8),
      db.select({ id: jobPostings.id, title: jobPostings.title, team: jobPostings.team }).from(jobPostings).where(or(ilike(jobPostings.title, pattern), ilike(jobPostings.team, pattern))).limit(8),
    ]);
    results = [...pageRows.map(r=>({group:"Pages",title:r.title,detail:r.slug,href:`/admin/pages/${r.id}`})),...projectRows.map(r=>({group:"Projects",title:r.title,detail:r.location||"Portfolio project",href:`/admin/portfolio/${r.id}`})),...plantRows.map(r=>({group:"Nursery",title:r.common||r.latin,detail:r.latin,href:`/admin/nursery/${r.id}`})),...productRows.map(r=>({group:"Shop",title:r.name,detail:r.sku||"Shop product",href:`/admin/shop/${r.id}`})),...quoteRows.map(r=>({group:"Quotes",title:r.name,detail:r.company||r.brief.slice(0,80),href:`/admin/quotes/${r.id}`})),...jobRows.map(r=>({group:"Jobs",title:r.title,detail:r.team,href:`/admin/jobs/${r.id}`}))];
  }
  return <main className="main-content admin-search-page"><div className="page-head-a"><div><h1>Search <span className="it">the studio.</span></h1><div className="sub">Find content, projects, stock, products, enquiries and vacancies.</div></div></div><form className="admin-search-hero"><input autoFocus name="q" defaultValue={q} placeholder="Try a project, plant, client or SKU…" /><button className="btn pri">Search</button></form>
    {!q&&<div className="search-empty">Enter at least two characters to search across the admin.</div>}{q&&q.length<2&&<div className="search-empty">Please enter at least two characters.</div>}{q.length>=2&&!results.length&&<div className="search-empty">No results for “{q}”. Try a broader term.</div>}{!!results.length&&<div className="search-results"><div className="search-results-meta">{results.length} results for “{q}”</div>{results.map((r,i)=><Link href={r.href} className="search-result" key={`${r.href}-${i}`}><span>{r.group}</span><div><h2>{r.title}</h2><p>{r.detail}</p></div><b>Open →</b></Link>)}</div>}</main>;
}
