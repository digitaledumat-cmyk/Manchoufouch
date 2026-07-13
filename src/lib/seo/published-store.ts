import { BlobPreconditionFailedError, get, put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";

import { ARTICLES, type Article } from "@/lib/data/articles";
import type { DomainId } from "@/lib/data/domains";
import { slugify } from "@/lib/seo/slugify";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "published-articles.json");
const TMP_PATH = path.join("/tmp", "manchoufouch-published-articles.json");
const BLOB_PATH = "manchoufouch/published-articles.json";

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

function hasBlobStore() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN?.trim() ||
      process.env.BLOB_STORE_ID?.trim(),
  );
}

async function streamToText(stream: ReadableStream<Uint8Array> | null) {
  if (!stream) return "";
  return new Response(stream).text();
}

async function readFromBlob(): Promise<Article[] | null> {
  if (!hasBlobStore()) return null;
  try {
    const result = await get(BLOB_PATH, {
      access: "private",
      useCache: false,
    });
    if (!result?.stream) return null;
    const raw = await streamToText(result.stream);
    if (!raw.trim()) return null;
    const parsed = JSON.parse(raw) as Article[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "BlobNotFoundError" ||
        error.message.toLowerCase().includes("not found"))
    ) {
      return null;
    }
    throw error;
  }
}

async function writeToBlob(articles: Article[]) {
  if (!hasBlobStore()) return false;
  try {
    await put(BLOB_PATH, JSON.stringify(articles, null, 2), {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return true;
  } catch (error) {
    if (error instanceof BlobPreconditionFailedError) {
      await put(BLOB_PATH, JSON.stringify(articles, null, 2), {
        access: "private",
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      return true;
    }
    throw error;
  }
}

async function readFromDisk(): Promise<Article[]> {
  for (const filePath of [STORE_PATH, TMP_PATH]) {
    try {
      const raw = await fs.readFile(filePath, "utf8");
      const parsed = JSON.parse(raw) as Article[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // try next
    }
  }
  return [];
}

async function writeToDisk(articles: Article[]) {
  const payload = JSON.stringify(articles, null, 2);
  await fs.mkdir(DATA_DIR, { recursive: true }).catch(() => undefined);
  await fs.mkdir(path.dirname(TMP_PATH), { recursive: true }).catch(() => undefined);
  let wrote = false;
  for (const filePath of [STORE_PATH, TMP_PATH]) {
    try {
      await fs.writeFile(filePath, payload, "utf8");
      wrote = true;
    } catch {
      // try next
    }
  }
  return wrote;
}

export async function readPublishedArticles(): Promise<Article[]> {
  let articles: Article[] = [];
  if (hasBlobStore()) {
    const fromBlob = await readFromBlob();
    if (fromBlob) articles = fromBlob;
    else {
      const fromDisk = await readFromDisk();
      if (fromDisk.length) {
        await writeToBlob(fromDisk).catch(() => undefined);
        articles = fromDisk;
      } else {
        await writeToBlob([]).catch(() => undefined);
        articles = [];
      }
    }
  } else {
    articles = await readFromDisk();
  }

  // Backfill targetUrl depuis le contenu si manquant (anciens articles).
  let changed = false;
  const { extractUrlFromContent } = await import("@/lib/seo/article-backlinks");
  const next = articles.map((article) => {
    if (article.targetUrl?.trim()) return article;
    const found = extractUrlFromContent(article.content);
    if (!found) return article;
    changed = true;
    return { ...article, targetUrl: found };
  });

  if (changed) {
    await writePublishedArticles(next).catch(() => undefined);
    return next;
  }

  return articles;
}

async function writePublishedArticles(articles: Article[]) {
  if (hasBlobStore()) {
    await writeToBlob(articles);
    await writeToDisk(articles).catch(() => undefined);
    return;
  }
  const ok = await writeToDisk(articles);
  if (!ok) {
    throw new Error("Impossible d'enregistrer l'article publié.");
  }
}

/** Slugs déjà pris (démos + articles clients). */
export function collectReservedSlugs(
  existing: Article[],
  excludeId?: string,
): Set<string> {
  const reserved = new Set<string>();
  for (const article of ARTICLES) {
    if (article.id !== excludeId) reserved.add(article.slug);
  }
  for (const article of existing) {
    if (article.id !== excludeId) reserved.add(article.slug);
  }
  return reserved;
}

export function uniqueSlug(
  title: string,
  existing: Article[],
  excludeId?: string,
): string {
  const base = slugify(title);
  const reserved = collectReservedSlugs(existing, excludeId);
  let slug = base;
  let i = 2;
  while (reserved.has(slug)) {
    const suffix = `-${i}`;
    slug = `${base.slice(0, Math.max(1, 80 - suffix.length))}${suffix}`;
    i += 1;
    if (i > 500) {
      slug = `${base.slice(0, 60)}-${Date.now().toString(36)}`;
      break;
    }
  }
  return slug;
}

export function publicPathForSlug(slug: string) {
  return `/articles/${slug}`;
}

/** Enregistre (ou met à jour) un article validé — 1 article = 1 URL unique. */
export async function upsertPublishedArticle(
  input: PublishedArticleInput,
): Promise<Article> {
  const articles = await readPublishedArticles();
  const now = new Date().toISOString();
  const existingIndex = articles.findIndex((item) => item.id === input.id);

  // Même article (même id) : on conserve le slug pour ne pas casser le lien.
  // Nouvel article : slug depuis le titre, jamais deux posts sur la même URL.
  const slug =
    existingIndex >= 0
      ? articles[existingIndex].slug
      : uniqueSlug(input.title, articles);

  if (
    existingIndex < 0 &&
    collectReservedSlugs(articles).has(slug)
  ) {
    throw new Error(
      `Le lien /articles/${slug} est déjà utilisé. Changez le titre.`,
    );
  }

  const previous = existingIndex >= 0 ? articles[existingIndex] : null;
  const targetUrl =
    input.targetUrl?.trim() ||
    previous?.targetUrl ||
    "";

  const article: Article = {
    id: input.id,
    slug,
    title: input.title,
    domain: (input.domain as DomainId) || "produits-digitaux",
    type: "article",
    status: "published",
    excerpt: input.metaDescription || input.content.slice(0, 160),
    metaDescription: (input.metaDescription || input.content).slice(0, 160),
    keywords: input.keywords.length
      ? input.keywords
      : ["SEO Maroc", "backlinks", "référencement Google"],
    headings: {
      h1: input.h1 || input.title,
      h2: previous?.headings.h2 ?? [],
      h3: previous?.headings.h3 ?? [],
    },
    content: input.content,
    author: input.author,
    publishedAt: previous?.publishedAt ?? now,
    updatedAt: now,
    targetUrl: targetUrl || undefined,
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

export async function listLivePublishedArticles(): Promise<Article[]> {
  const articles = await readPublishedArticles();
  return articles
    .filter((article) => article.status === "published")
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
}
