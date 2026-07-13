import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { JsonLd } from "@/components/seo/json-ld";
import { resolveArticleBySlug } from "@/lib/data/articles";
import { getDomainLabel } from "@/lib/data/domains";
import {
  articleJsonLd,
  breadcrumbJsonLd,
} from "@/lib/seo/json-ld";
import { buildArticleMetadata } from "@/lib/seo/metadata";
import { listLivePublishedArticles } from "@/lib/seo/published-store";
import { cn } from "@/lib/utils";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateStaticParams() {
  const articles = await listLivePublishedArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await resolveArticleBySlug(slug);

  if (!article) {
    return {
      title: "Article introuvable",
      robots: { index: false, follow: false },
    };
  }

  return buildArticleMetadata(article);
}

export default async function SeoArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await resolveArticleBySlug(slug);

  if (!article) notFound();

  return (
    <>
      <JsonLd
        data={[
          articleJsonLd(article),
          breadcrumbJsonLd([
            { name: "Accueil", path: "/" },
            { name: "Articles SEO", path: "/articles" },
            { name: article.title, path: `/articles/${article.slug}` },
          ]),
        ]}
      />

      <article className="mx-auto w-full max-w-3xl px-4 py-12">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{getDomainLabel(article.domain)}</Badge>
          <Badge>SEO Backlink</Badge>
          <Badge variant="outline">Article</Badge>
          <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
            /articles/{article.slug}
          </span>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {article.headings.h1}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {article.metaDescription}
        </p>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>Par {article.author}</span>
          <span>
            Publié le{" "}
            {new Date(article.publishedAt).toLocaleDateString("fr-FR")}
          </span>
          <span>
            Mis à jour le{" "}
            {new Date(article.updatedAt).toLocaleDateString("fr-FR")}
          </span>
        </div>

        <Separator className="my-8" />

        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Mots-clés SEO
          </h2>
          <div className="flex flex-wrap gap-2">
            {article.keywords.map((keyword) => (
              <Badge key={keyword} variant="secondary">
                {keyword}
              </Badge>
            ))}
          </div>
        </section>

        <Separator className="my-8" />

        <section className="prose prose-neutral max-w-none dark:prose-invert">
          <div className="whitespace-pre-wrap text-base leading-relaxed text-foreground">
            {article.content}
          </div>

          {article.headings.h2.length > 0
            ? article.headings.h2.map((h2) => (
                <div key={h2} className="mt-8">
                  <h2 className="text-2xl font-semibold tracking-tight">{h2}</h2>
                </div>
              ))
            : null}

          {article.headings.h3.length > 0 ? (
            <div className="mt-8">
              <h3 className="text-xl font-semibold tracking-tight">
                Sous-sections
              </h3>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
                {article.headings.h3.map((h3) => (
                  <li key={h3}>{h3}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/articles"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Tous les articles SEO
          </Link>
          <Link
            href={`/articles/${article.slug}`}
            className={cn(buttonVariants({ variant: "secondary" }))}
          >
            Lien permanent
          </Link>
        </div>
      </article>
    </>
  );
}
