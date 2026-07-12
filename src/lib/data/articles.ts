import type { DomainId } from "@/lib/data/domains";

export type ArticleStatus = "draft" | "published" | "scheduled";

export type Article = {
  id: string;
  slug: string;
  title: string;
  domain: DomainId;
  type: "article" | "annonce";
  status: ArticleStatus;
  excerpt: string;
  metaDescription: string;
  keywords: string[];
  headings: {
    h1: string;
    h2: string[];
    h3: string[];
  };
  content: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
};

export const ARTICLES: Article[] = [
  {
    id: "1",
    slug: "acheter-appartement-lyon-2026",
    title: "Acheter un appartement à Lyon en 2026 : guide complet",
    domain: "immobilier",
    type: "article",
    status: "published",
    excerpt:
      "Les quartiers à viser, les prix au m² et les critères SEO locaux pour convertir les acheteurs.",
    metaDescription:
      "Guide SEO 2026 pour acheter un appartement à Lyon : prix au m², quartiers porteurs et checklist d'achat.",
    keywords: [
      "acheter appartement Lyon",
      "prix m2 Lyon 2026",
      "immobilier Lyon",
    ],
    headings: {
      h1: "Acheter un appartement à Lyon en 2026",
      h2: [
        "État du marché lyonnais",
        "Meilleurs quartiers selon budget",
        "Checklist avant offre d'achat",
      ],
      h3: [
        "Prix au m² par arrondissement",
        "Frais de notaire et charges",
        "Financement et taux",
      ],
    },
    content:
      "Le marché immobilier lyonnais reste dynamique en 2026. Ce guide détaille les quartiers, les prix et les étapes clés pour sécuriser votre achat.",
    author: "Équipe Manchoufouch",
    publishedAt: "2026-06-12T09:00:00.000Z",
    updatedAt: "2026-07-01T10:00:00.000Z",
  },
  {
    id: "2",
    slug: "annonce-t2-croix-rousse",
    title: "T2 lumineux Croix-Rousse — 48 m² avec balcon",
    domain: "immobilier",
    type: "annonce",
    status: "published",
    excerpt:
      "Appartement rénové, proche métro, idéal primo-accédant ou investissement locatif.",
    metaDescription:
      "Annonce T2 Croix-Rousse Lyon : 48 m², balcon, rénové, proche métro. Prix et visite sur demande.",
    keywords: ["T2 Croix-Rousse", "appartement Lyon 4", "balcon Lyon"],
    headings: {
      h1: "T2 lumineux Croix-Rousse — 48 m² avec balcon",
      h2: ["Descriptif du bien", "Points forts du quartier", "Conditions de visite"],
      h3: ["Surface et agencement", "Charges et taxes", "Disponibilité"],
    },
    content:
      "Bel appartement T2 de 48 m² situé sur les pentes de la Croix-Rousse, entièrement rénové avec balcon exposé sud.",
    author: "Agence Partenaire",
    publishedAt: "2026-07-02T14:30:00.000Z",
    updatedAt: "2026-07-02T14:30:00.000Z",
  },
  {
    id: "3",
    slug: "fiche-produit-casque-anc",
    title: "Casque ANC Pro X : fiche produit SEO-ready",
    domain: "ecommerce",
    type: "article",
    status: "published",
    excerpt:
      "Structure Hn, mots-clés transactionnels et méta optimisée pour une fiche casque audio.",
    metaDescription:
      "Casque ANC Pro X : réduction de bruit active, 40h d'autonomie. Comparatif, avis et fiche SEO complète.",
    keywords: [
      "casque ANC",
      "casque reduction bruit",
      "acheter casque bluetooth",
    ],
    headings: {
      h1: "Casque ANC Pro X — réduction de bruit pro",
      h2: ["Caractéristiques techniques", "Pour qui ?", "Comparatif concurrentiel"],
      h3: ["Autonomie", "Confort", "Connectivité"],
    },
    content:
      "Le Casque ANC Pro X combine réduction de bruit active et autonomie longue durée pour les professionnels nomades.",
    author: "Équipe Contenu",
    publishedAt: "2026-05-20T08:00:00.000Z",
    updatedAt: "2026-06-15T11:00:00.000Z",
  },
  {
    id: "4",
    slug: "sommeil-remedes-naturels",
    title: "Améliorer son sommeil : 12 remèdes naturels validés",
    domain: "sante",
    type: "article",
    status: "draft",
    excerpt:
      "Brief éditorial santé avec intention informationnelle et balises Hn structurées.",
    metaDescription:
      "12 remèdes naturels pour mieux dormir : routines, plantes et habitudes validées par des experts.",
    keywords: [
      "mieux dormir naturellement",
      "remèdes sommeil",
      "insomnie naturelle",
    ],
    headings: {
      h1: "Améliorer son sommeil avec des remèdes naturels",
      h2: ["Routine du soir", "Plantes et compléments", "Erreurs à éviter"],
      h3: ["Mélatonine", "Magnésium", "Hygiène de lit"],
    },
    content:
      "Un sommeil de qualité repose sur des habitudes stables. Voici 12 leviers naturels à tester progressivement.",
    author: "Rédaction Santé",
    publishedAt: "2026-07-08T16:00:00.000Z",
    updatedAt: "2026-07-08T16:00:00.000Z",
  },
  {
    id: "5",
    slug: "landing-saas-analytics",
    title: "Analytics SaaS : landing page conversion + SEO",
    domain: "tech",
    type: "article",
    status: "published",
    excerpt:
      "Template de landing B2B avec H1 orienté bénéfice et clusters de mots-clés.",
    metaDescription:
      "Landing page Analytics SaaS : structure SEO, preuves sociales et CTA pour convertir les leads B2B.",
    keywords: [
      "outil analytics SaaS",
      "dashboard analytics",
      "software product analytics",
    ],
    headings: {
      h1: "L'analytics produit qui accélère vos décisions",
      h2: ["Fonctionnalités clés", "Cas clients", "Tarification transparente"],
      h3: ["Intégrations", "Sécurité", "Onboarding"],
    },
    content:
      "Cette landing combine intention commerciale et structure SEO pour capturer du trafic organique qualifié.",
    author: "Growth Team",
    publishedAt: "2026-04-10T09:00:00.000Z",
    updatedAt: "2026-06-01T09:00:00.000Z",
  },
  {
    id: "6",
    slug: "weekend-marseille-vieux-port",
    title: "Week-end à Marseille : itinerary Vieux-Port",
    domain: "tourisme",
    type: "annonce",
    status: "scheduled",
    excerpt:
      "Itinéraire SEO local pour un week-end à Marseille autour du Vieux-Port.",
    metaDescription:
      "Week-end Marseille Vieux-Port : que faire, où dormir et où manger. Guide local optimisé SEO.",
    keywords: [
      "week-end Marseille",
      "Vieux-Port Marseille",
      "que faire Marseille",
    ],
    headings: {
      h1: "Week-end à Marseille autour du Vieux-Port",
      h2: ["Jour 1 — découverte", "Jour 2 — calanques", "Où dormir"],
      h3: ["Restaurants", "Musées", "Transports"],
    },
    content:
      "Un itinerary compact pour découvrir Marseille en 48h, du Vieux-Port aux calanques.",
    author: "Travel Desk",
    publishedAt: "2026-07-20T08:00:00.000Z",
    updatedAt: "2026-07-09T12:00:00.000Z",
  },
  {
    id: "7",
    slug: "entretien-jardin-printemps",
    title: "Entretien de jardin au printemps : checklist complète",
    domain: "services",
    type: "article",
    status: "published",
    excerpt:
      "Tonte, taille, arrosage et traitements : le guide SEO des services d'entretien extérieur.",
    metaDescription:
      "Checklist entretien jardin au printemps : tonte, taille de haies, arrosage. Conseils et services à domicile.",
    keywords: [
      "entretien jardin printemps",
      "jardinier à domicile",
      "taille de haies",
    ],
    headings: {
      h1: "Entretien de jardin au printemps : checklist complète",
      h2: ["Travaux prioritaires", "Calendrier mensuel", "Quand appeler un pro"],
      h3: ["Tonte", "Désherbage", "Fertilisation"],
    },
    content:
      "Le printemps est la saison clé pour relancer un jardin. Voici les gestes essentiels et quand faire appel à un jardinier.",
    author: "Green Desk",
    publishedAt: "2026-03-15T09:00:00.000Z",
    updatedAt: "2026-04-01T09:00:00.000Z",
  },
  {
    id: "8",
    slug: "annonce-peugeot-208-occasion",
    title: "Peugeot 208 Occasion — 42 000 km, garantie 12 mois",
    domain: "voiture",
    type: "annonce",
    status: "published",
    excerpt:
      "Citadine récente, faible kilométrage, idéal premier achat ou seconde voiture.",
    metaDescription:
      "Annonce Peugeot 208 occasion : 42 000 km, garantie 12 mois. Prix, options et visite sur rendez-vous.",
    keywords: [
      "Peugeot 208 occasion",
      "acheter voiture occasion",
      "citadine essence",
    ],
    headings: {
      h1: "Peugeot 208 Occasion — 42 000 km",
      h2: ["Caractéristiques", "Historique du véhicule", "Conditions de vente"],
      h3: ["Motorisation", "Équipements", "Financement possible"],
    },
    content:
      "Peugeot 208 en excellent état, entretien suivi, disponible immédiatement avec garantie.",
    author: "Auto Market",
    publishedAt: "2026-07-05T11:00:00.000Z",
    updatedAt: "2026-07-05T11:00:00.000Z",
  },
  {
    id: "9",
    slug: "guide-achat-lave-linge",
    title: "Comment choisir son lave-linge en 2026",
    domain: "electromenager",
    type: "article",
    status: "published",
    excerpt:
      "Capacité, classe énergétique et programmes : le guide d'achat électroménager.",
    metaDescription:
      "Guide d'achat lave-linge 2026 : capacité, classe A, programmes et budget. Comparatif pour bien choisir.",
    keywords: [
      "acheter lave-linge",
      "comparatif lave-linge",
      "classe énergétique",
    ],
    headings: {
      h1: "Comment choisir son lave-linge en 2026",
      h2: ["Les critères essentiels", "Budget et marques", "Erreurs à éviter"],
      h3: ["Capacité kg", "Consommation eau", "Silence et vibration"],
    },
    content:
      "Un bon lave-linge se choisit selon la taille du foyer, l'espace disponible et la consommation énergétique.",
    author: "Maison Lab",
    publishedAt: "2026-02-10T08:00:00.000Z",
    updatedAt: "2026-06-20T08:00:00.000Z",
  },
  {
    id: "10",
    slug: "annonce-yamaha-mt07",
    title: "Yamaha MT-07 — roadster polyvalent, état impeccable",
    domain: "motos",
    type: "annonce",
    status: "draft",
    excerpt:
      "Roadster iconique, idéal permis A2 bridé ou full A. Entretien à jour.",
    metaDescription:
      "Annonce Yamaha MT-07 occasion : roadster polyvalent, entretien à jour. Équipements et essai sur place.",
    keywords: ["Yamaha MT-07", "acheter moto occasion", "roadster A2"],
    headings: {
      h1: "Yamaha MT-07 — roadster polyvalent",
      h2: ["Fiche technique", "État et entretien", "Équipements inclus"],
      h3: ["Cylindrée", "Consommation", "Assurance estimée"],
    },
    content:
      "Yamaha MT-07 en très bon état, idéale pour un usage quotidien et week-end.",
    author: "Moto Corner",
    publishedAt: "2026-07-10T15:00:00.000Z",
    updatedAt: "2026-07-10T15:00:00.000Z",
  },
  {
    id: "11",
    slug: "comparatif-smartphones-milieu-de-gamme",
    title: "Meilleurs smartphones milieu de gamme 2026",
    domain: "electronique",
    type: "article",
    status: "published",
    excerpt:
      "Comparatif photo, autonomie et performances pour bien acheter son smartphone.",
    metaDescription:
      "Comparatif smartphones milieu de gamme 2026 : photo, autonomie, prix. Trouvez le meilleur rapport qualité-prix.",
    keywords: [
      "smartphone milieu de gamme",
      "comparatif smartphone 2026",
      "meilleur rapport qualité prix",
    ],
    headings: {
      h1: "Meilleurs smartphones milieu de gamme 2026",
      h2: ["Nos favoris", "Critères de comparaison", "Pour qui ?"],
      h3: ["Photo", "Autonomie", "Fluidité"],
    },
    content:
      "Le segment milieu de gamme offre aujourd'hui d'excellentes performances sans exploser le budget.",
    author: "Tech Review",
    publishedAt: "2026-05-01T10:00:00.000Z",
    updatedAt: "2026-06-28T10:00:00.000Z",
  },
];

export function getArticleBySlug(slug: string) {
  return ARTICLES.find((article) => article.slug === slug);
}

export async function resolveArticleBySlug(slug: string) {
  const demo = getArticleBySlug(slug);
  if (demo) return demo;

  const { getPublishedArticleBySlug } = await import(
    "@/lib/seo/published-store"
  );
  return getPublishedArticleBySlug(slug);
}

export function getArticlesByDomain(domain?: string) {
  if (!domain || domain === "all") return ARTICLES;
  return ARTICLES.filter((article) => article.domain === domain);
}

export function getPublishedArticles() {
  return ARTICLES.filter((article) => article.status === "published");
}
