"use client";

import { useEffect, useState } from "react";

/**
 * Minimal, privacy-preserving cookie notice. The site uses only functional
 * cookies (trade session/pricing) and localStorage (carts/schedule) — no
 * third-party tracking — so this is an informational acknowledgement.
 */
export function CookieNotice() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("pl_cookie_ack")) setShow(true);
    } catch {
      /* ignore */
    }
  }, []);

  function accept() {
    try { localStorage.setItem("pl_cookie_ack", "1"); } catch { /* ignore */ }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed", left: 20, bottom: 20, zIndex: 60, maxWidth: 380,
        background: "#fff", border: "1px solid rgba(19,48,36,0.16)", borderRadius: 10,
        boxShadow: "0 12px 30px rgba(19,48,36,0.16)", padding: "16px 18px",
        fontFamily: "var(--sans, 'Inter Tight', sans-serif)", color: "var(--ink, #133024)",
      }}
    >
      <p style={{ margin: "0 0 12px", fontSize: 13.5, lineHeight: 1.55, color: "var(--ink-2, #3c554a)" }}>
        We use functional cookies to keep you logged in and apply trade pricing — no third-party tracking.{" "}
        <a href="/privacy" style={{ color: "var(--ink, #133024)", textDecoration: "underline", textUnderlineOffset: 2 }}>Privacy</a>.
      </p>
      <button
        onClick={accept}
        style={{ padding: "9px 18px", borderRadius: 999, background: "var(--ink, #133024)", color: "#fff", border: "none", fontSize: 13.5, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}
      >
        Got it
      </button>
    </div>
  );
}
