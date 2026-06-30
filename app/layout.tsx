import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
const siteName = "Profile Landscapes";
const defaultTitle = "Profile Landscapes — Commercial landscape contractors, Sydney since 1999";
const defaultDescription =
  "Sydney-based landscape contractor, nursery and design studio. Design, construction, maintenance, 4,800+ plants in stock, and a trade pricelist. Since 1999.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: defaultTitle, template: `%s — ${siteName}` },
  description: defaultDescription,
  applicationName: siteName,
  icons: { icon: "/favicon.svg" },
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
};

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
