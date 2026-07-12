export const SITE_CONFIG = {
  name: "Manchoufouch",
  tagline: "Agence SEO Maroc",
  /** Title SEO homepage (sans suffixe marque) — total avec marque ≈ 40–60 car. */
  seoTitle: "Agence SEO Maroc & backlinks",
  description:
    "Référencement Google, backlinks et Ads au Maroc. Manchoufouch booste votre visibilité à Casablanca, Rabat, Marrakech et partout dans le Royaume.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "fr_MA",
  twitter: "@manchoufouch",
  phone: "+212 661 876 103",
  email: "manchoufouch@contact.ma",
  /** Numéro WhatsApp sans espaces ni + (format international). */
  whatsapp: "212661876103",
} as const;

export function getWhatsAppUrl(message?: string) {
  const base = `https://wa.me/${SITE_CONFIG.whatsapp}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
