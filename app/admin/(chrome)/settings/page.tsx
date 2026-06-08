import { db, siteSettings, users } from "@/lib/db";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { SettingsEditor } from "@/components/admin/SettingsEditor";
import { saveSettings, changePassword } from "./actions";

export default async function SettingsPage() {
  const session = await auth();

  const rows = await db.select().from(siteSettings);
  const map: Record<string, unknown> = {};
  for (const r of rows) map[r.key] = r.value;

  const teamRows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      lastLoginAt: users.lastLoginAt,
    })
    .from(users);

  const settings = {
    studio_name: (map.studio_name as string) || "",
    tagline: (map.tagline as string) || "",
    phone: (map.phone as string) || "",
    mobile: (map.mobile as string) || "",
    email: (map.email as string) || "",
    address: (map.address as string) || "",
    legal: (map.legal as {
      acn: string;
      abn: string;
      licence: string;
      founded: number;
    }) || { acn: "", abn: "", licence: "", founded: new Date().getFullYear() },
    theme_tokens: (map.theme_tokens as Record<string, string>) || {
      ink: "#133024",
      paper: "#ffffff",
      bone: "#f4efe4",
      accent: "#1f5a3d",
      cream: "#e8dcb6",
    },
  };

  return (
    <main className="main-content">
      <div className="page-head-a">
        <div>
          <h1>
            Studio <span className="it">settings.</span>
          </h1>
          <div className="sub">
            Brand-level config that shows up everywhere on the public site —
            phone, email, footer, colour palette.
          </div>
        </div>
      </div>

      <SettingsEditor
        initial={settings}
        save={saveSettings}
        team={teamRows.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
        }))}
        currentUserEmail={session?.user?.email || ""}
        changePassword={changePassword}
      />
    </main>
  );
}
