import type { Metadata } from "next";
import { Geist_Mono, Outfit } from "next/font/google";

import { AppShell } from "@/components/layout/app-shell";
import { SiteFooter } from "@/components/layout/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";
import { getAllMoroccoSeoKeywords } from "@/lib/data/morocco-seo-keywords";
import { buildMetadata } from "@/lib/seo/metadata";
import { SITE_CONFIG } from "@/lib/seo/site";

import "./globals.css";

const outfit = Outfit({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  ...buildMetadata({
    title: SITE_CONFIG.seoTitle,
    description: SITE_CONFIG.description,
    path: "/",
    keywords: getAllMoroccoSeoKeywords().slice(0, 40),
  }),
  icons: {
    icon: [
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/logo-mark.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon-48x48.png",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr-MA"
      className={`${outfit.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <AppShell>{children}</AppShell>
        <SiteFooter />
      </body>
    </html>
  );
}
