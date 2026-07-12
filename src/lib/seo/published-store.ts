import { promises as fs } from "fs";
import path from "path";

import type { Article } from "@/lib/data/articles";
import type { DomainId } from "@/lib/data/domains";
import { slugify } from "@/lib/seo/slugify";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "published-articles.json");

export type PublishedArticleInput = {
  id: string;
  title: string;
  domain: string;
  metaDescription: string;
  keywords: string[];
  h1: string;
  content: string;
  author: string;
  targetUrl?: string;
};

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(STORE_PATH);
  } catch {
    await fs.writeFile(STORE_PATH, "[]", "utf8");
  }
}

export async function readPublishedArticles(): Promise<Article[]> {
  await ensureStore();
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as Article[];
  } catch {
    return [];
  }
}

async function writePublishedArticles(articles: Article[]) {
  await ensureStore();
  await fs.writeFile(STORE_PATH, JSON.stringify(articles, null, 2), "utf8");
}

function uniqueSlug(base: string, existing: Article[], excludeId?: string) {
  let slug = base;
  let i = 2;
  while (
    existing.some(
      (article) => article.slug === slug && article.id !== excludeId,
    )
  ) {
    slug = `${base}-${i}`;
    i += 1;
  }
  return slug;
}

/** Enregistre (ou met à jour) un article validé pour le crawl Google. */
export async function upsertPublishedArticle(
  input: PublishedArticleInput,
): Promise<Article> {
  const articles = await readPublishedArticles();
  const now = new Date().toISOString();
  const existingIndex = articles.findIndex((item) => item.id === input.id);
  const baseSlug = slugify(input.title);
  const slug = uniqueSlug(
    baseSlug,
    articles,
    existingIndex >= 0 ? input.id : undefined,
  );

  const article: Article = {
    id: input.id,
    slug,
    title: input.title,
    domain: (input.domain as DomainId) || "produits-digitaux",
    type: "article",
    status: "published",
    excerpt: input.metaDescription || input.content.slice(0, 160),
    metaDescription: input.metaDescription.slice(0, 160),
    keywords: input.keywords.length
      ? input.keywords
      : ["SEO Maroc", "référencement Google"],
    headings: {
      h1: input.h1 || input.title,
      h2: [],
      h3: [],
    },
    content: input.content,
    author: input.author,
    publishedAt:
      existingIndex >= 0 ? articles[existingIndex].publishedAt : now,
    updatedAt: now,
  };

  if (existingIndex >= 0) {
    articles[existingIndex] = article;
  } else {
    articles.unshift(article);
  }

  await writePublishedArticles(articles);
  return article;
}

export async function removePublishedArticle(id: string) {
  const articles = await readPublishedArticles();
  await writePublishedArticles(articles.filter((item) => item.id !== id));
}

export async function getPublishedArticleBySlug(slug: string) {
  const articles = await readPublishedArticles();
  return articles.find((article) => article.slug === slug) ?? null;
}
