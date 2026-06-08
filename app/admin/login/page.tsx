import { redirect } from "next/navigation";
import { signIn, auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function loginWithCredentials(formData: FormData) {
  "use server";
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const from = String(formData.get("from") || "/admin");

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch {
    redirect(`/admin/login?error=1${from ? `&from=${encodeURIComponent(from)}` : ""}`);
  }
  redirect(from);
}

async function loginWithMicrosoft(formData: FormData) {
  "use server";
  const from = String(formData.get("from") || "/admin");
  await signIn("microsoft-entra-id", { redirectTo: from });
}

type Search = Promise<{ from?: string; error?: string }>;

const TOKENS = {
  ink: "#133024",
  paper: "#ffffff",
  bone: "#f4efe4",
  accent: "#1f5a3d",
  cream: "#e8dcb6",
  ink2: "#3c554a",
  line: "#dcd4bf",
};

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Search;
}) {
  const session = await auth();
  if (session?.user) redirect("/admin");
  const { from, error } = await searchParams;
  const ssoEnabled =
    !!process.env.AZURE_CLIENT_ID && !!process.env.AZURE_TENANT_ID;

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        background: TOKENS.bone,
      }}
    >
      {/* left — editorial */}
      <div
        style={{
          background: TOKENS.ink,
          color: "#fff",
          padding: "80px 56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.18em", opacity: 0.6 }}>
          — PROFILE LANDSCAPES ADMIN
        </div>
        <div>
          <h1
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 400,
              fontSize: 56,
              lineHeight: 1.05,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Tending the
            <br />
            <span style={{ fontStyle: "italic", color: TOKENS.cream }}>
              studio backstage.
            </span>
          </h1>
          <p style={{ marginTop: 28, fontSize: 16, lineHeight: 1.6, color: "#c8c2b0", maxWidth: "44ch" }}>
            Quotes, jobs, the nursery roll, the encyclopedia, the people we&apos;ve
            hired. One place for all of it.
          </p>
        </div>
        <div style={{ fontSize: 12.5, opacity: 0.5 }}>
          © 1999–{new Date().getFullYear()} Profile Landscapes
        </div>
      </div>

      {/* right — form */}
      <div
        style={{
          padding: "80px 56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: TOKENS.bone,
          color: TOKENS.ink,
        }}
      >
        <div style={{ maxWidth: 380, width: "100%" }}>
          <h2
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 400,
              fontSize: 34,
              margin: 0,
              letterSpacing: "-0.01em",
              color: TOKENS.ink,
            }}
          >
            Sign in.
          </h2>
          <p style={{ marginTop: 8, color: TOKENS.ink2, fontSize: 15 }}>
            Use your studio email and password, or Microsoft work account.
          </p>

          {error && (
            <div
              style={{
                background: "#fdf3eb",
                border: "1px solid #ecc7a5",
                borderRadius: 4,
                padding: "10px 12px",
                fontSize: 13.5,
                marginTop: 16,
                color: "#8a4d10",
              }}
            >
              Email or password not recognised.
            </div>
          )}

          {ssoEnabled && (
            <form action={loginWithMicrosoft} style={{ marginTop: 24 }}>
              <input type="hidden" name="from" value={from || "/admin"} />
              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "#fff",
                  color: TOKENS.ink,
                  border: `1px solid ${TOKENS.line}`,
                  borderRadius: 999,
                  fontSize: 14.5,
                  fontWeight: 500,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="1" width="10" height="10" fill="#F25022" />
                  <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
                  <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
                  <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
                </svg>
                Sign in with Microsoft
              </button>
            </form>
          )}

          {ssoEnabled && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                margin: "20px 0",
                color: TOKENS.ink2,
                fontSize: 12,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.14em",
              }}
            >
              <div style={{ flex: 1, height: 1, background: TOKENS.line }} />
              <span>OR</span>
              <div style={{ flex: 1, height: 1, background: TOKENS.line }} />
            </div>
          )}

          <form action={loginWithCredentials} style={{ marginTop: ssoEnabled ? 0 : 24 }}>
            <input type="hidden" name="from" value={from || "/admin"} />

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: TOKENS.ink2,
                  marginBottom: 8,
                }}
              >
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  fontSize: 15,
                  border: `1px solid ${TOKENS.line}`,
                  borderRadius: 4,
                  background: "#fff",
                  color: TOKENS.ink,
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div style={{ marginBottom: 22 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: TOKENS.ink2,
                  marginBottom: 8,
                }}
              >
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  fontSize: 15,
                  border: `1px solid ${TOKENS.line}`,
                  borderRadius: 4,
                  background: "#fff",
                  color: TOKENS.ink,
                  fontFamily: "inherit",
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "13px 20px",
                background: TOKENS.ink,
                color: "#fff",
                border: "none",
                borderRadius: 999,
                fontSize: 14.5,
                fontWeight: 500,
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              Sign in →
            </button>

            <p style={{ marginTop: 24, fontSize: 12.5, color: TOKENS.ink2, lineHeight: 1.5 }}>
              <b>Demo credentials</b> (seeded for local dev):
              <br />
              admin@profilelandscapes.com.au / pl-admin-2026
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
