const team = [
  ["01", "Landscape architect"],
  ["02", "Project managers"],
  ["05", "Site foremen"],
  ["06", "Qualified trades"],
  ["16", "Landscape crew"],
  ["02", "Estimators"],
  ["02", "Apprentices"],
  ["01", "Office + accounts"],
];

const fleet = [
  {
    number: "01",
    title: "Excavation + civil",
    total: "13 units",
    items: ["5 × Bobcats + attachments", "2 × 8t excavators", "1 × 5t excavator", "2 × 3.5t excavators", "2 × 1.7t excavators", "1 × 1t roller"],
  },
  {
    number: "02",
    title: "Transport + logistics",
    total: "14 vehicles",
    items: ["1 × 10t tipper", "1 × 5t tipper", "3 × supervisor dual cabs", "6 × one-tonne utilities", "2 × maintenance vans", "1 × irrigation van"],
  },
];

const systems = ["Buildsoft", "Cubit", "ACONEX", "Procore", "Teambinder", "AutoCAD", "Irricad", "Live cost reporting"];

const clients = [
  ["Lendlease", "/assets/clients/lendlease.png"],
  ["CPB Contractors", "/assets/clients/cpb-contractors.png"],
  ["Richard Crookes", "/assets/clients/richard-crookes.png"],
  ["BESIX Watpac", "/assets/clients/besix-watpac.png"],
  ["Taylor Construction", "/assets/clients/taylor-construction.png"],
  ["Billbergia", "/assets/clients/billbergia.png"],
];

export function CapabilityStudio() {
  return (
    <main className="cap-page">
      <section className="cap-hero">
        <div className="cap-hero-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/projects/cranbrook-junior-school-restored-v2.webp" alt="Completed landscape works at Cranbrook Junior School" />
        </div>
        <div className="cap-hero-shade" />
        <div className="cap-shell cap-hero-inner">
          <a href="/projects" className="cap-crumb">Work / Capability</a>
          <p className="cap-overline">Commercial landscape delivery · Sydney</p>
          <h1>Built to deliver.<br /><em>Equipped to own</em><br />the outcome.</h1>
          <div className="cap-hero-bottom">
            <p>One accountable team from estimate to establishment. We combine design intelligence, construction depth, company-owned plant and live project controls to self-perform consequential landscape packages.</p>
            <a href="/quote">Invite us to tender <span>↗</span></a>
          </div>
        </div>
      </section>

      <section className="cap-proof">
        <div className="cap-shell">
          <p className="cap-kicker">Capability at a glance / 01</p>
          <div className="cap-proof-grid">
            <article><strong>35</strong><span>People<br />in-house</span></article>
            <article><strong>22+</strong><span>Machines +<br />vehicles</span></article>
            <article><strong>$20K–$11M</strong><span>Landscape<br />package range</span></article>
            <article><strong>1999</strong><span>Operating in<br />Sydney since</span></article>
          </div>
        </div>
      </section>

      <section className="cap-model">
        <div className="cap-shell">
          <div className="cap-model-head">
            <p className="cap-kicker">Our operating model / 02</p>
            <h2>Fewer hand-offs.<br /><em>More control.</em></h2>
            <p>Capability is not a list of machines. It is the ability to coordinate people, information, procurement and site decisions without losing the original intent.</p>
          </div>
          <div className="cap-model-grid">
            <article><span>01 / Plan</span><h3>Cost it before it costs you.</h3><p>In-house estimators produce buildable BOQs, procurement plans and live cost reporting grounded in current labour and supply rates.</p></article>
            <article><span>02 / Deliver</span><h3>Self-perform the critical path.</h3><p>Our own supervisors, crews, excavation fleet and transport reduce dependencies and keep programme decisions close to the work.</p></article>
            <article><span>03 / Establish</span><h3>Stay until the landscape takes.</h3><p>Construction, horticulture and maintenance knowledge remain connected through completion, establishment and handover.</p></article>
          </div>
        </div>
      </section>

      <section className="cap-people">
        <div className="cap-people-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/projects/canterbury-leagues-club-grounds-restored-v2.webp" alt="Established commercial landscape at Canterbury Leagues Club" />
          <span>Site intelligence / Built experience</span>
        </div>
        <div className="cap-people-copy">
          <p className="cap-kicker">The team / 03</p>
          <h2>Specialists,<br /><em>on the same side.</em></h2>
          <p>Designers, estimators, project managers, foremen and field crews operate as one delivery team. Decisions move faster because the people documenting, pricing and building the work can resolve it together.</p>
          <div className="cap-team-grid">
            {team.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
          </div>
        </div>
      </section>

      <section className="cap-control">
        <div className="cap-shell">
          <div className="cap-control-intro">
            <p className="cap-kicker">Project controls / 04</p>
            <h2>The field,<br /><em>connected.</em></h2>
            <p>Current drawings, RFIs, cost movements, procurement and programme information stay visible from office to site. The system is practical: fewer surprises, traceable decisions and reporting clients can use.</p>
          </div>
          <div className="cap-system-list">
            {systems.map((system, i) => <div key={system}><span>{String(i + 1).padStart(2, "0")}</span><strong>{system}</strong><i>Active</i></div>)}
          </div>
        </div>
      </section>

      <section className="cap-fleet">
        <div className="cap-shell">
          <div className="cap-fleet-head">
            <p className="cap-kicker">Company-owned plant / 05</p>
            <h2>A yard that keeps<br /><em>the programme moving.</em></h2>
            <p>Plant is allocated around the project, not a hire window. Our fleet gives teams the capacity to react to access, staging and ground-condition changes without exporting control.</p>
          </div>
          <div className="cap-fleet-list">
            {fleet.map((group) => (
              <article key={group.number}>
                <span className="cap-fleet-no">{group.number}</span>
                <div><h3>{group.title}</h3><strong>{group.total}</strong></div>
                <ul>{group.items.map(item => <li key={item}>{item}</li>)}</ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cap-evidence">
        <div className="cap-evidence-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/projects/kinghorn-cancer-centre-restored.webp" alt="Landscaped terrace at The Kinghorn Cancer Centre" />
        </div>
        <div className="cap-evidence-copy">
          <p className="cap-kicker">Proof, delivered / 06</p>
          <blockquote>“Capability matters when the site changes—and the team can still protect quality, programme and intent.”</blockquote>
          <a href="/projects">View delivered projects ↗</a>
        </div>
      </section>

      <section className="cap-partners">
        <div className="cap-shell">
          <div className="cap-partners-head"><p className="cap-kicker">Selected relationships / 07</p><p>Trusted across complex commercial, civic, education and residential environments.</p></div>
          <div className="cap-logo-grid">
            {clients.map(([name, logo]) => <div key={name}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={logo} alt={name} /></div>)}
          </div>
        </div>
      </section>

      <section className="cap-invite">
        <div className="cap-shell">
          <p className="cap-kicker">Tendering now / 08</p>
          <h2>Bring us the<br /><em>consequential work.</em></h2>
          <div><p>Send the drawings, programme and trade package. Our estimating team will review scope, constraints and tender timing with you.</p><a href="/quote">Start a quote request <span>↗</span></a></div>
        </div>
      </section>
    </main>
  );
}
