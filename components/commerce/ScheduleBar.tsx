"use client";

import { useEffect, useState } from "react";
import { scheduleCount } from "@/lib/scheduleList";

/** Floating plant-schedule indicator, sits above the quote bar. Hidden when empty. */
export function ScheduleBar() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const u = () => setCount(scheduleCount());
    u();
    window.addEventListener("pl-schedule-change", u);
    window.addEventListener("storage", u);
    return () => {
      window.removeEventListener("pl-schedule-change", u);
      window.removeEventListener("storage", u);
    };
  }, []);
  if (count === 0) return null;
  return (
    <a
      href="/schedule"
      style={{
        position: "fixed", right: 20, bottom: 76, zIndex: 50,
        display: "inline-flex", alignItems: "center", gap: 10,
        padding: "11px 18px", borderRadius: 999,
        background: "#fff", color: "var(--ink, #133024)",
        border: "1px solid rgba(19,48,36,0.16)",
        fontFamily: "var(--sans, 'Inter Tight', sans-serif)", fontSize: 13.5, fontWeight: 500,
        textDecoration: "none", boxShadow: "0 10px 24px rgba(19,48,36,0.16)",
      }}
    >
      <span aria-hidden="true">🌿</span>
      Schedule
      <span style={{ background: "var(--ink, #133024)", color: "#fff", borderRadius: 999, minWidth: 20, height: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, padding: "0 6px" }}>{count}</span>
    </a>
  );
}
