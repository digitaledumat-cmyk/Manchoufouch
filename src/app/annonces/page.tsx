import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getDomainLabel } from "@/lib/data/domains";
import { listLivePublishedArticles } from "@/lib/seo/published-store";
import { buildMetadata } from "@/lib/seo/metadata";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Articles & annonces SEO",
  description:
    "Toutes les pages articles publiées sur Manchoufouch — une URL unique par contenu.",
  path: "/annonces",
});

export default async function AnnoncesIndexPage() {
  const articles = await listLivePublishedArticles();

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">
        Articles publiés
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Chaque article validé a sa propre page avec un lien basé sur le titre.
        Aucun doublon d&apos;URL.
      </p>

      <div className="mt-10 space-y-4">
        {articles.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun article client publié pour le moment.
          </p>
        ) : (
          articles.map((article) => (
            <article
              key={article.id}
              className="rounded-xl border bg-card p-5 shadow-none"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  {getDomainLabel(article.domain)}
                </Badge>
                <Badge variant="outline">/{article.slug}</Badge>
              </div>
              <h2 className="mt-3 text-xl font-semibold tracking-tight">
                <Link
                  href={`/annonces/${article.slug}`}
                  className="hover:underline"
                >
                  {article.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {article.metaDescription || article.excerpt}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  href={`/annonces/${article.slug}`}
                  className={cn(buttonVariants({ size: "sm" }))}
                >
                  Voir la page
                </Link>
                <span className="text-xs text-muted-foreground">
                  Publié le{" "}
                  {new Date(article.publishedAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  );
}
