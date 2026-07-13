import type { ReactNode } from "react";

/** Normalise une URL cible pour backlink (ajoute https si besoin). */
export function normalizeBacklinkUrl(raw?: string | null) {
  const value = raw?.trim();
  if (!value) return null;
  try {
    const withProtocol = /^https?:\/\//i.test(value)
      ? value
      : `https://${value}`;
    const url = new URL(withProtocol);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** Extrait la meilleure URL externe du contenu (fallback backlink). */
export function extractUrlFromContent(content: string) {
  const matches = content.match(/https?:\/\/[^\s<>"')\]]+/gi) ?? [];
  const normalized = matches
    .map((match) => normalizeBacklinkUrl(match.replace(/[.,;:!?)]+$/, "")))
    .filter((url): url is string => Boolean(url));

  if (!normalized.length) return null;

  // Préfère l'URL la plus spécifique (chemin plus long) pour le backlink.
  return [...normalized].sort((a, b) => {
    try {
      return new URL(b).pathname.length - new URL(a).pathname.length;
    } catch {
      return b.length - a.length;
    }
  })[0];
}

export function resolveArticleBacklinkUrl(input: {
  targetUrl?: string | null;
  content: string;
}) {
  return (
    normalizeBacklinkUrl(input.targetUrl) ||
    extractUrlFromContent(input.content)
  );
}

/** Retire les URLs brutes en fin de contenu (elles deviennent des ancres). */
export function stripTrailingBareUrls(content: string) {
  return content
    .replace(/(?:\s*https?:\/\/[^\s]+)+\s*$/i, "")
    .trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type Segment =
  | { type: "text"; value: string }
  | { type: "link"; value: string; href: string };

/**
 * Lie les mots-clés SEO vers l'URL cible (méthode backlink / netlinking).
 * Priorité aux mots-clés les plus longs ; 1 lien max par mot-clé.
 */
export function linkKeywordsInText(
  text: string,
  keywords: string[],
  href: string,
  maxLinksPerKeyword = 1,
): Segment[] {
  const sorted = [...new Set(keywords.map((k) => k.trim()).filter(Boolean))].sort(
    (a, b) => b.length - a.length,
  );
  if (!sorted.length || !href) {
    return [{ type: "text", value: text }];
  }

  const used = new Map<string, number>();
  const pattern = new RegExp(
    `\\b(${sorted.map(escapeRegExp).join("|")})\\b`,
    "gi",
  );

  const segments: Segment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(pattern)) {
    const value = match[0];
    const index = match.index ?? 0;
    const key = value.toLowerCase();
    const count = used.get(key) ?? 0;

    if (index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, index) });
    }

    if (count < maxLinksPerKeyword) {
      segments.push({ type: "link", value, href });
      used.set(key, count + 1);
    } else {
      segments.push({ type: "text", value });
    }

    lastIndex = index + value.length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return segments.length ? segments : [{ type: "text", value: text }];
}

function renderSegments(segments: Segment[], className?: string): ReactNode {
  return segments.map((segment, index) => {
    if (segment.type === "text") {
      return <span key={`t-${index}`}>{segment.value}</span>;
    }
    return (
      <a
        key={`l-${index}`}
        href={segment.href}
        target="_blank"
        rel="noopener noreferrer"
        className={
          className ??
          "font-medium text-[var(--brand-navy)] underline decoration-[var(--brand-navy)]/25 underline-offset-[3px] hover:decoration-[var(--brand-navy)]"
        }
      >
        {segment.value}
      </a>
    );
  });
}

/** Contenu d'article avec ancres SEO sur les mots-clés. */
export function ArticleBacklinkContent({
  content,
  keywords,
  targetUrl,
}: {
  content: string;
  keywords: string[];
  targetUrl?: string | null;
}) {
  const href = resolveArticleBacklinkUrl({ targetUrl, content });
  const cleaned = stripTrailingBareUrls(content);
  const paragraphs = cleaned
    .split(/\n{2,}|\r\n{2,}/)
    .flatMap((block) => block.split(/\n+/))
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="space-y-4 text-base leading-relaxed text-foreground">
      {paragraphs.map((paragraph, index) => {
        const isHeading =
          paragraph.length < 90 &&
          !paragraph.endsWith(".") &&
          /^[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ0-9]/.test(paragraph) &&
          !paragraph.includes("?");

        if (isHeading && index > 0) {
          return (
            <h2
              key={`h-${index}`}
              className="pt-2 text-2xl font-semibold tracking-tight text-[var(--brand-navy)]"
            >
              {paragraph}
            </h2>
          );
        }

        // Ignore bare URLs in the body (avoid spammy naked links)
        if (/^https?:\/\//i.test(paragraph)) {
          return null;
        }

        return (
          <p key={`p-${index}`} className="whitespace-pre-wrap">
            {href
              ? renderSegments(linkKeywordsInText(paragraph, keywords, href))
              : paragraph}
          </p>
        );
      })}

      {href ? (
        <p className="pt-4">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full bg-[var(--brand-navy)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[color-mix(in_srgb,var(--brand-navy)_88%,black)]"
          >
            Plus d&apos;info
          </a>
        </p>
      ) : null}
    </div>
  );
}
