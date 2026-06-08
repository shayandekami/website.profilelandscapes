"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: string;
  count?: number;
};
type NavGroup = { group: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    group: "Overview",
    items: [{ id: "dashboard", label: "Dashboard", href: "/admin", icon: "⌂" }],
  },
  {
    group: "Work",
    items: [
      { id: "quotes", label: "Quote Inbox", href: "/admin/quotes", icon: "✉" },
      { id: "orders", label: "Orders", href: "/admin/orders", icon: "◈" },
    ],
  },
  {
    group: "Commerce",
    items: [
      { id: "shop", label: "Shop Products", href: "/admin/shop", icon: "◳" },
      { id: "nursery", label: "Nursery Stock", href: "/admin/nursery", icon: "✿" },
      { id: "encyclopedia", label: "Encyclopedia", href: "/admin/encyclopedia", icon: "❦" },
    ],
  },
  {
    group: "Content",
    items: [
      { id: "pages", label: "Pages", href: "/admin/pages", icon: "▤" },
      { id: "portfolio", label: "Project Portfolio", href: "/admin/portfolio", icon: "▣" },
      { id: "media", label: "Media Library", href: "/admin/media", icon: "◱" },
    ],
  },
  {
    group: "System",
    items: [
      { id: "settings", label: "Settings", href: "/admin/settings", icon: "⚙" },
      { id: "audit", label: "Audit log", href: "/admin/audit", icon: "❍" },
    ],
  },
];

type Props = {
  currentUser: { name: string; email: string; role: string } | null;
};

export function Sidebar({ currentUser }: Props) {
  const path = usePathname();

  function isActive(href: string) {
    if (href === "/admin") return path === "/admin";
    return path.startsWith(href);
  }

  const initials = currentUser?.name
    ? currentUser.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "??";

  return (
    <aside className="side">
      <Link className="brand" href="/admin">
        <div className="logo">p</div> Profile
        <span className="env-pill">DEV</span>
      </Link>
      {NAV.map((g) => (
        <div key={g.group}>
          <h6>— {g.group}</h6>
          <nav>
            {g.items.map((it) => (
              <Link
                key={it.id}
                href={it.href}
                className={isActive(it.href) ? "on" : ""}
              >
                <span className="dot">{it.icon}</span>
                {it.label}
                {it.count !== undefined && <span className="ct">{it.count}</span>}
              </Link>
            ))}
          </nav>
        </div>
      ))}
      <div className="userchip">
        <div className="av">{initials}</div>
        <div>
          <div className="n">{currentUser?.name || "—"}</div>
          <div className="r" style={{ textTransform: "capitalize" }}>
            {currentUser?.role || "—"}
          </div>
        </div>
        <form action="/api/admin/signout" method="post" style={{ marginLeft: "auto" }}>
          <button
            type="submit"
            title="Sign out"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--muted)",
              cursor: "pointer",
              fontSize: 13,
              padding: 4,
            }}
          >
            ⏻
          </button>
        </form>
      </div>
    </aside>
  );
}
