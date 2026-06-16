"use client";

import { useState } from "react";

type EncyclopediaEntry =
  typeof import("@/lib/db/schema").encyclopediaEntries.$inferSelect;

const T = {
  ink: "#133024",
  sage: "#1f5a3d",
  moss: "#3c554a",
  ochre: "#c2783a",
  cream: "#e8dcb6",
  paper: "#faf6eb",
  line: "rgba(19,48,36,0.12)",
};

const ALL_TAGS = ["NATIVE", "DROUGHT", "FRAGRANT", "COASTAL", "SHADE", "EDIBLE"] as const;

function truncate(s: string | null | undefined, n: number): string {
  if (!s) return "";
  return s.length > n ? s.slice(0, n) + "…" : s;
}

function EntryCard({ entry }: { entry: EncyclopediaEntry }) {
  const tags: string[] = (entry.tags as string[]) || [];
  const img = (entry.images as Array<{ url: string; alt?: string }>)?.[0];

  return (
    <a
      href={`/encyclopedia/${entry.slug}`}
      style={{
        background: "#fff",
        border: `1px solid ${T.line}`,
        borderRadius: 8,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.2s",
        display: "grid",
        gridTemplateRows: entry.images?.length ? "180px auto" : "auto",
        textDecoration: "none",
        color: T.ink,
      }}
      onMouseEnter={(e) =>
        Object.assign((e.currentTarget as HTMLElement).style, {
          transform: "translateY(-2px)",
          boxShadow: "0 10px 24px rgba(19,48,36,0.07)",
        })
      }
      onMouseLeave={(e) =>
        Object.assign((e.currentTarget as HTMLElement).style, {
          transform: "translateY(0)",
          boxShadow: "none",
        })
      }
    >
      {img && (
        <div style={{ overflow: "hidden", background: "#e8dcb6" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.url} alt={img.alt || entry.latinName} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
      <div style={{ padding: "18px 20px" }}>
        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                style={{
                  background:
                    tag === "NATIVE"
                      ? T.sage
                      : tag === "DROUGHT"
                        ? T.ochre
                        : "rgba(19,48,36,0.07)",
                  color:
                    tag === "NATIVE" || tag === "DROUGHT" ? "#fff" : T.moss,
                  fontSize: 10,
                  fontFamily: "'JetBrains Mono', monospace",
                  padding: "3px 7px",
                  borderRadius: 3,
                  letterSpacing: "0.06em",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Latin name */}
        <div
          style={{
            fontFamily: "Fraunces, serif",
            fontStyle: "italic",
            color: T.sage,
            fontSize: 13,
            marginBottom: 4,
          }}
        >
          {entry.latinName}
        </div>

        {/* Common name */}
        {entry.commonName && (
          <h3
            style={{
              fontFamily: "Fraunces, serif",
              fontWeight: 400,
              fontSize: 19,
              letterSpacing: "-0.005em",
              margin: "0 0 4px",
              lineHeight: 1.2,
              color: T.ink,
            }}
          >
            {entry.commonName}
          </h3>
        )}

        {/* Family */}
        {entry.family && (
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10.5,
              color: "#8a9489",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            {entry.family}
          </div>
        )}

        {/* Description excerpt */}
        {entry.description && (
          <p
            style={{
              fontSize: 13.5,
              lineHeight: 1.55,
              color: T.moss,
              margin: "10px 0 14px",
            }}
          >
            {truncate(entry.description, 120)}
          </p>
        )}

        <div
          style={{
            fontSize: 12,
            color: T.sage,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Learn more →
        </div>
      </div>
    </a>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface EncyclopediaPageProps {
  entries: EncyclopediaEntry[];
  selectedTag?: string;
  searchQuery?: string;
}

// ── Main component ────────────────────────────────────────────────────────────
export function EncyclopediaPage({
  entries,
  selectedTag,
  searchQuery,
}: EncyclopediaPageProps) {
  const [search, setSearch] = useState(searchQuery || "");
  const [activeTag, setActiveTag] = useState<string | undefined>(selectedTag);
  const [activeLetter, setActiveLetter] = useState<string | undefined>();

  // Letters that have at least one entry
  const activeLetters = new Set(entries.map((e) => e.latinName[0]?.toUpperCase()).filter(Boolean));
  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const filtered = entries.filter((e) => {
    const tags: string[] = (e.tags as string[]) || [];
    if (activeTag && !tags.includes(activeTag)) return false;
    if (activeLetter && e.latinName[0]?.toUpperCase() !== activeLetter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        e.latinName.toLowerCase().includes(q) ||
        e.commonName?.toLowerCase().includes(q) ||
        e.family?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const wrap: React.CSSProperties = { maxWidth: 1400, margin: "0 auto", padding: "0 56px" };

  return (
    <div style={{ background: "#faf6eb", color: T.ink, fontFamily: "'Inter Tight', sans-serif", minHeight: "100vh" }}>

      {/* ── PAGE HEADER ──────────────────────────────────────────────── */}
      <section style={{ ...wrap, paddingTop: 48, paddingBottom: 0 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.16em", color: T.sage, textTransform: "uppercase", marginBottom: 12 }}>
          Plant encyclopedia
        </div>
        <h1
          style={{
            fontFamily: "Fraunces, serif",
            fontWeight: 300,
            fontSize: "clamp(40px,5vw,64px)",
            letterSpacing: "-0.025em",
            margin: "0 0 12px",
            lineHeight: 1,
            color: T.ink,
          }}
        >
          The plant{" "}
          <span style={{ fontStyle: "italic", color: T.sage }}>reference.</span>
        </h1>
        <p style={{ fontSize: 15, color: T.moss, maxWidth: "62ch", margin: "0 0 32px", lineHeight: 1.55 }}>
          Botanical reference for every plant in our portfolio — care guides, growing conditions, and seasonal charts.
        </p>

        {/* Search + tag bar */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", paddingBottom: 28, borderBottom: `1px solid ${T.line}` }}>
          <input
            type="search"
            placeholder="Search by latin name, common name, family…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: "1 1 300px",
              border: `1px solid ${T.line}`,
              background: "#fff",
              padding: "11px 16px",
              borderRadius: 999,
              fontSize: 14,
              fontFamily: "inherit",
              color: T.ink,
              outline: "none",
            }}
          />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button
              onClick={() => setActiveTag(undefined)}
              style={{
                padding: "8px 14px",
                border: `1px solid ${!activeTag ? T.ink : T.line}`,
                borderRadius: 999,
                fontSize: 12,
                cursor: "pointer",
                background: !activeTag ? T.ink : "#fff",
                color: !activeTag ? "#fff" : T.ink,
                fontFamily: "inherit",
                transition: "all 0.15s",
              }}
            >
              All
            </button>
            {ALL_TAGS.map((tag) => {
              const count = entries.filter((e) => ((e.tags as string[]) || []).includes(tag)).length;
              if (!count) return null;
              const on = activeTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setActiveTag(on ? undefined : tag)}
                  style={{
                    padding: "8px 14px",
                    border: `1px solid ${on ? T.ink : T.line}`,
                    borderRadius: 999,
                    fontSize: 12,
                    cursor: "pointer",
                    background: on ? T.ink : "#fff",
                    color: on ? "#fff" : T.ink,
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}
                >
                  {tag.charAt(0) + tag.slice(1).toLowerCase()} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* A–Z jump bar */}
        <div style={{ display: "flex", gap: 3, flexWrap: "wrap", paddingTop: 20, paddingBottom: 8 }}>
          <button
            onClick={() => setActiveLetter(undefined)}
            style={{
              minWidth: 32,
              padding: "5px 8px",
              border: `1px solid ${!activeLetter ? T.ink : T.line}`,
              borderRadius: 4,
              fontSize: 12.5,
              cursor: "pointer",
              background: !activeLetter ? T.ink : "#fff",
              color: !activeLetter ? "#fff" : T.ink,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 500,
              transition: "all 0.15s",
            }}
          >
            All
          </button>
          {ALPHABET.map((letter) => {
            const has = activeLetters.has(letter);
            const on = activeLetter === letter;
            return (
              <button
                key={letter}
                onClick={() => has && setActiveLetter(on ? undefined : letter)}
                style={{
                  minWidth: 32,
                  padding: "5px 8px",
                  border: `1px solid ${on ? T.ink : has ? T.line : "transparent"}`,
                  borderRadius: 4,
                  fontSize: 12.5,
                  cursor: has ? "pointer" : "default",
                  background: on ? T.ink : "#fff",
                  color: on ? "#fff" : has ? T.ink : "rgba(19,48,36,0.2)",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 500,
                  transition: "all 0.15s",
                }}
              >
                {letter}
              </button>
            );
          })}
        </div>

        {/* Results count */}
        <div style={{ paddingTop: 10, paddingBottom: 4, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#5d7363", letterSpacing: "0.12em" }}>
          {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
          {activeLetter ? ` · ${activeLetter}…` : ""}
          {activeTag ? ` · ${activeTag}` : ""}
          {search ? ` · "${search}"` : ""}
        </div>
      </section>

      {/* ── GRID ─────────────────────────────────────────────────────── */}
      <section style={{ ...wrap, marginTop: 24, marginBottom: 80 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "80px 0", textAlign: "center", color: T.moss }}>
            <div style={{ fontFamily: "Fraunces, serif", fontSize: 28, marginBottom: 12 }}>
              No entries found.
            </div>
            <button
              onClick={() => { setSearch(""); setActiveTag(undefined); setActiveLetter(undefined); }}
              style={{ background: T.ink, color: "#fff", border: "none", padding: "12px 24px", borderRadius: 999, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 18,
            }}
          >
            {filtered.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
