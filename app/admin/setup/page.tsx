import { redirect } from "next/navigation";
import Link from "next/link";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { db, users } from "@/lib/db";

export const dynamic = "force-dynamic";

const TOKENS = {
  ink: "#133024",
  paper: "#ffffff",
  bone: "#f4efe4",
  accent: "#1f5a3d",
  cream: "#e8dcb6",
  ink2: "#3c554a",
  line: "#dcd4bf",
};

async function userCount(): Promise<number> {
  const rows = await db
    .select({ n: sql<number>`count(*)` })
    .from(users);
  return Number(rows[0]?.n ?? 0);
}

const SetupSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(120),
    email: z.string().trim().email("Enter a valid email").max(255),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

async function createOwner(formData: FormData) {
  "use server";

  // Guard: setup can only ever create the FIRST account.
  if ((await userCount()) > 0) redirect("/admin/login");

  const parsed = SetupSchema.safeParse({
    name: String(formData.get("name") || ""),
    email: String(formData.get("email") || ""),
    password: String(formData.get("password") || ""),
    confirm: String(formData.get("confirm") || ""),
  });

  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || "Invalid details";
    redirect(`/admin/setup?error=${encodeURIComponent(msg)}`);
  }

  const { name, email, password } = parsed.data;
  const normEmail = email.toLowerCase();

  const passwordHash = await bcrypt.hash(password, 10);
  const avatarInitials = name
    .split(/[\s.]+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  try {
    await db.insert(users).values({
      email: normEmail,
      name,
      passwordHash,
      role: "owner",
      avatarInitials,
    });
  } catch {
    // Most likely a race that created the first user, or a unique-email clash.
    redirect("/admin/login");
  }

  redirect("/admin/setup?done=1");
}

type Search = Promise<{ error?: string; done?: string }>;

export default async function AdminSetup({
  searchParams,
}: {
  searchParams: Search;
}) {
  // Once any user exists, setup must never run again.
  if ((await userCount()) > 0) redirect("/admin/login");

  const { error, done } = await searchParams;
  const complete = done === "1";

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
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            letterSpacing: "0.18em",
            opacity: 0.6,
          }}
        >
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
            First light in
            <br />
            <span style={{ fontStyle: "italic", color: TOKENS.cream }}>
              the studio.
            </span>
          </h1>
          <p
            style={{
              marginTop: 28,
              fontSize: 16,
              lineHeight: 1.6,
              color: "#c8c2b0",
              maxWidth: "44ch",
            }}
          >
            Nobody has an account yet. Create the owner account to open the
            backstage — you can connect Microsoft afterwards.
          </p>
        </div>
        <div style={{ fontSize: 12.5, opacity: 0.5 }}>
          © 1999–{new Date().getFullYear()} Profile Landscapes
        </div>
      </div>

      {/* right — form / success */}
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
          {complete ? (
            <>
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
                You&apos;re set.
              </h2>
              <p style={{ marginTop: 8, color: TOKENS.ink2, fontSize: 15, lineHeight: 1.6 }}>
                The owner account is ready. Sign in with the email and password
                you just chose — or link your Microsoft work account from the
                sign-in page.
              </p>
              <Link
                href="/admin/login"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  marginTop: 28,
                  padding: "13px 20px",
                  background: TOKENS.ink,
                  color: "#fff",
                  border: "none",
                  borderRadius: 999,
                  fontSize: 14.5,
                  fontWeight: 500,
                  fontFamily: "inherit",
                  textDecoration: "none",
                  boxSizing: "border-box",
                }}
              >
                Go to sign in →
              </Link>
            </>
          ) : (
            <>
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
                Create the owner.
              </h2>
              <p style={{ marginTop: 8, color: TOKENS.ink2, fontSize: 15 }}>
                This is the first account, with full owner rights.
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
                  {error}
                </div>
              )}

              <form action={createOwner} style={{ marginTop: 24 }}>
                <Field label="Name" name="name" type="text" autoComplete="name" />
                <Field label="Email" name="email" type="email" autoComplete="email" />
                <Field
                  label="Password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  hint="At least 8 characters."
                />
                <Field
                  label="Confirm password"
                  name="confirm"
                  type="password"
                  autoComplete="new-password"
                />

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
                  Create owner account →
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  type,
  autoComplete,
  hint,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete?: string;
  hint?: string;
}) {
  return (
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
        {label}
      </label>
      <input
        name={name}
        type={type}
        required
        autoComplete={autoComplete}
        style={{
          width: "100%",
          padding: "12px 14px",
          fontSize: 15,
          border: `1px solid ${TOKENS.line}`,
          borderRadius: 4,
          background: "#fff",
          color: TOKENS.ink,
          fontFamily: "inherit",
          boxSizing: "border-box",
        }}
      />
      {hint && (
        <p style={{ margin: "6px 0 0", fontSize: 12, color: TOKENS.ink2 }}>{hint}</p>
      )}
    </div>
  );
}
