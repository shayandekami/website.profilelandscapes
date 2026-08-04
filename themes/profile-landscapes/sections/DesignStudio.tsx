const principles = [
  ["01", "Read the site", "Country, climate, movement, architecture and maintenance are treated as one living brief."],
  ["02", "Find the gesture", "A clear spatial idea gives every level, edge, path and planting decision a reason to exist."],
  ["03", "Prove the detail", "Models, schedules and construction knowledge turn atmosphere into something buildable."],
  ["04", "Stay through making", "The design team remains connected to procurement, installation and establishment."],
];

const process = [
  ["Listen", "Ambition, constraints and lived patterns."],
  ["Read", "Site, climate, Country and context."],
  ["Imagine", "Sketch, model, test and cost."],
  ["Resolve", "Coordinate every material and detail."],
  ["Make", "Carry the idea through construction."],
];

const projects = [
  {
    src: "/assets/projects/fraser-suites-lumiere-restored-v2.webp",
    place: "Sydney CBD",
    title: "Fraser Suites / Lumière",
    note: "Urban hospitality landscape",
  },
  {
    src: "/assets/projects/kinghorn-cancer-centre-restored.webp",
    place: "Darlinghurst",
    title: "The Kinghorn Cancer Centre",
    note: "Therapeutic courtyard",
  },
  {
    src: "/assets/projects/trio-camperdown-pool-restored-v2.webp",
    place: "Camperdown",
    title: "Trio Apartments",
    note: "Residential garden rooms",
  },
];

export function DesignStudio() {
  return (
    <main className="dsa-page">
      <section className="dsa-hero">
        <div className="dsa-hero-copy">
          <a href="/projects">Work / Design studio</a>
          <p className="dsa-eyebrow">Landscape design · Sydney</p>
          <h1>Make the site<br /><em>mean</em> something.</h1>
          <div className="dsa-hero-intro">
            <span>01 / 06</span>
            <p>We design landscapes as complete spatial experiences—imaginative in concept, exact in detail and grounded in how places are actually made.</p>
          </div>
        </div>
        <figure className="dsa-hero-model">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/design-studio/maquette-hero-v1.webp" alt="Architectural landscape model exploring landform, planting and movement" />
          <figcaption><span>Study model</span><span>Landform / movement / canopy</span></figcaption>
        </figure>
        <div className="dsa-hero-word" aria-hidden="true">PLACE</div>
      </section>

      <section className="dsa-position">
        <div className="dsa-position-number">01</div>
        <div className="dsa-position-copy">
          <p className="dsa-eyebrow">Our position</p>
          <h2>Drawing is only<br />the beginning.</h2>
          <p className="dsa-position-lead">The strongest landscapes emerge when idea, ecology, craft and delivery are considered as one continuous act.</p>
          <p>Our designers sit inside a working landscape company. They share the table with horticulturists, estimators, project managers and construction teams. That closeness lets ambitious ideas survive contact with the real world.</p>
        </div>
        <aside>
          <span>What holds the work together</span>
          <strong>One studio.</strong>
          <strong>One build team.</strong>
          <strong>One standard.</strong>
        </aside>
      </section>

      <section className="dsa-principles">
        <header>
          <p className="dsa-eyebrow">The design intelligence / 02</p>
          <h2>Four ways of<br /><em>seeing.</em></h2>
        </header>
        <div className="dsa-principle-grid">
          {principles.map(([number, title, body]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="dsa-model-lab">
        <div className="dsa-model-copy">
          <p className="dsa-eyebrow">The model room / 03</p>
          <h2>Think<br />with your<br /><em>hands.</em></h2>
          <p>Models reveal what drawings conceal. We use them to test level, rhythm, shade, movement, material and planting character before those decisions become expensive.</p>
          <dl>
            <div><dt>Study</dt><dd>Topography</dd></div>
            <div><dt>Scale</dt><dd>1:100</dd></div>
            <div><dt>State</dt><dd>In development</dd></div>
          </dl>
        </div>
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/design-studio/material-library-cutout-v3.png" alt="White model pieces showing terrain, planting, paving and water studies" />
        </figure>
      </section>

      <section className="dsa-process">
        <header>
          <p className="dsa-eyebrow">One continuous line / 04</p>
          <h2>From first question<br />to living place.</h2>
        </header>
        <ol>
          {process.map(([title, body], index) => (
            <li key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="dsa-built">
        <header>
          <div>
            <p className="dsa-eyebrow">Proof, built / 05</p>
            <h2>The idea<br /><em>becomes place.</em></h2>
          </div>
          <a href="/projects">View the full portfolio ↗</a>
        </header>
        <div className="dsa-built-grid">
          {projects.map((project, index) => (
            <a href="/projects" key={project.title} className={`dsa-built-${index + 1}`}>
              <figure>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={project.src} alt={project.title} />
              </figure>
              <div><span>{project.place}</span><span>{project.note}</span></div>
              <h3>{project.title}</h3>
            </a>
          ))}
        </div>
      </section>

      <section className="dsa-invite">
        <p className="dsa-eyebrow">A project in mind? / 06</p>
        <h2>Bring us the site.<br /><em>We&apos;ll find its point of view.</em></h2>
        <div>
          <p>A site plan, a brief and an open conversation are enough to begin.</p>
          <a href="/contact">Start a design conversation <span>↗</span></a>
        </div>
      </section>
    </main>
  );
}
