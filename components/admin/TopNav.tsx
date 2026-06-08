"use client";

import { usePathname } from "next/navigation";

const CRUMBS: Record<string, string[]> = {
  "/admin": ["Dashboard"],
  "/admin/quotes": ["Work", "Quote Inbox"],
  "/admin/jobs": ["Work", "Jobs & Projects"],
  "/admin/applicants": ["Work", "Applications"],
  "/admin/pages": ["Content", "Pages"],
  "/admin/portfolio": ["Content", "Project Portfolio"],
  "/admin/media": ["Content", "Media Library"],
  "/admin/settings": ["System", "Settings"],
  "/admin/audit": ["System", "Audit log"],
};

export function TopNav() {
  const path = usePathname();

  const baseKey = Object.keys(CRUMBS)
    .filter((k) => path.startsWith(k))
    .sort((a, b) => b.length - a.length)[0];
  const crumbs = baseKey ? CRUMBS[baseKey] : ["Admin"];

  return (
    <div className="topnav">
      <div className="crumbs">
        {crumbs.map((c, i) =>
          i === crumbs.length - 1 ? (
            <b key={i}>{c}</b>
          ) : (
            <span key={i}>
              {c} <span style={{ opacity: 0.4 }}>/</span>{" "}
            </span>
          )
        )}
      </div>
      <div className="search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6d7570" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input type="text" placeholder="Search projects, plants, people…" />
        <span className="kbd">⌘K</span>
      </div>
      <div className="actions">
        <button className="iconbtn" title="Notifications">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0f1a15" strokeWidth="2">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
        </button>
        <button className="iconbtn" title="Help">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0f1a15" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
          </svg>
        </button>
      </div>
    </div>
  );
}
