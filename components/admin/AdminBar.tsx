"use client";

import { usePathname } from "next/navigation";

type Props = { userName: string };

export function AdminBar({ userName }: Props) {
  const path = usePathname();

  // Map public path to admin edit destination
  let editHref = "/admin/pages";
  let editLabel = "Edit page";
  if (path.startsWith("/projects/")) {
    editHref = "/admin/portfolio";
    editLabel = "Edit portfolio";
  } else if (path === "/projects") {
    editHref = "/admin/portfolio";
    editLabel = "Portfolio";
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "rgba(19,48,36,0.93)",
        backdropFilter: "blur(8px)",
        borderTop: "1px solid rgba(31,90,61,0.35)",
        display: "flex",
        alignItems: "center",
        gap: 0,
        height: 44,
        padding: "0 20px",
        fontFamily: "inherit",
        fontSize: 12,
        letterSpacing: "0.05em",
        color: "rgba(255,255,255,0.55)",
      }}
    >
      {/* Brand dot */}
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "#1f5a3d",
          display: "inline-block",
          marginRight: 10,
          flexShrink: 0,
          boxShadow: "0 0 0 2px rgba(31,90,61,0.4)",
        }}
      />
      <span style={{ color: "rgba(255,255,255,0.35)", marginRight: 16 }}>ADMIN</span>

      {/* Current path */}
      <span
        style={{
          flex: 1,
          color: "rgba(255,255,255,0.5)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {path}
      </span>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <a
          href={editHref}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            background: "#1f5a3d",
            color: "#fff",
            borderRadius: 3,
            fontWeight: 600,
            fontSize: 11.5,
            letterSpacing: "0.08em",
            textDecoration: "none",
            textTransform: "uppercase",
          }}
        >
          ✏ {editLabel}
        </a>
        <a
          href="/admin"
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "6px 12px",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.7)",
            borderRadius: 3,
            fontSize: 11.5,
            letterSpacing: "0.06em",
            textDecoration: "none",
          }}
        >
          Dashboard
        </a>
        <span
          style={{
            marginLeft: 8,
            paddingLeft: 12,
            borderLeft: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.4)",
            whiteSpace: "nowrap",
          }}
        >
          {userName}
        </span>
      </div>
    </div>
  );
}
