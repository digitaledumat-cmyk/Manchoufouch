import { getDomainById, type DomainId } from "@/lib/data/domains";
import { enrichKeywordsWithMoroccoDemand } from "@/lib/data/morocco-seo-keywords";

export type SeoBrief = {
  domain: DomainId;
  keywords: string[];
  headings: {
    h1: string;
    h2: string[];
    h3: string[];
  };
  metaDescription: string;
  generatedAt: string;
};

const BRIEF_TEMPLATES: Record<
  DomainId,
  Omit<SeoBrief, "domain" | "generatedAt">
> = {
  immobilier: {
    keywords: [
      "acheter appartement",
      "prix au m²",
      "annonce immobilière",
      "investissement locatif",
      "visite virtuelle",
    ],
    headings: {
      h1: "Guide immobilier SEO : convertir les acheteurs locaux",
      h2: [
        "Intention de recherche et mots-clés locaux",
        "Structure Hn d'une annonce performante",
        "Méta-description et rich snippets",
      ],
      h3: [
        "Quartiers et long-tail",
        "Preuves (photos, DPE, charges)",
        "CTA visite / contact",
      ],
    },
    metaDescription:
      "Optimisez vos annonces immobilières : mots-clés locaux, structure H1/H2/H3 et méta-description pour attirer des acheteurs qualifiés.",
  },
  ecommerce: {
    keywords: [
      "acheter en ligne",
      "fiche produit SEO",
      "comparatif produit",
      "avis clients",
      "livraison rapide",
    ],
    headings: {
      h1: "Fiche produit SEO-ready pour maximiser le trafic organique",
      h2: [
        "Mots-clés transactionnels",
        "Balises Hn et blocs de confiance",
        "Méta-description orientée conversion",
      ],
      h3: ["Attributs techniques", "FAQ produit", "Cross-sell éditorial"],
    },
    metaDescription:
      "Générez une fiche produit SEO : mots-clés transactionnels, H1/H2/H3 clairs et méta-description qui pousse à l'achat.",
  },
  sante: {
    keywords: [
      "conseils santé",
      "bien-être au quotidien",
      "symptômes et solutions",
      "prévention",
      "avis expert",
    ],
    headings: {
      h1: "Contenu santé E-E-A-T : informer sans sur-promettre",
      h2: [
        "Intention informationnelle",
        "Structure éditoriale rassurante",
        "Méta-description et YMYL",
      ],
      h3: ["Sources et expertise", "Sections FAQ", "Avertissements médicaux"],
    },
    metaDescription:
      "Brief SEO santé : mots-clés informationnels, structure Hn E-E-A-T et méta-description claire pour un contenu YMYL fiable.",
  },
  tech: {
    keywords: [
      "logiciel SaaS",
      "outil productivité",
      "intégration API",
      "essai gratuit",
      "comparatif logiciels",
    ],
    headings: {
      h1: "Landing SaaS SEO : trafic organique et leads B2B",
      h2: [
        "Clusters de mots-clés produit",
        "Architecture Hn orientée bénéfice",
        "Méta-description lead-gen",
      ],
      h3: ["Cas d'usage", "Preuves sociales", "CTA essai / démo"],
    },
    metaDescription:
      "Brief SEO SaaS : mots-clés produit, H1/H2/H3 orientés bénéfice et méta-description conçue pour générer des leads.",
  },
  "produits-digitaux": {
    keywords: [
      "produit digital",
      "ebook téléchargement",
      "formation en ligne",
      "abonnement numérique",
      "logiciel à télécharger",
      "template premium",
      "IPTV Maroc",
    ],
    headings: {
      h1: "Produits digitaux SEO : vendre en ligne au Maroc",
      h2: [
        "Mots-clés d'intention d'achat numérique",
        "Structure Hn fiche produit digital",
        "Méta-description et preuve de confiance",
      ],
      h3: [
        "Accès immédiat / livraison",
        "Compatibilité et support",
        "CTA achat / abonnement",
      ],
    },
    metaDescription:
      "Brief SEO produits digitaux : ebooks, formations, logiciels, abonnements — mots-clés, Hn et méta pour convertir au Maroc.",
  },
  manufacturing: {
    keywords: [
      "manufacturing Maroc",
      "industrie production",
      "machines industrielles",
      "usine et usinage",
      "fournisseur B2B industriel",
    ],
    headings: {
      h1: "Manufacturing SEO : attirer des clients B2B industriels",
      h2: [
        "Mots-clés industrie et production",
        "Structure Hn catalogue / prestation",
        "Méta-description devis industriel",
      ],
      h3: ["Capacités de production", "Normes qualité", "CTA devis usine"],
    },
    metaDescription:
      "Brief SEO manufacturing : mots-clés industriels, Hn B2B et méta-description pour générer des demandes de devis.",
  },
  beauty: {
    keywords: [
      "produits beauty",
      "cosmétiques Maroc",
      "soins visage",
      "maquillage tendance",
      "salon de beauté",
    ],
    headings: {
      h1: "Beauty SEO : cosmétiques et soins qui convertissent",
      h2: [
        "Intentions beauté et soins",
        "Structure Hn fiche produit / salon",
        "Méta-description beauty",
      ],
      h3: ["Ingrédients", "Résultats", "CTA achat / RDV"],
    },
    metaDescription:
      "Brief SEO beauty : mots-clés cosmétiques, structure Hn et méta-description pour ventes et réservations salon.",
  },
  gadget: {
    keywords: [
      "gadget high-tech",
      "accessoire connecté",
      "nouveauté tech",
      "objet malin",
      "gadget pas cher",
    ],
    headings: {
      h1: "Gadgets SEO : fiches produits qui vendent",
      h2: [
        "Mots-clés gadgets et accessoires",
        "Structure Hn comparatif / fiche",
        "Méta-description conversion",
      ],
      h3: ["Compatibilité", "Autonomie", "CTA commander"],
    },
    metaDescription:
      "Brief SEO gadget : mots-clés high-tech, Hn produit et méta-description pour booster les achats en ligne.",
  },
  informatique: {
    keywords: [
      "informatique Maroc",
      "ordinateur portable",
      "maintenance informatique",
      "réseau et serveurs",
      "dépannage PC",
    ],
    headings: {
      h1: "Informatique SEO : PC, services IT et composants",
      h2: [
        "Mots-clés hardware et services",
        "Structure Hn boutique / prestation",
        "Méta-description IT locale",
      ],
      h3: ["Configuration", "Garantie", "Support technique"],
    },
    metaDescription:
      "Brief SEO informatique : mots-clés PC/IT, Hn clairs et méta-description pour ventes et demandes de dépannage.",
  },
  tourisme: {
    keywords: [
      "week-end destination",
      "que faire à",
      "hôtel centre-ville",
      "itinéraire 48h",
      "bonnes adresses",
    ],
    headings: {
      h1: "Guide destination SEO pour capter les recherches locales",
      h2: [
        "Mots-clés saisonniers et locaux",
        "Itinéraire structuré en Hn",
        "Méta-description inspirante",
      ],
      h3: ["Transports", "Hébergements", "Restaurants et expériences"],
    },
    metaDescription:
      "Brief SEO tourisme : mots-clés locaux, structure H1/H2/H3 d'itinéraire et méta-description qui donne envie de réserver.",
  },
  maison: {
    keywords: [
      "décoration intérieure",
      "aménagement maison",
      "idées déco salon",
      "rangement maison",
      "inspiration habitat",
    ],
    headings: {
      h1: "Articles maison & déco : structure SEO qui inspire et convertit",
      h2: [
        "Tendances et intention de recherche",
        "Guides pratiques par pièce",
        "Méta-description lifestyle",
      ],
      h3: ["Salon", "Cuisine ouverte", "Chambre et rangement"],
    },
    metaDescription:
      "Brief SEO maison & déco : mots-clés inspirationnels, H1/H2/H3 par pièce et méta-description qui donne envie d'aménager.",
  },
  electromenager: {
    keywords: [
      "acheter lave-linge",
      "comparatif frigo",
      "four encastrable",
      "électroménager pas cher",
      "fiche technique appareil",
    ],
    headings: {
      h1: "Guide électroménager SEO : aider l'acheteur à choisir",
      h2: [
        "Critères techniques à comparer",
        "Structure Hn d'une fiche appareil",
        "Méta-description transactionnelle",
      ],
      h3: ["Classe énergétique", "Capacité et dimensions", "Garantie et SAV"],
    },
    metaDescription:
      "Brief SEO électroménager : mots-clés d'achat, H1/H2/H3 techniques et méta-description pour accélérer la décision d'achat.",
  },
  electronique: {
    keywords: [
      "smartphone pas cher",
      "TV 4K OLED",
      "ordinateur portable",
      "casque bluetooth",
      "comparatif high-tech",
    ],
    headings: {
      h1: "Contenu électronique SEO : du comparatif à la fiche produit",
      h2: [
        "Mots-clés high-tech et modèles",
        "Balises Hn pour specs et avis",
        "Méta-description orientée achat",
      ],
      h3: ["Performances", "Autonomie", "Rapport qualité-prix"],
    },
    metaDescription:
      "Brief SEO électronique : mots-clés modèles, structure Hn specs/avis et méta-description pour convertir le trafic high-tech.",
  },
  voiture: {
    keywords: [
      "acheter voiture occasion",
      "essai auto",
      "annonce voiture",
      "consommation carburant",
      "entretien véhicule",
    ],
    headings: {
      h1: "Annonces et guides auto SEO pour convertir les acheteurs",
      h2: [
        "Fiche véhicule et mots-clés modèles",
        "Essais, avis et points de vigilance",
        "Méta-description locale ou nationale",
      ],
      h3: ["Motorisation", "Kilométrage et historique", "Financement"],
    },
    metaDescription:
      "Brief SEO voiture : mots-clés modèles, structure Hn d'annonce/essai et méta-description pour attirer des acheteurs qualifiés.",
  },
  motos: {
    keywords: [
      "acheter moto occasion",
      "annonce moto",
      "scooter 125",
      "équipement moto",
      "permis A2",
    ],
    headings: {
      h1: "Contenu motos SEO : annonces, essais et équipements",
      h2: [
        "Catégories et intention de recherche",
        "Structure Hn d'une annonce 2-roues",
        "Méta-description sécurité & plaisir",
      ],
      h3: ["Cylindrée", "Équipements obligatoires", "Assurance moto"],
    },
    metaDescription:
      "Brief SEO motos : mots-clés 2-roues, H1/H2/H3 annonces/équipements et méta-description pour générer contacts et ventes.",
  },
  bricolage: {
    keywords: [
      "tutoriel bricolage",
      "outils DIY",
      "rénovation maison",
      "perceuse visseuse",
      "travaux soi-même",
    ],
    headings: {
      h1: "Guides bricolage SEO : tutos clairs et outils recommandés",
      h2: [
        "Étapes du projet DIY",
        "Liste d'outils et matériaux",
        "Méta-description pratique",
      ],
      h3: ["Sécurité chantier", "Budget estimatif", "Erreurs fréquentes"],
    },
    metaDescription:
      "Brief SEO bricolage : mots-clés DIY, structure Hn étape par étape et méta-description pour tutoriels et fiches outils.",
  },
  mode: {
    keywords: [
      "tendance mode",
      "acheter vêtements",
      "chaussures femme",
      "look de saison",
      "accessoires mode",
    ],
    headings: {
      h1: "Contenu mode SEO : tendances, lookbooks et fiches produit",
      h2: [
        "Mots-clés saisonniers et styles",
        "Structure Hn look / produit",
        "Méta-description fashion",
      ],
      h3: ["Matières", "Coupes", "Conseils d'entretien"],
    },
    metaDescription:
      "Brief SEO mode : mots-clés tendances, H1/H2/H3 lookbooks/fiches et méta-description qui pousse à découvrir la collection.",
  },
  sport: {
    keywords: [
      "équipement fitness",
      "programme musculation",
      "chaussures running",
      "nutrition sportive",
      "matériel sport",
    ],
    headings: {
      h1: "Sport & fitness SEO : programmes, équipements et conseils",
      h2: [
        "Intention entraînement vs achat",
        "Structure Hn guide / produit",
        "Méta-description motivationnelle",
      ],
      h3: ["Débutants", "Performance", "Récupération"],
    },
    metaDescription:
      "Brief SEO sport : mots-clés fitness, structure Hn guides/équipements et méta-description pour engager sportifs et acheteurs.",
  },
  alimentation: {
    keywords: [
      "recette facile",
      "cuisine healthy",
      "produits bio",
      "menu de la semaine",
      "astuces cuisine",
    ],
    headings: {
      h1: "Contenu alimentation SEO : recettes et guides culinaires",
      h2: [
        "Mots-clés recettes et intentions",
        "Structure Hn ingrédients / étapes",
        "Méta-description gourmande",
      ],
      h3: ["Temps de préparation", "Valeurs nutritionnelles", "Variantes"],
    },
    metaDescription:
      "Brief SEO alimentation : mots-clés recettes, H1/H2/H3 pratiques et méta-description qui donne envie de cuisiner.",
  },
  animaux: {
    keywords: [
      "accessoires chien",
      "alimentation chat",
      "soins animaux",
      "annonce animal",
      "conseils vétérinaires",
    ],
    headings: {
      h1: "Contenu animaux SEO : soins, produits et annonces",
      h2: [
        "Besoins par espèce",
        "Structure Hn guide / fiche produit",
        "Méta-description rassurante",
      ],
      h3: ["Alimentation", "Hygiène", "Accessoires essentiels"],
    },
    metaDescription:
      "Brief SEO animaux : mots-clés soins/produits, structure Hn claire et méta-description pour propriétaires d'animaux.",
  },
  emploi: {
    keywords: [
      "offre d'emploi",
      "recrutement",
      "formation professionnelle",
      "reconversion",
      "CV et entretien",
    ],
    headings: {
      h1: "Pages emploi & formation SEO pour attirer candidats et leads",
      h2: [
        "Mots-clés métiers et localisation",
        "Structure Hn offre / formation",
        "Méta-description recrutement",
      ],
      h3: ["Missions", "Profil recherché", "Avantages"],
    },
    metaDescription:
      "Brief SEO emploi : mots-clés métiers, H1/H2/H3 d'offre/formation et méta-description pour maximiser les candidatures.",
  },
  services: {
    keywords: [
      "plombier près de chez moi",
      "aide ménagère",
      "déménagement pas cher",
      "réparation à domicile",
      "devis service local",
    ],
    headings: {
      h1: "Services à domicile SEO : pages locales qui génèrent des devis",
      h2: [
        "Mots-clés locaux et urgence",
        "Prestations détaillées en Hn",
        "Méta-description contact rapide",
      ],
      h3: ["Tarifs", "Disponibilité", "Garanties"],
    },
    metaDescription:
      "Brief SEO services à domicile : mots-clés locaux, structure Hn des prestations et méta-description pour obtenir des devis.",
  },
};

/** Simule un appel API IA (latence + brief SEO selon le domaine). */
export async function simulateSeoBrief(domainId: string): Promise<SeoBrief> {
  const domain = getDomainById(domainId);
  if (!domain) {
    throw new Error(`Domaine inconnu: ${domainId}`);
  }

  await new Promise((resolve) => setTimeout(resolve, 900));

  const template = BRIEF_TEMPLATES[domain.id];

  return {
    domain: domain.id,
    ...template,
    keywords: enrichKeywordsWithMoroccoDemand(
      [
        ...template.keywords,
        domain.label.toLowerCase(),
        `SEO ${domain.label.toLowerCase()} Maroc`,
        `backlinks ${domain.label.toLowerCase()}`,
      ],
      domain.label,
    ),
    generatedAt: new Date().toISOString(),
  };
}
