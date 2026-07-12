/**
 * Mots-clés à forte demande au Maroc —
 * SEO, backlinks, référencement Google, Google Ads.
 */
export const MOROCCO_SEO_KEYWORDS = {
  primary: [
    "référencement naturel Maroc",
    "agence SEO Maroc",
    "SEO Maroc",
    "référencement Google Maroc",
    "backlinks Maroc",
    "netlinking Maroc",
    "Google Ads Maroc",
    "publicité Google Maroc",
    "mots-clés SEO Maroc",
    "audit SEO Maroc",
  ],
  local: [
    "agence SEO Casablanca",
    "référencement Rabat",
    "SEO Marrakech",
    "agence Google Ads Casablanca",
    "référencement Tanger",
    "SEO Fès",
    "création site web SEO Maroc",
    "consultant SEO Maroc",
  ],
  transactional: [
    "acheter backlinks Maroc",
    "pack backlinks SEO",
    "devis référencement naturel",
    "tarif SEO Maroc",
    "campagne Google Ads Maroc",
    "amélioration positionnement Google",
    "boost référencement site web",
    "agence SEA Maroc",
  ],
  informational: [
    "comment faire du SEO au Maroc",
    "meilleurs mots-clés SEO 2026",
    "différence SEO et SEA",
    "stratégie netlinking Google",
    "Core Web Vitals SEO",
    "référencement local Google Business",
    "SXO expérience utilisateur",
    "contenu optimisé ChatGPT SEO",
  ],
  longTail: [
    "comment apparaître premier sur Google Maroc",
    "prix backlinks de qualité Maroc",
    "agence référencement naturel Casablanca pas cher",
    "optimisation site e-commerce SEO Maroc",
    "publicité Google Ads budget Maroc",
    "suivi positionnement mots-clés Google",
    "rédaction article SEO backlinks",
    "référencement site vitrine entreprise Maroc",
  ],
} as const;

export const MOROCCO_KEYWORD_CLUSTERS = [
  {
    title: "Référencement Google & SEO",
    description:
      "Les recherches les plus fréquentes pour le positionnement organique au Maroc.",
    keywords: [
      "référencement naturel Maroc",
      "SEO Maroc",
      "agence SEO Maroc",
      "référencement Google Maroc",
      "audit SEO Maroc",
      "consultant SEO Maroc",
      "agence SEO Casablanca",
      "positionnement Google Maroc",
    ],
  },
  {
    title: "Backlinks & netlinking",
    description:
      "Intention d'achat et de renforcement d'autorité de domaine.",
    keywords: [
      "backlinks Maroc",
      "netlinking Maroc",
      "acheter backlinks Maroc",
      "pack backlinks SEO",
      "backlinks de qualité",
      "stratégie netlinking Google",
      "liens entrants SEO",
      "autorité de domaine",
    ],
  },
  {
    title: "Google Ads & SEA",
    description:
      "Trafic payant immédiat pour les entreprises marocaines.",
    keywords: [
      "Google Ads Maroc",
      "publicité Google Maroc",
      "campagne Google Ads Maroc",
      "agence SEA Maroc",
      "agence Google Ads Casablanca",
      "publicité Google Ads budget Maroc",
      "remarketing Google Ads",
      "ROI Google Ads",
    ],
  },
  {
    title: "Mots-clés & contenu SEO",
    description:
      "Ce que recherchent ceux qui veulent générer ou optimiser leurs mots-clés.",
    keywords: [
      "mots-clés SEO Maroc",
      "meilleurs mots-clés SEO 2026",
      "recherche de mots-clés Google",
      "mots-clés longue traîne",
      "rédaction article SEO",
      "contenu optimisé SEO",
      "balises title meta description",
      "structure H1 H2 H3 SEO",
    ],
  },
] as const;

/** Liste plate unique pour metadata / JSON-LD. */
export function getAllMoroccoSeoKeywords(): string[] {
  const set = new Set<string>();
  for (const list of Object.values(MOROCCO_SEO_KEYWORDS)) {
    for (const keyword of list) set.add(keyword);
  }
  return [...set];
}

/** Enrichit un brief avec des mots-clés marché Maroc. */
export function enrichKeywordsWithMoroccoDemand(
  base: string[],
  domainLabel?: string,
): string[] {
  const extras: string[] = [
    ...MOROCCO_SEO_KEYWORDS.primary.slice(0, 4),
    MOROCCO_SEO_KEYWORDS.transactional[0],
    MOROCCO_SEO_KEYWORDS.local[0],
  ];

  if (domainLabel) {
    extras.push(
      `${domainLabel.toLowerCase()} Maroc`,
      `référencement ${domainLabel.toLowerCase()} Maroc`,
    );
  }

  return [...new Set([...base, ...extras])];
}
