import { db, quotes, pages, projects } from "@/lib/db";
import { count, desc, eq } from "drizzle-orm";

export default async function AdminDashboard() {
  const [openQuotes] = await db
    .select({ n: count() })
    .from(quotes)
    .where(eq(quotes.status, "new"));
  const [livePages] = await db
    .select({ n: count() })
    .from(pages)
    .where(eq(pages.status, "live"));
  const [livePortfolio] = await db
    .select({ n: count() })
    .from(projects)
    .where(eq(projects.status, "live"));

  const recentQuotes = await db
    .select()
    .from(quotes)
    .orderBy(desc(quotes.receivedAt))
    .limit(6);

  const today = new Date().toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <main className="main-content">
      <div className="page-head-a">
        <div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.14em",
              color: "var(--subtle)",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            — {today}
          </div>
          <h1>
            Good morning, <span className="it">studio.</span>
          </h1>
          <div className="sub">
            What landed overnight, and what still needs your eye.
          </div>
        </div>
        <div className="filt">
          <button>Today</button>
          <button className="on">This Week</button>
          <button>Month</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi">
          <div className="lbl">— Open Quotes</div>
          <div className="val">{openQuotes?.n ?? 0}</div>
          <div className="delta">new this week</div>
        </div>
        <div className="kpi">
          <div className="lbl">— Live Pages</div>
          <div className="val">{livePages?.n ?? 0}</div>
          <div className="delta">in the CMS</div>
        </div>
        <div className="kpi">
          <div className="lbl">— Projects published</div>
          <div className="val">{livePortfolio?.n ?? 0}</div>
          <div className="delta">in the portfolio</div>
        </div>
        <div className="kpi">
          <div className="lbl">— Active Jobs</div>
          <div className="val">
            — <span className="u">phase 2</span>
          </div>
          <div className="delta">comes online next phase</div>
        </div>
      </div>

      <div className="dash-split">
        <div className="panel">
          <header>
            <div>
              <h3>
                Recent <span className="it">quotes</span>
              </h3>
              <div className="meta" style={{ marginTop: 4 }}>
                — Latest enquiries from the website
              </div>
            </div>
            <a href="/admin/quotes">Open inbox →</a>
          </header>
          <div className="body" style={{ padding: "8px 22px" }}>
            {recentQuotes.length === 0 ? (
              <p style={{ color: "var(--muted)", padding: "20px 0" }}>
                No quotes yet. The form on /contact will land them here.
              </p>
            ) : (
              <ul className="activity">
                {recentQuotes.map((q) => (
                  <li key={q.id}>
                    <div className="ic orders">✉</div>
                    <div className="msg">
                      <b>{q.name}</b>
                      {q.company ? ` · ${q.company}` : ""} —{" "}
                      <span style={{ color: "var(--muted)" }}>
                        {q.brief.slice(0, 90)}
                        {q.brief.length > 90 ? "…" : ""}
                      </span>
                    </div>
                    <div className="t">
                      {new Date(q.receivedAt).toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="panel">
          <header>
            <h3>
              Quick <span className="it">actions</span>
            </h3>
          </header>
          <div className="body" style={{ padding: "16px 22px" }}>
            <div style={{ display: "grid", gap: 10 }}>
              <a
                href="/admin/pages"
                style={{
                  display: "block",
                  padding: "14px 16px",
                  border: "1px solid var(--line)",
                  borderRadius: 4,
                  color: "var(--ink)",
                }}
              >
                <div style={{ fontFamily: "Fraunces, serif", fontSize: 17 }}>
                  Edit a page →
                </div>
                <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
                  Update home, about, services or contact
                </div>
              </a>
              <a
                href="/admin/portfolio"
                style={{
                  display: "block",
                  padding: "14px 16px",
                  border: "1px solid var(--line)",
                  borderRadius: 4,
                  color: "var(--ink)",
                }}
              >
                <div style={{ fontFamily: "Fraunces, serif", fontSize: 17 }}>
                  Add a project →
                </div>
                <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
                  New entry in the portfolio
                </div>
              </a>
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "block",
                  padding: "14px 16px",
                  border: "1px solid var(--line)",
                  borderRadius: 4,
                  color: "var(--ink)",
                }}
              >
                <div style={{ fontFamily: "Fraunces, serif", fontSize: 17 }}>
                  View the public site ↗
                </div>
                <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
                  Opens the live site in a new tab
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
