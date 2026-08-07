import { theme } from "@/themes/active";
import { getSiteSettings } from "@/lib/content";
import { auth } from "@/lib/auth";
import { AdminBar } from "@/components/admin/AdminBar";
import { QuoteBar } from "@/components/commerce/QuoteBar";
import { ScheduleBar } from "@/components/commerce/ScheduleBar";
import { TradePricingBanner } from "@/components/commerce/TradePricingBanner";
import { JsonLd, organizationLd, websiteLd } from "@/components/JsonLd";
import { CookieNotice } from "@/components/CookieNotice";

// CMS-backed: render per request, not at build time
export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { Header, Footer } = theme.chrome;
  const [settings, session] = await Promise.all([getSiteSettings(), auth()]);
  const features = settings.commerce_features;
  const visibleNav = theme.nav
    .filter((group) => group.key !== "shop" || features.shop)
    .map((group) => ({
      ...group,
      children: group.children?.filter((item) => {
        if ((item.href === "/plants" || item.href === "/plants/pricelist") && !features.nursery) return false;
        if (item.href === "/encyclopedia" && !features.encyclopedia) return false;
        return true;
      }),
    }))
    .filter((group) => group.key !== "plants" || group.children?.length);

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
      <link rel="stylesheet" href="/themes/profile-landscapes/design-atelier.css" />
      {tokenStyle && (
        <style dangerouslySetInnerHTML={{ __html: `:root{${tokenStyle}}` }} />
      )}

      {/* Organisation + WebSite nodes on every page. The WebSite SearchAction is what
          lets Google offer a search box under the brand result; the shared @id ties
          every page back to one business entity — which matters here because an
          unrelated company owns the .com under the same name. */}
      <JsonLd data={organizationLd(settings)} />
      <JsonLd data={websiteLd(settings)} />
      {features.nursery && <TradePricingBanner />}
      <Header studioName={settings.studio_name} nav={visibleNav} />
      <main>{children}</main>
      <Footer
        studioName={settings.studio_name}
        phone={settings.phone}
        email={settings.email}
        address={settings.address}
        nav={visibleNav}
        legal={settings.legal}
      />
      {session?.user && <AdminBar userName={session.user.name || session.user.email || "Admin"} />}
      {features.nursery && <QuoteBar />}
      {(features.nursery || features.encyclopedia) && <ScheduleBar />}
      <CookieNotice />
    </>
  );
}
