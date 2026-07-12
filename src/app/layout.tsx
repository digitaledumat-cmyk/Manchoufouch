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
    title: "Agence SEO Maroc | Référencement Google, Backlinks & Trafics organic",
    description: SITE_CONFIG.description,
    path: "/",
    keywords: getAllMoroccoSeoKeywords().slice(0, 40),
  }),
  icons: {
    icon: "/logo-mark.svg",
    apple: "/logo.png",
  },
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
