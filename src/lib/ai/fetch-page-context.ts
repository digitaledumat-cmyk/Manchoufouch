export type PageContext = {
  url: string;
  hostname: string;
  title: string;
  metaDescription: string;
  headings: string[];
  excerpt: string;
};

function normalizeUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("URL manquante.");
  return trimmed.startsWith("http://") || trimmed.startsWith("https://")
    ? trimmed
    : `https://${trimmed}`;
}

function decodeEntities(text: string) {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(html: string) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<[^>]+>/g, " "),
  );
}

function metaContent(html: string, names: string[]) {
  for (const name of names) {
    const re = new RegExp(
      `<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>|<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${name}["'][^>]*>`,
      "i",
    );
    const match = html.match(re);
    const value = match?.[1] || match?.[2];
    if (value) return decodeEntities(value);
  }
  return "";
}

function collectHeadings(html: string) {
  const headings: string[] = [];
  const re = /<h([1-3])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null && headings.length < 12) {
    const text = stripTags(match[2]);
    if (text && text.length > 2) headings.push(text.slice(0, 120));
  }
  return headings;
}

/** Récupère titre, méta, titres et extrait texte du site cible. */
export async function fetchPageContext(rawUrl: string): Promise<PageContext> {
  const url = normalizeUrl(rawUrl);
  let hostname = url;
  try {
    hostname = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    /* keep raw */
  }

  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; ManchoufouchBot/1.0; +https://manchoufouch.ma)",
      Accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Impossible d'analyser le site (${response.status}). Vérifiez l'URL.`,
    );
  }

  const html = (await response.text()).slice(0, 400_000);
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title =
    decodeEntities(titleMatch?.[1] ?? "") ||
    metaContent(html, ["og:title", "twitter:title"]) ||
    hostname;

  const metaDescription =
    metaContent(html, [
      "description",
      "og:description",
      "twitter:description",
    ]) || "";

  const headings = collectHeadings(html);
  const excerpt = stripTags(html).slice(0, 3500);

  return {
    url,
    hostname,
    title,
    metaDescription,
    headings,
    excerpt,
  };
}

export function formatPageContextForPrompt(page: PageContext) {
  return `URL: ${page.url}
Hostname: ${page.hostname}
Titre page: ${page.title}
Meta description: ${page.metaDescription || "(absente)"}
Titres H1-H3: ${page.headings.length ? page.headings.join(" | ") : "(aucun)"}
Extrait du contenu réel du site:
"""
${page.excerpt || "(extrait vide)"}
"""`;
}
