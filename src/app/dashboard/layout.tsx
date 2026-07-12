import type { Metadata } from "next";

import { DashboardNav } from "@/components/layout/dashboard-nav";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Dashboard",
  description:
    "Espace de travail Manchoufouch : création de briefs SEO et gestion des annonces.",
  path: "/dashboard",
  noIndex: true,
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col md:min-h-[calc(100vh-3.5rem)] md:flex-row">
      <DashboardNav />
      <div className="flex-1 px-4 py-8">{children}</div>
    </div>
  );
}
