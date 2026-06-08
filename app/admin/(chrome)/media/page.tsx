import { db, media } from "@/lib/db";
import { desc } from "drizzle-orm";
import MediaUploadForm from "./MediaUploadForm";
import CopyUrlButton from "./CopyUrlButton";

export default async function MediaLibraryPage() {
  const rows = await db
    .select()
    .from(media)
    .orderBy(desc(media.createdAt))
    .limit(200);

  function formatBytes(bytes: number | null | undefined) {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  return (
    <main className="main-content">
      <div className="page-head-a">
        <div>
          <h1>
            Media <span className="it">library.</span>
          </h1>
          <div className="sub">
            Uploaded images and files. Use these URLs in page sections and
            project galleries.
          </div>
        </div>
      </div>

      {/* Upload form */}
      <div className="panel" style={{ marginBottom: 32 }}>
        <div
          style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}
        >
          Upload a file
        </div>
        <MediaUploadForm />
      </div>

      {/* Media grid */}
      {rows.length === 0 ? (
        <div className="panel" style={{ color: "var(--muted)", textAlign: "center", padding: "48px 24px" }}>
          No media uploaded yet.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 16,
          }}
        >
          {rows.map((m) => (
            <div
              key={m.id}
              className="panel"
              style={{ padding: 0, overflow: "hidden" }}
            >
              {/* Thumbnail */}
              <div
                style={{
                  width: "100%",
                  aspectRatio: "16/9",
                  background: "var(--bone, #f4efe4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.url}
                  alt={m.alt ?? m.filename}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  loading="lazy"
                />
              </div>

              {/* Meta */}
              <div style={{ padding: "10px 12px" }}>
                <div
                  className="mono"
                  style={{
                    fontSize: 11.5,
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={m.filename}
                >
                  {m.filename}
                </div>
                <div
                  className="muted"
                  style={{ fontSize: 11.5, marginTop: 3 }}
                >
                  {m.width && m.height
                    ? `${m.width} × ${m.height}px · `
                    : ""}
                  {formatBytes(m.sizeBytes)}
                </div>
                <div
                  className="muted"
                  style={{ fontSize: 11, marginTop: 3 }}
                >
                  {new Date(m.createdAt).toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
                <div style={{ marginTop: 8 }}>
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 11.5,
                      color: "var(--accent, #1f5a3d)",
                      textDecoration: "none",
                    }}
                  >
                    Open ↗
                  </a>
                  <CopyUrlButton url={m.url} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
