import { stripMarkdownHashes } from "@/lib/ai/strip-markdown-hashes";

export const ARTICLE_MODELS = [
  {
    id: "commercial",
    label: "Article commercial",
    description: "Orienté conversion, offres et appels à l'action.",
  },
  {
    id: "presentation",
    label: "Article présentation de site web",
    description: "Présente l'entreprise, la mission et les atouts du site.",
  },
  {
    id: "service",
    label: "Article de service",
    description: "Détaille une prestation, ses bénéfices et le parcours client.",
  },
  {
    id: "produit",
    label: "Article de produit",
    description: "Fiche éditoriale produit : avantages, specs et preuve sociale.",
  },
  {
    id: "referencement",
    label: "Article pour référencement",
    description: "Contenu SEO longue traîne optimisé pour Google Maroc.",
  },
] as const;

export type ArticleModelId = (typeof ARTICLE_MODELS)[number]["id"];

export type GeneratedArticle = {
  model: ArticleModelId;
  sourceUrl: string;
  title: string;
  body: string;
  metaDescription: string;
  generatedAt: string;
};

function hostnameFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").split("/")[0] || "votresite.ma";
  }
}

function modelCopy(
  model: ArticleModelId,
  host: string,
  url: string,
): { title: string; body: string; meta: string } {
  switch (model) {
    case "commercial":
      return {
        title: `${host} : l'offre qui convertit vos visiteurs en clients`,
        meta: `Découvrez l'offre commerciale de ${host}. Avantages, preuves et CTA pour transformer votre trafic en ventes au Maroc.`,
        body: `${host} : passez à l'action dès aujourd'hui

Votre site ${url} attire déjà des visiteurs. Cet article commercial est conçu pour les faire avancer vers l'achat.

Pourquoi choisir ${host} ?
- Une proposition de valeur claire et mesurable
- Des offres adaptées au marché marocain
- Un parcours simple : découverte → confiance → conversion

Ce que vous gagnez
1. Plus de demandes de devis via WhatsApp et formulaire
2. Un message commercial cohérent avec votre positionnement SEO
3. Des arguments prêts à publier sur blog, landing et réseaux

Offre mise en avant
Profitez dès maintenant des solutions proposées sur ${host}. Contactez l'équipe pour un devis personnalisé et démarrez rapidement.

Appel à l'action
Visitez ${url}, choisissez votre pack, et laissez ${host} accélérer votre croissance.`,
      };
    case "presentation":
      return {
        title: `Présentation de ${host} : qui sommes-nous et pourquoi nous faire confiance`,
        meta: `Présentation complète de ${host}. Histoire, expertise, valeurs et services pour inspirer confiance aux visiteurs Google.`,
        body: `Présentation de ${host}

Bienvenue sur ${host} (${url}). Nous accompagnons les entreprises et particuliers au Maroc avec une approche claire, humaine et orientée résultats.

Notre mission
Rendre le digital accessible : visibilité, crédibilité et performance, sans jargon inutile.

Notre expertise
- Analyse des besoins et du marché local
- Création de contenus utiles et optimisés
- Accompagnement durable après mise en ligne

Pourquoi ${host} ?
Parce qu'un beau site ne suffit pas. Il doit raconter votre histoire, rassurer vos clients et apparaître sur Google.

Prochaine étape
Explorez ${url} et découvrez comment ${host} peut soutenir votre projet.`,
      };
    case "service":
      return {
        title: `Services ${host} : des prestations claires pour des résultats concrets`,
        meta: `Découvrez les services de ${host}. Prestations, bénéfices clients et processus simple pour obtenir un devis rapidement.`,
        body: `Les services proposés par ${host}

Sur ${url}, chaque service est pensé pour répondre à un besoin précis de votre activité.

Nos prestations

Audit et conseil
Comprendre votre situation actuelle et prioriser les actions à fort impact.

Mise en œuvre
Déploiement soigné : contenu, structure, suivi et optimisation continue.

Accompagnement
Un interlocuteur dédié pour ajuster la stratégie selon vos retours terrain.

Pour qui ?
PME, commerces, freelances et marques qui veulent plus de visibilité et de demandes qualifiées au Maroc.

Comment démarrer ?
1. Visitez ${url}
2. Choisissez le service adapté
3. Demandez un devis (WhatsApp ou formulaire)

${host} transforme vos besoins en un plan d'action clair.`,
      };
    case "produit":
      return {
        title: `Produit phare de ${host} : caractéristiques, bénéfices et pourquoi l'adopter`,
        meta: `Fiche produit éditoriale pour ${host}. Caractéristiques, bénéfices et arguments d'achat pour booster vos conversions.`,
        body: `Le produit qui fait la différence chez ${host}

Découvrez sur ${url} une solution conçue pour simplifier votre quotidien et maximiser votre retour sur investissement.

Points forts
- Qualité et fiabilité
- Rapport qualité-prix adapté au marché marocain
- Support et accompagnement après achat

Pour quels besoins ?
Idéal si vous cherchez une solution concrète, rapide à prendre en main, avec des résultats visibles.

Passez à l'achat
Consultez ${url}, comparez les options et choisissez la formule qui vous correspond.`,
      };
    case "referencement":
      return {
        title: `Référencement Google : comment ${host} attire du trafic organique qualifié`,
        meta: `Article SEO pour ${host}. Mots-clés, structure Hn et conseils de référencement naturel pour ranker sur Google Maroc.`,
        body: `Référencement naturel pour ${host}

Cet article est optimisé pour le référencement Google autour de ${host} (${url}).

Intention de recherche
Les internautes cherchent : référencement naturel Maroc, backlinks, mots-clés SEO, audit SEO et trafic organique.

Structure SEO recommandée

Audit technique
Vitesse, mobile, indexation et balises essentielles.

Contenu et mots-clés
Clusters locaux (Casablanca, Rabat, Marrakech) + longue traîne.

Netlinking
Backlinks de qualité pour renforcer l'autorité de ${host}.

Checklist publication
- Title et méta-description uniques
- H1 unique + H2/H3 cohérents
- Lien interne vers ${url}
- CTA WhatsApp / devis

Conclusion
Avec une stratégie SEO régulière, ${host} gagne en visibilité organique durable sur Google Maroc.`,
      };
  }
}

