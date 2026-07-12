import type { Metadata } from "next";

import { CreateArticleForm } from "@/components/articles/create-article-form";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Créer un article SEO",
  description:
    "Créez un article SEO avec mots-clés, Hn et méta-description. Nécessite un compte et des crédits.",
  path: "/dashboard/create-article",
  noIndex: true,
});

export default function CreateArticlePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Créer un article SEO
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Parcours : compte → crédits → SEO Backlink → validation admin →
          indexation Google automatique.
        </p>
      </div>
      <CreateArticleForm />
    </div>
  );
}
