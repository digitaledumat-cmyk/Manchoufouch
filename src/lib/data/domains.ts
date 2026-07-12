export const DOMAINS = [
  {
    id: "immobilier",
    label: "Immobilier",
    description: "Annonces et guides pour l'achat, la location et l'investissement.",
  },
  {
    id: "ecommerce",
    label: "E-commerce",
    description: "Fiches produits, comparatifs et contenus d'achat.",
  },
  {
    id: "sante",
    label: "Santé & Bien-être",
    description: "Articles informatifs et pages de services médicaux.",
  },
  {
    id: "tech",
    label: "Tech & SaaS",
    description: "Contenus B2B, landing pages et documentation produit.",
  },
  {
    id: "produits-digitaux",
    label: "Produits digitaux",
    description:
      "Ebooks, formations en ligne, logiciels, templates, IPTV, abonnements et téléchargements numériques.",
  },
  {
    id: "manufacturing",
    label: "Manufacturing",
    description:
      "Industrie, production, usines, machines industrielles et B2B manufacturing.",
  },
  {
    id: "beauty",
    label: "Beauty",
    description:
      "Beauté, cosmétiques, soins, maquillage, salons et produits beauty.",
  },
  {
    id: "gadget",
    label: "Gadget",
    description:
      "Gadgets tech, accessoires connectés, objets malins et nouveautés high-tech.",
  },
  {
    id: "informatique",
    label: "Informatique",
    description:
      "Ordinateurs, composants, réseaux, logiciels, maintenance et services IT.",
  },
  {
    id: "tourisme",
    label: "Tourisme",
    description: "Guides de destination, hôtels et expériences locales.",
  },
  {
    id: "maison",
    label: "Maison & Déco",
    description: "Articles maison, aménagement, bricolage et décoration intérieure.",
  },
  {
    id: "electromenager",
    label: "Électroménager",
    description: "Fiches et guides pour lave-linge, frigo, four et petits appareils.",
  },
  {
    id: "electronique",
    label: "Électronique",
    description: "Smartphones, TV, audio, ordinateurs et accessoires high-tech.",
  },
  {
    id: "voiture",
    label: "Voiture",
    description: "Annonces auto, essais, guides d'achat et entretien véhicule.",
  },
  {
    id: "motos",
    label: "Motos",
    description: "Annonces motos, scooters, essais et équipements 2-roues.",
  },
  {
    id: "bricolage",
    label: "Bricolage & Outillage",
    description: "Guides DIY, outils, rénovation et travaux maison.",
  },
  {
    id: "mode",
    label: "Mode & Accessoires",
    description: "Vêtements, chaussures, sacs et tendances fashion.",
  },
  {
    id: "sport",
    label: "Sport & Fitness",
    description: "Équipements sportifs, entraînement et nutrition sportive.",
  },
  {
    id: "alimentation",
    label: "Alimentation & Cuisine",
    description: "Recettes, produits alimentaires et guides culinaires.",
  },
  {
    id: "animaux",
    label: "Animaux",
    description: "Soins, accessoires et annonces pour chiens, chats et NAC.",
  },
  {
    id: "emploi",
    label: "Emploi & Formation",
    description: "Offres d'emploi, reconversion et contenus de formation.",
  },
  {
    id: "services",
    label: "Services à domicile",
    description: "Plomberie, ménage, déménagement, réparation et assistance.",
  },
] as const;

export type DomainId = (typeof DOMAINS)[number]["id"];

export function getDomainById(id: string) {
  return DOMAINS.find((domain) => domain.id === id);
}

export function getDomainLabel(id: string) {
  return getDomainById(id)?.label ?? id;
}
