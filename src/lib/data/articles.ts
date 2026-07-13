import type { DomainId } from "@/lib/data/domains";

export type ArticleStatus = "draft" | "published" | "scheduled";

export type Article = {
  id: string;
  slug: string;
  title: string;
  domain: DomainId;
  type: "article" | "annonce";
  status: ArticleStatus;
  excerpt: string;
  metaDescription: string;
  keywords: string[];
  headings: {
    h1: string;
    h2: string[];
    h3: string[];
  };
  content: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
};

/** Plus d'articles de démo : uniquement les articles clients publiés. */
export const ARTICLES: Article[] = [];

export function getArticleBySlug(slug: string) {
  return ARTICLES.find((article) => article.slug === slug);
}

export async function resolveArticleBySlug(slug: string) {
  const demo = getArticleBySlug(slug);
  if (demo) return demo;

  const { getPublishedArticleBySlug } = await import(
    "@/lib/seo/published-store"
  );
  return getPublishedArticleBySlug(slug);
}

export function getArticlesByDomain(domain?: string) {
  if (!domain || domain === "all") return ARTICLES;
  return ARTICLES.filter((article) => article.domain === domain);
}

export function getPublishedArticles() {
  return ARTICLES.filter((article) => article.status === "published");
}
