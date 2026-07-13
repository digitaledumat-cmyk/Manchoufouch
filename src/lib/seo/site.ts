const PRODUCTION_SITE_URL = "https://manchoufouch.ma";

function isLocalhostUrl(url: string) {
  return /localhost|127\.0\.0\.1/i.test(url);
}

/** URL canonique du site (jamais localhost en production). */
function resolveSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ?? "";
  const vercelEnv = process.env.VERCEL_ENV; // production | preview | development

  // Production : domaine officiel (ignore localhost s'il a fuité dans les env)
  if (
    vercelEnv === "production" ||
    (process.env.NODE_ENV === "production" && !process.env.VERCEL)
  ) {
    if (fromEnv && !isLocalhostUrl(fromEnv)) return fromEnv;
    return PRODUCTION_SITE_URL;
  }

  // Preview Vercel
  if (vercelEnv === "preview" && process.env.VERCEL_URL) {
    if (fromEnv && !isLocalhostUrl(fromEnv)) return fromEnv;
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }

  // Local / fallback
  if (fromEnv) return fromEnv;
  return "http://localhost:3000";
}

export const SITE_CONFIG = {
  name: "Manchoufouch",
  tagline: "Agence SEO Maroc",
  /** Title SEO homepage (sans suffixe marque) — total avec marque ≈ 40–60 car. */
  seoTitle: "Agence SEO Maroc & backlinks",
  description:
    "Référencement Google, backlinks et Ads au Maroc. Manchoufouch booste votre visibilité à Casablanca, Rabat, Marrakech et partout dans le Royaume.",
  url: resolveSiteUrl(),
  locale: "fr_MA",
  twitter: "@manchoufouch",
  phone: "+212 661 876 103",
  email: "manchoufouch@contact.ma",
  /** Numéro WhatsApp sans espaces ni + (format international). */
  whatsapp: "212661876103",
  /** Logo carré pour Google Search / Knowledge Graph (≥112×112). */
  logoPath: "/logo-schema.png",
  /** Favicon Google Search (multiple de 48×48). */
  faviconPath: "/favicon-48x48.png",
} as const;

export function getWhatsAppUrl(message?: string) {
  const base = `https://wa.me/${SITE_CONFIG.whatsapp}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
