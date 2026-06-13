import { db, projects } from "@/lib/db";
import { desc, eq } from "drizzle-orm";

const SECTOR_LABELS: Record<string, string> = {
  residential: "Residential",
  commercial: "Commercial",
  civic: "Civic & Public",
  healthcare: "Healthcare & Education",
  mixed: "Mixed-Use",
};

/**
 * Server component — fetches all live projects, embeds them as JSON
 * in a data attribute, then a small inline script handles filter state.
 * No React client bundle needed.
 */
export async function ProjectGrid() {
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.status, "live"))
    .orderBy(desc(projects.featured), desc(projects.completedAt));

  // Collect unique sectors in display order
  const sectorOrder = ["commercial", "residential", "civic", "healthcare", "mixed"];
  const availableSectors = sectorOrder.filter((s) =>
    rows.some((r) => r.sector === s)
  );

  const projectData = rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    suburb: p.suburb,
    sector: p.sector,
    heroImage: p.heroImage,
    packageValue: p.packageValue,
  }));

  return (
    <section className="proj-grid-section">
      <div className="wrap">
        {/* Filter bar */}
        <div className="filter" id="proj-filter">
          <button
            className="on"
            data-sector="all"
            onClick={undefined}
            type="button"
          >
            All
          </button>
          {availableSectors.map((s) => (
            <button key={s} data-sector={s} type="button">
              {SECTOR_LABELS[s] || s}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="proj-grid2" id="proj-grid">
          {rows.map((p) => (
            <a
              key={p.id}
              href={`/projects/${p.slug}`}
              className="proj-card fade-target"
              data-sector={p.sector}
            >
              <div className="ph">
                {p.heroImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.heroImage} alt={p.title} />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      background: "var(--bone)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="6" y="12" width="28" height="20" rx="2" stroke="var(--ink-2)" strokeWidth="1.5" fill="none"/>
                      <circle cx="14" cy="19" r="3" stroke="var(--ink-2)" strokeWidth="1.5" fill="none"/>
                      <path d="M6 28 L14 20 L20 26 L26 19 L34 28" stroke="var(--ink-2)" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="meta">
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--ink-2)",
                      marginBottom: 4,
                    }}
                  >
                    {p.suburb}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--display)",
                      fontSize: 18,
                      fontWeight: 400,
                      letterSpacing: "-0.01em",
                      color: "var(--ink)",
                    }}
                  >
                    {p.title}
                  </div>
                </div>
                <span className="chip" style={{ fontSize: 11, padding: "4px 10px", flexShrink: 0 }}>
                  {SECTOR_LABELS[p.sector] || p.sector}
                </span>
              </div>
            </a>
          ))}
          {rows.length === 0 && (
            <p style={{ color: "var(--ink-2)", gridColumn: "1/-1" }}>
              No projects published yet.
            </p>
          )}
        </div>

        {/* Inline filter script — no React bundle */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  var filter = document.getElementById('proj-filter');
  var grid = document.getElementById('proj-grid');
  if (!filter || !grid) return;
  var active = 'all';
  filter.addEventListener('click', function(e) {
    var btn = e.target.closest('button[data-sector]');
    if (!btn) return;
    active = btn.getAttribute('data-sector');
    filter.querySelectorAll('button').forEach(function(b){
      b.classList.toggle('on', b === btn);
    });
    grid.querySelectorAll('.proj-card').forEach(function(card){
      var show = active === 'all' || card.getAttribute('data-sector') === active;
      card.style.display = show ? '' : 'none';
    });
  });
})();
            `,
          }}
        />
      </div>
    </section>
  );
}
