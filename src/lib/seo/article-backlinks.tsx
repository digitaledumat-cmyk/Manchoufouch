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
    // Canonicalise la homepage avec trailing slash
    if (url.pathname === "" || url.pathname === "/") {
      return `${url.origin}/`;
    }
    return url.toString().replace(/\/$/, "") === `${url.origin}`
      ? `${url.origin}/`
      : url.toString();
  } catch {
    return null;
  }
}

/** Toutes les URLs externes trouvées dans le contenu. */
export function extractAllUrlsFromContent(content: string) {
  const matches = content.match(/https?:\/\/[^\s<>"')\]]+/gi) ?? [];
  const normalized = matches
    .map((match) => normalizeBacklinkUrl(match.replace(/[.,;:!?)]+$/, "")))
    .filter((url): url is string => Boolean(url));

  return [...new Set(normalized)];
}

/** Extrait l'URL principale (préfère la homepage du site). */
export function extractUrlFromContent(content: string) {
  const urls = extractAllUrlsFromContent(content);
  if (!urls.length) return null;

  // Préfère la homepage (chemin le plus court), ex. https://ondima.ma/
  return [...urls].sort((a, b) => {
    try {
      return new URL(a).pathname.length - new URL(b).pathname.length;
    } catch {
      return a.length - b.length;
    }
  })[0];
}

export function resolveArticleBacklinkUrl(input: {
  targetUrl?: string | null;
  content: string;
}) {
  // Préfère la homepage présente dans le contenu (ex. https://ondima.ma/)
  // puis le targetUrl enregistré.
  return (
    extractUrlFromContent(input.content) ||
    normalizeBacklinkUrl(input.targetUrl)
  );
}

/** Retire les URLs brutes en fin de contenu (elles deviennent des ancres). */
export function stripTrailingBareUrls(content: string) {
  return content
    .replace(/(?:\s*https?:\/\/[^\s]+)+\s*$/i, "")
    .trim();
}

/**
 * Bloc optionnel en tête d'article :
 * @@linkmap
 * iptv maroc|https://ondima.ma/iptv-maroc
 * abonnement iptv maroc|https://ondima.ma/abonnement-iptv-maroc
 * @@
 */
export function extractLinkMap(content: string): {
  content: string;
  linkMap: Map<string, string>;
} {
  const linkMap = new Map<string, string>();
  const match = content.match(/@@linkmap\s*([\s\S]*?)@@\s*/i);
  if (!match) return { content, linkMap };

  for (const line of match[1].split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const sep = trimmed.includes("|") ? "|" : "=";
    const idx = trimmed.indexOf(sep);
    if (idx <= 0) continue;
    const keyword = trimmed.slice(0, idx).trim().toLowerCase();
    const href = normalizeBacklinkUrl(trimmed.slice(idx + 1).trim());
    if (keyword && href) linkMap.set(keyword, href);
  }

  return {
    content: content.replace(match[0], "").trim(),
    linkMap,
  };
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hostLabel(href: string) {
  try {
    return new URL(href).host.replace(/^www\./, "");
  } catch {
    return href.replace(/^https?:\/\//, "");
  }
}

type Segment =
  | { type: "text"; value: string }
  | { type: "link"; value: string; href: string };

/** Parse les liens markdown [ancre](https://…). */
export function parseMarkdownLinks(text: string): Segment[] {
  const pattern = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/gi;
  const segments: Segment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, index) });
    }
    const href = normalizeBacklinkUrl(match[2]) || match[2];
    segments.push({ type: "link", value: match[1], href });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return segments.length ? segments : [{ type: "text", value: text }];
}

/**
 * Lie les mots-clés SEO vers une URL (ou une map mot-clé → URL).
 * Priorité aux mots-clés les plus longs ; 1 lien max par mot-clé.
 */
export function linkKeywordsInText(
  text: string,
  keywords: string[],
  href: string,
  maxLinksPerKeyword = 1,
  linkMap?: Map<string, string>,
): Segment[] {
  const sorted = [...new Set(keywords.map((k) => k.trim()).filter(Boolean))].sort(
    (a, b) => b.length - a.length,
  );
  if (!sorted.length || (!href && !linkMap?.size)) {
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
    const target = linkMap?.get(key) || href;

    if (index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, index) });
    }

    if (target && count < maxLinksPerKeyword) {
      segments.push({ type: "link", value, href: target });
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

/** Applique markdown puis auto-liens mots-clés sur les segments texte restants. */
export function linkParagraph(
  text: string,
  keywords: string[],
  href: string | null,
  linkMap: Map<string, string>,
): Segment[] {
  const withMarkdown = parseMarkdownLinks(text);
  const out: Segment[] = [];

  for (const segment of withMarkdown) {
    if (segment.type === "link") {
      out.push(segment);
      continue;
    }
    if (!href && !linkMap.size) {
      out.push(segment);
      continue;
    }
    out.push(
      ...linkKeywordsInText(
        segment.value,
        keywords,
        href || [...linkMap.values()][0] || "",
        1,
        linkMap,
      ),
    );
  }

  return out;
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

const linkClass =
  "font-medium text-[var(--brand-navy)] underline decoration-[var(--brand-navy)]/25 underline-offset-[3px] hover:decoration-[var(--brand-navy)]";

/** Contenu d'article avec ancres SEO naturelles dans le texte. */
export function ArticleBacklinkContent({
  content,
  keywords,
  targetUrl,
}: {
  content: string;
  keywords: string[];
  targetUrl?: string | null;
}) {
  const { content: withoutMap, linkMap } = extractLinkMap(content);
  const cleaned = stripTrailingBareUrls(withoutMap);
  const allUrls = extractAllUrlsFromContent(cleaned);
  const homepage =
    extractUrlFromContent(cleaned) ||
    normalizeBacklinkUrl(targetUrl) ||
    allUrls[0] ||
    null;

  // Mots-clés + marque éventuelle (ex. Ondima) liés vers la homepage
  const brandFromHost = homepage
    ? hostLabel(homepage).split(".")[0]
    : null;
  const linkKeywords = [
    ...keywords,
    ...linkMap.keys(),
    ...(brandFromHost && brandFromHost.length > 2
      ? [brandFromHost, brandFromHost[0].toUpperCase() + brandFromHost.slice(1)]
      : []),
  ];

  const paragraphs = cleaned
    .split(/\n{2,}|\r\n{2,}/)
    .flatMap((block) => block.split(/\n+/))
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="space-y-4 text-base leading-relaxed text-foreground">
      {paragraphs.map((paragraph, index) => {
        const headingText = paragraph.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
        const isHeading =
          headingText.length < 90 &&
          !headingText.endsWith(".") &&
          /^[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ0-9]/.test(headingText) &&
          !headingText.includes("?");

        if (isHeading && index > 0) {
          return (
            <h2
              key={`h-${index}`}
              className="pt-2 text-2xl font-semibold tracking-tight text-[var(--brand-navy)]"
            >
              {renderSegments(parseMarkdownLinks(paragraph), linkClass)}
            </h2>
          );
        }

        if (/^https?:\/\//i.test(paragraph)) {
          return null;
        }

        return (
          <p key={`p-${index}`} className="whitespace-pre-wrap">
            {renderSegments(
              linkParagraph(paragraph, linkKeywords, homepage, linkMap),
            )}
          </p>
        );
      })}

      {homepage ? (
        <p>
          Pour en savoir plus, consultez le site officiel{" "}
          <a
            href={homepage}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            {hostLabel(homepage)}
          </a>{" "}
          (
          <a
            href={homepage}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            {homepage}
          </a>
          ).
        </p>
      ) : null}
    </div>
  );
}
