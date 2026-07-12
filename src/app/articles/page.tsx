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
  title: "Articles SEO & backlinks",
  description:
    "Articles de référencement SEO et backlinks publiés sur Manchoufouch — une URL unique par contenu.",
  path: "/articles",
  keywords: [
    "articles SEO Maroc",
    "backlinks Maroc",
    "référencement Google",
    "contenu SEO",
  ],
});

export default async function ArticlesIndexPage() {
  const articles = await listLivePublishedArticles();

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">
        Articles SEO & backlinks
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Contenus de référencement (pas des annonces). Chaque article validé a
        sa page publique, puis est soumis à l&apos;indexation Google / Bing.
      </p>

      <div className="mt-10 space-y-4">
        {articles.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun article SEO publié pour le moment.
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
                <Badge>SEO Backlink</Badge>
                <Badge variant="outline">/{article.slug}</Badge>
              </div>
              <h2 className="mt-3 text-xl font-semibold tracking-tight">
                <Link
                  href={`/articles/${article.slug}`}
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
                  href={`/articles/${article.slug}`}
                  className={cn(buttonVariants({ size: "sm" }))}
                >
                  Lire l&apos;article
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
