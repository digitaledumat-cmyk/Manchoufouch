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
  ArticleBacklinkContent,
  resolveArticleBacklinkUrl,
} from "@/lib/seo/article-backlinks";
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

  const backlinkUrl = resolveArticleBacklinkUrl({
    targetUrl: article.targetUrl,
    content: article.content,
  });

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
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-[var(--brand-navy)] sm:text-4xl">
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
            Mots-clés SEO (backlinks)
          </h2>
          <div className="flex flex-wrap gap-2">
            {article.keywords.map((keyword) =>
              backlinkUrl ? (
                <a
                  key={keyword}
                  href={backlinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
                  <Badge
                    variant="secondary"
                    className="cursor-pointer border border-[var(--brand-coral)]/30 bg-[var(--brand-coral-soft)] text-[var(--brand-navy)] transition hover:border-[var(--brand-coral)]"
                  >
                    {keyword}
                  </Badge>
                </a>
              ) : (
                <Badge key={keyword} variant="secondary">
                  {keyword}
                </Badge>
              ),
            )}
          </div>
          {backlinkUrl ? (
            <p className="text-xs text-muted-foreground">
              Chaque mot-clé pointe vers{" "}
              <a
                href={backlinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[var(--brand-coral)] underline underline-offset-2"
              >
                {backlinkUrl.replace(/^https?:\/\//, "")}
              </a>
            </p>
          ) : null}
        </section>

        <Separator className="my-8" />

        <section className="prose prose-neutral max-w-none dark:prose-invert">
          <ArticleBacklinkContent
            content={article.content}
            keywords={article.keywords}
            targetUrl={article.targetUrl || backlinkUrl}
          />

          {article.headings.h2.length > 0
            ? article.headings.h2.map((h2) => (
                <div key={h2} className="mt-8">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {backlinkUrl ? (
                      <a
                        href={backlinkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--brand-navy)] hover:text-[var(--brand-coral)]"
                      >
                        {h2}
                      </a>
                    ) : (
                      h2
                    )}
                  </h2>
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
                  <li key={h3}>
                    {backlinkUrl ? (
                      <a
                        href={backlinkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[var(--brand-coral)]"
                      >
                        {h3}
                      </a>
                    ) : (
                      h3
                    )}
                  </li>
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
          {backlinkUrl ? (
            <a
              href={backlinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants())}
            >
              Site client (backlink)
            </a>
          ) : (
            <Link
              href={`/articles/${article.slug}`}
              className={cn(buttonVariants({ variant: "secondary" }))}
            >
              Lien permanent
            </Link>
          )}
        </div>
      </article>
    </>
  );
}
