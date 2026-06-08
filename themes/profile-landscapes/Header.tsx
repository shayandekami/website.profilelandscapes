"use client";

import { useEffect, useState } from "react";
import type { NavGroup } from "../types";

type Props = { studioName: string; nav: NavGroup[] };

export function Header({ studioName, nav }: Props) {
  const [shrunk, setShrunk] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setShrunk(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className={`nav ${shrunk ? "shrunk" : ""}`}>
        <div className="nav-inner">
          <a href="/" className="brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/logo.png" alt="" />
            <span>{studioName}</span>
          </a>

          <nav className="primary-nav">
            <ul>
              {nav.map((g) => (
                <li key={g.key} className="has-mega">
                  <a href={g.href}>{g.label}</a>
                  {g.children && (
                    <div className="mega" role="menu">
                      <div className="mega-inner">
                        {g.tagline && (
                          <div className="mega-tag">
                            <span className="eyebrow">{g.label}</span>
                            <p>{g.tagline}</p>
                          </div>
                        )}
                        <ul className="mega-list">
                          {g.children.map((c) => (
                            <li key={c.href}>
                              <a href={c.href}>
                                <span className="ml">{c.label}</span>
                                <span className="md">{c.description}</span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </li>
              ))}
              <li>
                <a href="/contact">Contact</a>
              </li>
            </ul>
          </nav>

          <div className="nav-right">
            <a href="tel:+61295685868" className="tel-mini" aria-label="Phone">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>(02) 9568 5868</span>
            </a>
            <a href="/contact" className="cta-btn">
              Request a quote →
            </a>
            <button
              className="nav-burger"
              aria-label="Menu"
              onClick={() => setMobileOpen((s) => !s)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>

        <div className={`mobile-nav ${mobileOpen ? "open" : ""}`}>
          {nav.map((g) => (
            <div key={g.key} className="mn-group">
              <a href={g.href} className="mn-head" onClick={() => setMobileOpen(false)}>
                {g.label}
              </a>
              {g.children && (
                <ul>
                  {g.children.map((c) => (
                    <li key={c.href}>
                      <a href={c.href} onClick={() => setMobileOpen(false)}>
                        {c.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          <div className="mn-group">
            <a href="/contact" className="mn-head" onClick={() => setMobileOpen(false)}>
              Contact
            </a>
          </div>
          <div className="mn-foot">
            <a href="tel:+61295685868">(02) 9568 5868</a>
            <a href="mailto:carlo@profilelandscapes.com.au">
              carlo@profilelandscapes.com.au
            </a>
          </div>
        </div>
      </header>
    </>
  );
}