/** Simule la génération d'un article IA à partir d'une URL + modèle. */
export async function simulateArticleFromUrl(input: {
  url: string;
  model: ArticleModelId;
  domainLabel?: string;
}): Promise<GeneratedArticle> {
  const url = input.url.trim();
  if (!url) {
    throw new Error("Indiquez le lien du site web à analyser.");
  }

  const { fetchPageContext } = await import("@/lib/ai/fetch-page-context");
  let pageTitle = "";
  let pageMeta = "";
  let pageExcerpt = "";
  let sourceUrl = url.startsWith("http") ? url : `https://${url}`;

  try {
    const page = await fetchPageContext(url);
    pageTitle = page.title;
    pageMeta = page.metaDescription;
    pageExcerpt = page.excerpt.slice(0, 400);
    sourceUrl = page.url;
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 800));
  }

  const host = hostnameFromUrl(sourceUrl);
  const copy = modelCopy(input.model, host, sourceUrl);
  const topicHint = pageTitle
    ? `\n\nActivité détectée sur le site\nD'après ${host} : ${pageTitle}${pageMeta ? ` — ${pageMeta}` : ""}.${pageExcerpt ? `\n\nExtrait : ${pageExcerpt}` : ""}`
    : input.domainLabel
      ? `\n\nContexte domaine : ${input.domainLabel}.`
      : "";

  return {
    model: input.model,
    sourceUrl,
    title: stripMarkdownHashes(
      pageTitle
        ? `${pageTitle} — ${getArticleModelLabel(input.model)}`
        : copy.title,
    ),
    body: stripMarkdownHashes(`${copy.body}${topicHint}`),
    metaDescription: (pageMeta || copy.meta).slice(0, 160),
    generatedAt: new Date().toISOString(),
  };
}

export function getArticleModelLabel(id: string) {
  return ARTICLE_MODELS.find((model) => model.id === id)?.label ?? id;
}
