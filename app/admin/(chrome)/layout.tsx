import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopNav } from "@/components/admin/TopNav";
import { redirect } from "next/navigation";

/**
 * Wraps all authenticated admin pages with the sidebar + topnav chrome.
 * Defense in depth — middleware already gates this, but we double-check
 * server-side so an admin page never renders unauthenticated.
 */
export default async function AdminChromeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="shell">
      <Sidebar
        currentUser={{
          name: session.user.name || "",
          email: session.user.email || "",
          role: session.user.role,
        }}
      />
      <div>
        <TopNav />
        {children}
      </div>
    </div>
  );
}
