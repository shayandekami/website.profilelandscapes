"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/trade/logout", { method: "POST" });
    router.push("/plants");
    router.refresh();
  }
  return (
    <button
      onClick={logout}
      style={{ padding: "11px 22px", borderRadius: 999, background: "#fff", color: "var(--ink, #133024)", border: "1px solid rgba(19,48,36,0.16)", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}
    >
      Log out
    </button>
  );
}
