import type { Metadata } from "next";

import { AnnoncesList } from "@/components/articles/annonces-list";
import { ARTICLES } from "@/lib/data/articles";
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
          Contenus de référencement (pas des annonces). Après validation admin,
          chaque article a une page publique et est indexé automatiquement.
        </p>
      </div>
      <AnnoncesList articles={ARTICLES} />
    </div>
  );
}
