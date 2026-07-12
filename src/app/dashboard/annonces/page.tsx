import type { Metadata } from "next";

import { AnnoncesList } from "@/components/articles/annonces-list";
import { ARTICLES } from "@/lib/data/articles";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Annonces & articles",
  description:
    "Liste des annonces et articles déjà créés, filtrable par domaine SEO.",
  path: "/dashboard/annonces",
  noIndex: true,
});

export default function AnnoncesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Annonces & articles
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Inventaire de vos contenus SEO, filtrable par domaine.
        </p>
      </div>
      <AnnoncesList articles={ARTICLES} />
    </div>
  );
}
