import type { Metadata } from "next";
import "./globals.css";
import { getPublicSiteUrl } from "@/lib/content";

const siteName = "Profile Landscapes";
const defaultTitle = "Profile Landscapes — Commercial landscape contractors, Sydney since 1999";
const defaultDescription =
  "Sydney-based landscape contractor, nursery and design studio. Design, construction, maintenance, 4,800+ plants in stock, and a trade pricelist. Since 1999.";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = await getPublicSiteUrl();
  return {
  metadataBase: new URL(siteUrl),
  title: { default: defaultTitle, template: `%s — ${siteName}` },
  description: defaultDescription,
  applicationName: siteName,
  icons: {
    icon: [{ url: "/favicon-brand.png", type: "image/png", sizes: "512x512" }],
    shortcut: "/favicon-brand.png",
    apple: "/favicon-brand.png",
  },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName,
    title: defaultTitle,
    description: defaultDescription,
    locale: "en_AU",
    url: siteUrl,
  },
  twitter: { card: "summary_large_image", title: defaultTitle, description: defaultDescription },
  // Search-console ownership tokens. Set the env var in Render, redeploy, click
  // Verify — no code change needed. Google: Search Console → Add property →
  // HTML tag, copy ONLY the content="..." value. Bing: Webmaster Tools → Add site.
  // Both are public ownership proofs; safe to render in the page head.
  verification: {
    // Default is the live token for profilelandscapes.com.au (Search Console
    // property owned by shawn@profilelandscapes.com.au). Safe to commit — it is
    // a public ownership proof rendered into the page head, not a secret. Google
    // requires it to STAY in place; removing it un-verifies the property.
    // The env var still wins, so a different deployment can supply its own.
    google: process.env.GOOGLE_SITE_VERIFICATION || "kUa8hPIxjZreyvJKB6gPlBowfl6rOok66tj0Yuu5JBY",
    other: process.env.BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
      : undefined,
  },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400&family=Inter+Tight:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
