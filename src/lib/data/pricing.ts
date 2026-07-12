export type CreditPack = {
  id: "pack-5" | "pack-10" | "pack-20";
  name: string;
  articles: number;
  priceMad: number;
  priceLabel: string;
  perArticleLabel: string;
  description: string;
  highlighted?: boolean;
  features: string[];
};

/** Packs de crédits pour publier des articles SEO sur le site (MAD). */
export const CREDIT_PACKS: CreditPack[] = [
  {
    id: "pack-5",
    name: "Pack 5 articles",
    articles: 5,
    priceMad: 500,
    priceLabel: "500 DHS",
    perArticleLabel: "100 DHS / article",
    description:
      "Idéal pour démarrer : publiez 5 articles SEO optimisés (mots-clés, Hn, méta, backlinks).",
    features: [
      "5 crédits article",
      "Brief SEO + structure Hn",
      "Suggestions de backlinks",
      "Méta-description optimisée",
      "Publication sur le site",
    ],
  },
  {
    id: "pack-10",
    name: "Pack 10 articles",
    articles: 10,
    priceMad: 800,
    priceLabel: "800 DHS",
    perArticleLabel: "80 DHS / article",
    description:
      "Le meilleur rapport qualité-prix pour une production éditoriale régulière.",
    highlighted: true,
    features: [
      "10 crédits article",
      "Économie vs pack 5",
      "Brief SEO + backlinks",
      "Maillage interne suggéré",
      "Publication sur le site",
    ],
  },
  {
    id: "pack-20",
    name: "Pack 20 articles",
    articles: 20,
    priceMad: 1500,
    priceLabel: "1 500 DHS",
    perArticleLabel: "75 DHS / article",
    description:
      "Pour scaler votre présence SEO : plus de contenus, plus de backlinks, plus de trafic.",
    features: [
      "20 crédits article",
      "Meilleur prix unitaire",
      "Briefs multi-domaines",
      "Stratégie backlinks avancée",
      "Support prioritaire",
    ],
  },
];

/** @deprecated Utiliser CREDIT_PACKS — conservé pour compatibilité de noms. */
export const PRICING_PLANS = CREDIT_PACKS;

export function getCreditPackById(id: string) {
  return CREDIT_PACKS.find((pack) => pack.id === id);
}
