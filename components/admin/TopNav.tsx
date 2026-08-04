"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const CRUMBS: Record<string, string[]> = {
  "/admin/quotes": ["Work", "Quote Inbox"], "/admin/jobs": ["Work", "Job Listings"],
  "/admin/applicants": ["Work", "Applications"], "/admin/orders": ["Work", "Orders"],
  "/admin/trade-accounts": ["Work", "Trade Accounts"], "/admin/shop": ["Commerce", "Shop Products"],
  "/admin/nursery": ["Commerce", "Nursery Stock"], "/admin/encyclopedia": ["Commerce", "Encyclopedia"],
  "/admin/reviews": ["Commerce", "Plant Reviews"], "/admin/pages": ["Content", "Pages"],
  "/admin/portfolio": ["Content", "Project Portfolio"], "/admin/media": ["Content", "Media Library"],
  "/admin/settings": ["System", "Settings"], "/admin/audit": ["System", "Audit log"],
  "/admin/search": ["Admin", "Search"], "/admin": ["Dashboard"],
};

export function TopNav() {
  const path = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => setMenuOpen(false), [path]);
  useEffect(() => {
    document.documentElement.classList.toggle("admin-menu-open", menuOpen);
    return () => document.documentElement.classList.remove("admin-menu-open");
  }, [menuOpen]);
  const baseKey = Object.keys(CRUMBS).filter((key) => path.startsWith(key)).sort((a, b) => b.length - a.length)[0];
  const crumbs = baseKey ? CRUMBS[baseKey] : ["Admin"];
  return <div className="topnav">
    <button className="admin-menu-button" type="button" aria-label={menuOpen ? "Close admin menu" : "Open admin menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
      <span /><span /><span />
    </button>
    <div className="crumbs">{crumbs.map((crumb, index) => index === crumbs.length - 1 ? <b key={crumb}>{crumb}</b> : <span key={crumb}>{crumb} <span style={{ opacity: .4 }}>/</span>{" "}</span>)}</div>
    <form className="search" action="/admin/search" method="get">
      <button className="search-submit" type="submit" aria-label="Run search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6d7570" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg></button>
      <input type="search" name="q" placeholder="Search projects, plants, people…" aria-label="Search admin" />
      <span className="kbd">Enter</span>
    </form>
    <div className="actions">
      <Link className="iconbtn" title="Quote inbox" aria-label="Quote inbox" href="/admin/quotes"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0f1a15" strokeWidth="2"><path d="M4 4h16v16H4z" /><path d="m4 6 8 7 8-7" /></svg></Link>
      <Link className="iconbtn" title="Admin settings" aria-label="Admin settings" href="/admin/settings"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0f1a15" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v4H21a1.7 1.7 0 0 0-1.6 1Z" /></svg></Link>
    </div>
    {menuOpen && <button className="admin-menu-backdrop" type="button" aria-label="Close admin menu" onClick={() => setMenuOpen(false)} />}
  </div>;
}
