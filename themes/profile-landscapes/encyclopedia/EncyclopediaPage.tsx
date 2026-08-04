"use client";

import { useEffect, useMemo, useState } from "react";

type EncyclopediaEntry =
  typeof import("@/lib/db/schema").encyclopediaEntries.$inferSelect;

const FILTERS = [
  { tag: "NATIVE", label: "Australian native" },
  { tag: "INDIGENOUS_SYDNEY", label: "Local Sydney" },
  { tag: "COUNCIL_RECOMMENDED", label: "Council listed" },
  { tag: "TREE", label: "Trees" },
  { tag: "DROUGHT", label: "Drought" },
  { tag: "COASTAL", label: "Coastal" },
  { tag: "SHADE", label: "Shade" },
  { tag: "EDIBLE", label: "Edible" },
  { tag: "FRAGRANT", label: "Fragrant" },
] as const;
const COUNCILS = [
  { key: "city-of-sydney", label: "City of Sydney", matches: ["City of Sydney"] },
  { key: "inner-west", label: "Inner West", matches: ["Inner West Council"] },
  { key: "northern-beaches", label: "Northern Beaches", matches: ["Northern Beaches Council"] },
  { key: "lane-cove", label: "Lane Cove", matches: ["Lane Cove Council"] },
  { key: "city-of-ryde", label: "City of Ryde", matches: ["City of Ryde Council"] },
] as const;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const PAGE_SIZE = 48;
const TAG_LABELS = Object.fromEntries(FILTERS.map(({ tag, label }) => [tag, label]));
const tagLabel = (tag: string) => TAG_LABELS[tag] || tag.replaceAll("_", " ").toLowerCase();
const entryCouncils = (entry: EncyclopediaEntry) => {
  const references = (entry.references as Array<{ source?: string }>) || [];
  return COUNCILS.filter((council) =>
    references.some((reference) => council.matches.some((match) => reference.source?.includes(match))),
  );
};

interface EncyclopediaPageProps {
  entries: EncyclopediaEntry[];
  selectedTag?: string;
  searchQuery?: string;
}

function safeImage(entry: EncyclopediaEntry) {
  const image = (entry.images as Array<{ url: string; alt?: string }>)?.find((item) => item?.url?.trim());
  return image?.url ? image : undefined;
}

function EntryVisual({ entry }: { entry: EncyclopediaEntry }) {
  const image = safeImage(entry);
  if (image) {
    return (
      <div className="enc-card-visual enc-card-photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.url} alt={image.alt || entry.commonName || entry.latinName} loading="lazy" />
      </div>
    );
  }

  const initial = entry.genus?.[0] || entry.latinName[0] || "P";
  return (
    <div className="enc-card-visual enc-card-placeholder" aria-label={`Botanical placeholder for ${entry.latinName}`}>
      <span>{initial.toUpperCase()}</span>
      <i>{entry.genus || entry.family || "Plant reference"}</i>
    </div>
  );
}

function EntryCard({ entry }: { entry: EncyclopediaEntry }) {
  const tags = ((entry.tags as string[]) || []).slice(0, 2);
  return (
    <a href={`/encyclopedia/${entry.slug}`} className="enc-card">
      <EntryVisual entry={entry} />
      <div className="enc-card-body">
        <p className="enc-latin">{entry.latinName}</p>
        <h3>{entry.commonName || entry.genus || "Plant profile"}</h3>
        <p className="enc-family">{entry.family || "Family not recorded"}</p>
        {entryCouncils(entry).length > 0 && (
          <p className="enc-council-source">
            <span aria-hidden="true">◎</span>
            {entryCouncils(entry).map((council) => council.label).join(" · ")}
          </p>
        )}
        <div className="enc-card-foot">
          <div>{tags.map((tag) => <span key={tag}>{tagLabel(tag)}</span>)}</div>
          <b aria-hidden="true">↗</b>
        </div>
      </div>
    </a>
  );
}

