import type { Metadata } from "next";

import { MyArticlesReadonly } from "@/components/articles/my-articles-readonly";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Articles SEO & backlinks",
  description:
    "Vos articles de référencement SEO / backlinks, filtrables par domaine.",
  path: "/dashboard/articles",
  noIndex: true,
});

export default function DashboardArticlesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Articles SEO & backlinks
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Contenus de référencement. Les liens publiés sont en lecture seule ;
          l&apos;admin valide et indexe.
        </p>
      </div>
      <MyArticlesReadonly />
    </div>
  );
}
