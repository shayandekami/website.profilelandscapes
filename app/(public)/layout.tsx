import { theme } from "@/themes/active";
import { getSiteSettings } from "@/lib/content";
import { auth } from "@/lib/auth";
import { AdminBar } from "@/components/admin/AdminBar";
import { QuoteBar } from "@/components/commerce/QuoteBar";
import { ScheduleBar } from "@/components/commerce/ScheduleBar";
import { TradePricingBanner } from "@/components/commerce/TradePricingBanner";

// CMS-backed: render per request, not at build time
export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { Header, Footer } = theme.chrome;
  const [settings, session] = await Promise.all([getSiteSettings(), auth()]);

  // Build CSS-variable overrides from theme tokens
  const tokenStyle = theme.tokens
    ? Object.entries(theme.tokens)
        .map(([k, v]) => `${k}:${v}`)
        .join(";")
    : "";

  return (
    <>
      {/* Theme stylesheets */}
      <link rel="stylesheet" href={theme.stylesheet} />
      <link
        rel="stylesheet"
        href={theme.stylesheet.replace("site.css", "site-ext.css")}
      />
      {tokenStyle && (
        <style dangerouslySetInnerHTML={{ __html: `:root{${tokenStyle}}` }} />
      )}

      <TradePricingBanner />
      <Header studioName={settings.studio_name} nav={theme.nav} />
      <main>{children}</main>
      <Footer
        studioName={settings.studio_name}
        phone={settings.phone}
        email={settings.email}
        address={settings.address}
        nav={theme.nav}
        legal={settings.legal}
      />
      {session?.user && <AdminBar userName={session.user.name || session.user.email || "Admin"} />}
      <QuoteBar />
      <ScheduleBar />
    </>
  );
}
