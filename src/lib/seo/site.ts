export const SITE_CONFIG = {
  name: "Manchoufouch",
  tagline: "Agence SEO Maroc — référencement Google, backlinks & Trafics organic",
  description:
    "Manchoufouch : référencement naturel au Maroc, backlinks, mots-clés SEO, Google Ads et contenu optimisé pour apparaître en premier sur Google Casablanca, Rabat, Marrakech et partout au Maroc.",
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
