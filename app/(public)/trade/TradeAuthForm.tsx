"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const T = { ink: "#133024", sage: "#1f5a3d", moss: "#3c554a", line: "rgba(19,48,36,0.16)", bone: "#f4efe4" };

export function TradeAuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", company: "", contactName: "", phone: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      const res = await fetch(`/api/trade/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "Something went wrong.");
      // Registration no longer signs you in — new accounts are pending staff
      // approval before trade pricing applies, so show a confirmation instead
      // of pushing to /trade/account (which would bounce back to login).
      if (j.pending) {
        setSubmitted(j.message || "Thanks — your trade account is pending review. We'll email you once it's approved.");
        setBusy(false);
        return;
      }
      router.push("/trade/account");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  if (submitted) {
    return (
      <div style={{ maxWidth: 440 }}>
        <div style={{ background: "#eaf7ef", border: "1px solid #b7e0c6", color: "#12603a", padding: "16px 18px", borderRadius: 10, fontSize: 15, lineHeight: 1.55 }}>
          <b style={{ display: "block", marginBottom: 4 }}>Application received</b>
          {submitted}
        </div>
        <p style={{ fontSize: 14.5, color: T.moss, marginTop: 18, lineHeight: 1.6 }}>
          In the meantime you can{" "}
          <a href="/plants" style={{ color: T.ink, textDecoration: "underline", textUnderlineOffset: 3 }}>browse the range</a>{" "}
          or{" "}
          <a href="/quote" style={{ color: T.ink, textDecoration: "underline", textUnderlineOffset: 3 }}>request a quote</a>.
        </p>
      </div>
    );
  }

  const input: React.CSSProperties = { width: "100%", padding: "12px 14px", border: `1px solid ${T.line}`, borderRadius: 8, fontSize: 15, fontFamily: "inherit", color: T.ink, background: "#fff", boxSizing: "border-box", outline: "none" };

  return (
    <form onSubmit={submit} style={{ maxWidth: 440 }}>
      {error && <div style={{ background: "#fdecec", border: "1px solid #f3c0c0", color: "#a3392d", padding: "11px 14px", borderRadius: 8, fontSize: 14, marginBottom: 16 }}>{error}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {mode === "register" && (
          <>
            <input placeholder="Company / trading name" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} style={input} />
            <input placeholder="Contact name" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} style={input} />
            <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={input} />
          </>
        )}
        <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={input} />
        <input required type="password" placeholder={mode === "register" ? "Password (min 8 characters)" : "Password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={input} />
      </div>
      <button type="submit" disabled={busy} style={{ width: "100%", marginTop: 18, padding: "14px", borderRadius: 999, background: T.ink, color: "#fff", border: "none", fontSize: 15, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", opacity: busy ? 0.6 : 1 }}>
        {busy ? "Please wait…" : mode === "register" ? "Create trade account" : "Log in"}
      </button>
      <p style={{ fontSize: 14, color: T.moss, marginTop: 18, textAlign: "center" }}>
        {mode === "register" ? (
          <>Already have an account? <a href="/trade/login" style={{ color: T.ink }}>Log in</a></>
        ) : (
          <>New trade buyer? <a href="/trade/register" style={{ color: T.ink }}>Open a trade account</a></>
        )}
      </p>
    </form>
  );
}
