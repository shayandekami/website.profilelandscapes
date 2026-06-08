"use client";

import { useState, useTransition } from "react";
import type { SaveResult } from "@/app/admin/(chrome)/settings/actions";

type Settings = {
  studio_name: string;
  tagline: string;
  phone: string;
  mobile: string;
  email: string;
  address: string;
  legal: { acn: string; abn: string; licence: string; founded: number };
  theme_tokens: Record<string, string>;
};

type TeamMember = {
  id: number;
  name: string;
  email: string;
  role: string;
  lastLoginAt: string | null;
};

type Props = {
  initial: Settings;
  save: (input: unknown) => Promise<SaveResult>;
  team: TeamMember[];
  currentUserEmail: string;
  changePassword: (formData: FormData) => Promise<void>;
};

export function SettingsEditor({
  initial,
  save,
  team,
  currentUserEmail,
  changePassword,
}: Props) {
  const [s, setS] = useState(initial);
  const [msg, setMsg] = useState<{ text: string; kind: "idle" | "ok" | "err" | "saving" }>({
    text: "",
    kind: "idle",
  });
  const [pending, startTransition] = useTransition();

  function patch<K extends keyof Settings>(k: K, v: Settings[K]) {
    setS((p) => ({ ...p, [k]: v }));
  }

  function patchLegal<K extends keyof Settings["legal"]>(k: K, v: Settings["legal"][K]) {
    setS((p) => ({ ...p, legal: { ...p.legal, [k]: v } }));
  }

  function patchToken(k: string, v: string) {
    setS((p) => ({ ...p, theme_tokens: { ...p.theme_tokens, [k]: v } }));
  }

  function doSave() {
    setMsg({ text: "Saving…", kind: "saving" });
    startTransition(async () => {
      const r = await save(s);
      if (r.ok) {
        setMsg({ text: "Saved — changes are live", kind: "ok" });
      } else {
        setMsg({ text: r.error, kind: "err" });
      }
    });
  }

  return (
    <>
      {msg.kind !== "idle" && (
        <div
          style={{
            padding: "10px 16px",
            borderRadius: 4,
            marginBottom: 16,
            background: msg.kind === "err" ? "#fdf3eb" : msg.kind === "ok" ? "#e8f0eb" : "#faf8f0",
            color:
              msg.kind === "err"
                ? "var(--danger)"
                : msg.kind === "ok"
                  ? "var(--sage)"
                  : "var(--ink-2)",
            fontSize: 13.5,
            border: "1px solid",
            borderColor: msg.kind === "err" ? "#ecc7a5" : msg.kind === "ok" ? "#c5dac9" : "var(--line)",
          }}
        >
          {msg.text}
        </div>
      )}

      <div className="detail-split">
        {/* Brand */}
        <div className="dtl-card">
          <h4>Site &amp; brand</h4>
          <div className="dtl-sub">PUBLIC-FACING CONFIG</div>

          <div className="ed-field">
            <label>— Studio name</label>
            <input value={s.studio_name} onChange={(e) => patch("studio_name", e.target.value)} />
            <div className="helpt">Shown in the header, footer, and email signatures.</div>
          </div>
          <div className="ed-field">
            <label>— Tagline</label>
            <input value={s.tagline} onChange={(e) => patch("tagline", e.target.value)} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="ed-field" style={{ margin: 0 }}>
              <label>— Phone</label>
              <input value={s.phone} onChange={(e) => patch("phone", e.target.value)} />
            </div>
            <div className="ed-field" style={{ margin: 0 }}>
              <label>— Mobile</label>
              <input value={s.mobile} onChange={(e) => patch("mobile", e.target.value)} />
            </div>
          </div>

          <div className="ed-field">
            <label>— Email</label>
            <input type="email" value={s.email} onChange={(e) => patch("email", e.target.value)} />
            <div className="helpt">Quote enquiries from the contact form go here.</div>
          </div>

          <div className="ed-field">
            <label>— Address</label>
            <input value={s.address} onChange={(e) => patch("address", e.target.value)} />
          </div>
        </div>

        {/* Legal */}
        <div className="dtl-card">
          <h4>Legal &amp; registration</h4>
          <div className="dtl-sub">SHOWN IN THE FOOTER</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="ed-field" style={{ margin: 0 }}>
              <label>— ACN</label>
              <input value={s.legal.acn} onChange={(e) => patchLegal("acn", e.target.value)} />
            </div>
            <div className="ed-field" style={{ margin: 0 }}>
              <label>— ABN</label>
              <input value={s.legal.abn} onChange={(e) => patchLegal("abn", e.target.value)} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="ed-field" style={{ margin: 0 }}>
              <label>— Contractor licence</label>
              <input value={s.legal.licence} onChange={(e) => patchLegal("licence", e.target.value)} />
            </div>
            <div className="ed-field" style={{ margin: 0 }}>
              <label>— Founded year</label>
              <input
                type="number"
                value={s.legal.founded}
                onChange={(e) => patchLegal("founded", Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Theme tokens */}
      <div className="dtl-card" style={{ marginTop: 24 }}>
        <h4>Theme colours</h4>
        <div className="dtl-sub">
          BRAND PALETTE — DRIVES THE PUBLIC SITE CSS VARIABLES
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 16,
            marginTop: 16,
          }}
        >
          {(["ink", "paper", "bone", "accent", "cream"] as const).map((key) => (
            <div key={key}>
              <label
                style={{
                  display: "block",
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: 10.5,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--sage)",
                  marginBottom: 8,
                }}
              >
                — {key}
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  border: "1px solid var(--line)",
                  borderRadius: 6,
                  padding: "8px 10px",
                  background: "#fff",
                }}
              >
                <input
                  type="color"
                  value={normaliseHex(s.theme_tokens[key] || "#000000")}
                  onChange={(e) => patchToken(key, e.target.value)}
                  style={{
                    width: 36,
                    height: 30,
                    border: "1px solid var(--line)",
                    borderRadius: 4,
                    cursor: "pointer",
                    padding: 0,
                  }}
                />
                <input
                  value={s.theme_tokens[key] || ""}
                  onChange={(e) => patchToken(key, e.target.value)}
                  style={{
                    border: "none",
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: 13,
                    width: "100%",
                    background: "transparent",
                    outline: "none",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="helpt" style={{ marginTop: 12 }}>
          These map directly to CSS variables (--ink, --paper, etc.) on the
          public site. Drastic palette changes may affect contrast — preview
          before publishing.
        </div>
      </div>

      <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <a className="btn" href="/" target="_blank" rel="noreferrer">
          View live site ↗
        </a>
        <button className="btn pub" disabled={pending} onClick={doSave}>
          Save all settings
        </button>
      </div>

      {/* Team */}
      <div className="dtl-card" style={{ marginTop: 32 }}>
        <h4>Team &amp; access</h4>
        <div className="dtl-sub">
          {team.length} ACTIVE SEAT{team.length === 1 ? "" : "S"}
        </div>
        <table className="tbl" style={{ margin: "16px -26px 0" }}>
          <tbody>
            {team.map((u) => {
              const initials = u.name
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();
              return (
                <tr key={u.id}>
                  <td>
                    <span className="av">{initials}</span>
                    {u.name}
                    {u.email === currentUserEmail && (
                      <span
                        className="chip pub"
                        style={{ marginLeft: 8, fontSize: 10 }}
                      >
                        you
                      </span>
                    )}
                    <div className="sub" style={{ marginLeft: 38 }}>
                      {u.email}
                    </div>
                  </td>
                  <td>
                    <span className="chip" style={{ textTransform: "capitalize" }}>
                      {u.role}
                    </span>
                  </td>
                  <td className="mono muted">
                    {u.lastLoginAt
                      ? new Date(u.lastLoginAt).toLocaleDateString("en-AU", {
                          day: "numeric",
                          month: "short",
                        })
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="helpt" style={{ marginTop: 12 }}>
          Inviting teammates lands in Phase 3 (needs email verification).
          For now, add users by editing the DB directly via{" "}
          <code style={{ fontFamily: "JetBrains Mono, monospace" }}>
            npm run db:studio
          </code>
          .
        </div>
      </div>

      {/* Password change */}
      <div className="dtl-card" style={{ marginTop: 24 }}>
        <h4>Your password</h4>
        <div className="dtl-sub">SIGNED IN AS {currentUserEmail.toUpperCase()}</div>
        <form
          action={async (formData: FormData) => {
            try {
              await changePassword(formData);
              alert("Password updated.");
              (document.getElementById("pwForm") as HTMLFormElement)?.reset();
            } catch (e: unknown) {
              alert(e instanceof Error ? e.message : "Could not change password");
            }
          }}
          id="pwForm"
          style={{ marginTop: 12, maxWidth: 420 }}
        >
          <div className="ed-field">
            <label>— Current password</label>
            <input name="current" type="password" required />
          </div>
          <div className="ed-field">
            <label>— New password</label>
            <input name="next" type="password" minLength={8} required />
            <div className="helpt">At least 8 characters.</div>
          </div>
          <button className="btn pri" type="submit">
            Update password
          </button>
        </form>
      </div>
    </>
  );
}

function normaliseHex(v: string): string {
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v;
  if (/^#[0-9a-fA-F]{3}$/.test(v)) {
    const [r, g, b] = v.slice(1);
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return "#000000";
}