function IndexRow({ entry }: { entry: EncyclopediaEntry }) {
  const tags = ((entry.tags as string[]) || []).slice(0, 2);
  return (
    <a href={`/encyclopedia/${entry.slug}`} className="enc-index-row">
      <span className="enc-index-letter">{entry.latinName[0]?.toUpperCase()}</span>
      <div><em>{entry.latinName}</em><strong>{entry.commonName || "—"}</strong></div>
      <span className="enc-index-family">{entry.family || "—"}</span>
      <span className="enc-index-tags">{tags.map(tagLabel).join(" · ") || "Reference"}</span>
      <b aria-hidden="true">↗</b>
    </a>
  );
}

export function EncyclopediaPage({ entries, selectedTag, searchQuery }: EncyclopediaPageProps) {
  const [search, setSearch] = useState(searchQuery || "");
  const [activeTag, setActiveTag] = useState<string | undefined>(selectedTag);
  const [activeLetter, setActiveLetter] = useState<string | undefined>();
  const [activeCouncil, setActiveCouncil] = useState<string | undefined>();
  const [view, setView] = useState<"grid" | "index">("grid");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const activeLetters = useMemo(
    () => new Set(entries.map((entry) => entry.latinName[0]?.toUpperCase()).filter(Boolean)),
    [entries],
  );

  const tagCounts = useMemo(
    () => Object.fromEntries(FILTERS.map(({ tag }) => [
      tag,
      entries.filter((entry) => ((entry.tags as string[]) || []).includes(tag)).length,
    ])),
    [entries],
  );
  const councilCounts = useMemo(
    () => Object.fromEntries(COUNCILS.map((council) => [
      council.key,
      entries.filter((entry) => entryCouncils(entry).some((item) => item.key === council.key)).length,
    ])),
    [entries],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((entry) => {
      const tags = (entry.tags as string[]) || [];
      if (activeTag && !tags.includes(activeTag)) return false;
      if (activeLetter && entry.latinName[0]?.toUpperCase() !== activeLetter) return false;
      if (activeCouncil && !entryCouncils(entry).some((council) => council.key === activeCouncil)) return false;
      if (!q) return true;
      const referenceText = ((entry.references as Array<{ title?: string; source?: string }>) || [])
        .flatMap((reference) => [reference.title, reference.source]);
      return [entry.latinName, entry.commonName, entry.family, entry.genus, entry.description, entry.landscapeUse, ...referenceText]
        .some((value) => value?.toLowerCase().includes(q));
    });
  }, [entries, search, activeTag, activeLetter, activeCouncil]);

  useEffect(() => setVisibleCount(PAGE_SIZE), [search, activeTag, activeLetter, activeCouncil, view]);

  const visible = filtered.slice(0, visibleCount);
  const hasFilters = Boolean(search || activeTag || activeLetter || activeCouncil);
  const clearFilters = () => {
    setSearch("");
    setActiveTag(undefined);
    setActiveLetter(undefined);
    setActiveCouncil(undefined);
  };

  return (
    <main className="enc-page">
      <section className="enc-hero">
        <div className="enc-shell enc-hero-grid">
          <div>
            <p className="enc-kicker">Profile plant encyclopedia</p>
            <h1>Know what<br /><em>will thrive.</em></h1>
          </div>
          <div className="enc-hero-copy">
            <p>A working botanical reference shaped by Sydney sites and council guidance. Search species, distinguish Australian natives from locally indigenous plants, and compare practical growing characteristics.</p>
            <div className="enc-hero-stats">
              <span><strong>{entries.length}</strong> plant profiles</span>
              <span><strong>{activeLetters.size}</strong> botanical initials</span>
              <span><strong>{FILTERS.length}</strong> useful attributes</span>
            </div>
          </div>
        </div>
      </section>

      <section className="enc-discovery">
        <div className="enc-shell">
          <div className="enc-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              aria-label="Search the plant encyclopedia"
              placeholder="Search Latin name, common name, family or landscape use"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search">×</button>}
          </div>

          <div className="enc-filter-row">
            <div className="enc-filter-label"><span>01</span> Refine by attribute</div>
            <div className="enc-filter-chips">
              <button type="button" className={!activeTag ? "is-active" : ""} onClick={() => setActiveTag(undefined)} aria-pressed={!activeTag}>All <small>{entries.length}</small></button>
              {FILTERS.map(({ tag, label }) => tagCounts[tag] > 0 && (
                <button
                  type="button"
                  key={tag}
                  className={activeTag === tag ? "is-active" : ""}
                  onClick={() => setActiveTag(activeTag === tag ? undefined : tag)}
                  aria-pressed={activeTag === tag}
                >
                  {label} <small>{tagCounts[tag]}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="enc-filter-row enc-alpha-row">
            <div className="enc-filter-label"><span>02</span> Browse by genus</div>
            <div className="enc-alphabet" aria-label="Filter by botanical initial">
              <button type="button" className={!activeLetter ? "is-active" : ""} onClick={() => setActiveLetter(undefined)} aria-pressed={!activeLetter}>All</button>
              {ALPHABET.map((letter) => (
                <button
                  type="button"
                  key={letter}
                  disabled={!activeLetters.has(letter)}
                  className={activeLetter === letter ? "is-active" : ""}
                  onClick={() => setActiveLetter(activeLetter === letter ? undefined : letter)}
                  aria-pressed={activeLetter === letter}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          <div className="enc-filter-row enc-council-row">
            <div className="enc-filter-label"><span>03</span> Browse council guidance</div>
            <div className="enc-filter-chips enc-council-chips">
              <button type="button" className={!activeCouncil ? "is-active" : ""} onClick={() => setActiveCouncil(undefined)} aria-pressed={!activeCouncil}>All councils <small>{tagCounts.COUNCIL_RECOMMENDED || 0}</small></button>
              {COUNCILS.map((council) => councilCounts[council.key] > 0 && (
                <button
                  type="button"
                  key={council.key}
                  className={activeCouncil === council.key ? "is-active" : ""}
                  onClick={() => setActiveCouncil(activeCouncil === council.key ? undefined : council.key)}
                  aria-pressed={activeCouncil === council.key}
                >
                  {council.label} <small>{councilCounts[council.key]}</small>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="enc-results">
        <div className="enc-shell">
          <div className="enc-results-bar">
            <div aria-live="polite">
              <p className="enc-kicker">Plant index / {String(filtered.length).padStart(3, "0")}</p>
              <h2>{hasFilters ? "Filtered profiles" : "All plant profiles"}</h2>
            </div>
            <div className="enc-results-actions">
              {hasFilters && <button type="button" className="enc-clear" onClick={clearFilters}>Clear filters ×</button>}
              <div className="enc-view" aria-label="Result view">
                <button type="button" className={view === "grid" ? "is-active" : ""} onClick={() => setView("grid")} aria-pressed={view === "grid"}>Grid</button>
                <button type="button" className={view === "index" ? "is-active" : ""} onClick={() => setView("index")} aria-pressed={view === "index"}>Index</button>
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="enc-empty">
              <span>0 results</span>
              <h2>No plant profile matches that combination.</h2>
              <p>Try a broader botanical name, remove an attribute, or return to the complete index.</p>
              <button type="button" onClick={clearFilters}>Reset the encyclopedia</button>
            </div>
          ) : view === "grid" ? (
            <div className="enc-grid">{visible.map((entry) => <EntryCard key={entry.id} entry={entry} />)}</div>
          ) : (
            <div className="enc-index">
              <div className="enc-index-head"><span></span><span>Botanical / common name</span><span>Family</span><span>Attributes</span><span></span></div>
              {visible.map((entry) => <IndexRow key={entry.id} entry={entry} />)}
            </div>
          )}

          {visible.length < filtered.length && (
            <div className="enc-more">
              <p>Showing {visible.length} of {filtered.length}</p>
              <button type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>Load {Math.min(PAGE_SIZE, filtered.length - visible.length)} more profiles <span>↓</span></button>
            </div>
          )}
        </div>
      </section>

      <section className="enc-help">
        <div className="enc-shell">
          <p className="enc-kicker">Need a planting direction?</p>
          <h2>Turn the reference<br />into a <em>planting palette.</em></h2>
          <div><p>Browse curated combinations for screening, drought resilience, native habitat and difficult Sydney conditions—or ask our nursery and design team.</p><div><a href="/resources">Explore plant guides ↗</a><a href="/contact">Ask the team ↗</a></div></div>
        </div>
      </section>
    </main>
  );
}
