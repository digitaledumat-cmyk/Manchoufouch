export const HOME_STATS = [
  { value: "10+", label: "Années d'expertise SEO" },
  { value: "120+", label: "Projets livrés" },
  { value: "160+", label: "Clients satisfaits" },
  { value: "18", label: "Domaines couverts" },
  { value: "50k+", label: "Mots-clés suivis" },
  { value: "4.8/5", label: "Satisfaction moyenne" },
] as const;

export const HOME_INTRO = {
  title: "Pourquoi avoir un site s'il ne génère pas de visibilité au Maroc ?",
  text: "Manchoufouch est l'allié des entreprises marocaines pour le référencement Google, les backlinks, les mots-clés SEO et Google Ads. Notre objectif : vous faire apparaître devant vos clients à Casablanca, Rabat, Marrakech et partout au Royaume.",
} as const;

export const HOME_STRATEGIC = [
  {
    id: "collaboration",
    eyebrow: "Strategic Thinking",
    title: "Une collaboration fluide et axée sur les résultats",
    text: "Chez Manchoufouch, nous croyons que les meilleurs résultats naissent d'une collaboration transparente et efficace. Comme le dit le proverbe : « Seul on va plus vite, ensemble on va plus loin ». Nous travaillons main dans la main avec nos clients pour comprendre leurs besoins et définir des stratégies sur mesure. En combinant votre expertise métier avec notre savoir-faire en création de contenu, SEO, Google Ads, SXO et Web Analytics, nous créons des solutions adaptées à vos objectifs. Notre mission : un site performant, optimisé pour le référencement, en harmonie avec les attentes de votre clientèle.",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Équipe collaborant autour d'une stratégie digitale",
    secondaryImage: "/home/seo-google.jpg",
  },
  {
    id: "sur-mesure",
    eyebrow: "Strategic Thinking",
    title: "Des solutions sur mesure pour votre réussite",
    text: "Chaque projet est unique, et c'est pourquoi nous mettons un point d'honneur à offrir des services personnalisés. Que ce soit pour améliorer votre visibilité en ligne, attirer plus de trafic qualifié ou concevoir un contenu web performant, nous adaptons nos approches à vos besoins spécifiques. Nos experts en SEO et SXO travaillent sur tous les aspects techniques et stratégiques pour garantir une expérience utilisateur optimale et des résultats mesurables. Grâce à des campagnes ciblées et une analyse approfondie des données, nous maximisons vos performances et atteignons vos objectifs commerciaux.",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Atelier stratégique pour définir une solution sur mesure",
    secondaryImage: "/home/analytics-desk.jpg",
  },
  {
    id: "transparence",
    eyebrow: "Strategic Thinking",
    title: "Transparence et résultats mesurables",
    text: "Chez Manchoufouch, la transparence est au cœur de notre approche. Nous vous tenons informé à chaque étape grâce à des rapports détaillés et des outils comme Google Analytics. Vous suivez l'évolution de votre projet en temps réel, avec des indicateurs clairs pour évaluer vos progrès. Nous sommes dédiés à fournir des résultats concrets et durables : meilleur classement sur les moteurs de recherche, augmentation du trafic, et retour sur investissement optimal.",
    image: "/home/analytics-desk.jpg",
    imageAlt: "Suivi des résultats SEO avec Google Analytics",
    secondaryImage: "/home/seo-google.jpg",
  },
] as const;

export const HOME_SERVICES = [
  {
    id: "seo",
    title: "Référencement naturel Maroc",
    description:
      "Stratégies SEO sur mesure pour le marché marocain : technique, contenu, netlinking et positionnement Google. Visibilité durable sur Casablanca, Rabat, Marrakech et le national.",
    points: [
      "Audit SEO Maroc & corrections prioritaires",
      "Mots-clés SEO à forte demande locale",
      "Netlinking / backlinks de qualité",
    ],
    href: "/dashboard/create-article",
    image:
      "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Analyse de référencement naturel sur un écran",
  },
  {
    id: "contenu",
    title: "Mots-clés SEO & contenu",
    description:
      "Générez les mots-clés que recherchent les Marocains (SEO, backlinks, référencement Google), plus la structure H1/H2/H3 et la méta-description.",
    points: [
      "Clusters mots-clés marché Maroc",
      "Balises Hn et méta SEO-ready",
      "Articles prêts pour le netlinking",
    ],
    href: "/dashboard/create-article",
    image: "/home/seo-google.jpg",
    imageAlt: "Illustration Google SEO en croissance",
  },
  {
    id: "ads",
    title: "Google Ads Maroc",
    description:
      "Campagnes SEA pour des résultats rapides : trafic qualifié, leads et ventes pendant que votre SEO monte en puissance.",
    points: [
      "Campagnes Search & Display",
      "Budgets adaptés au marché marocain",
      "Suivi ROI et conversions",
    ],
    href: "/pricing",
    image:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Campagne publicitaire Google Ads sur ordinateur",
  },
  {
    id: "annonces",
    title: "Backlinks & articles SEO",
    description:
      "Publiez des articles optimisés avec suggestions de backlinks pour renforcer votre autorité de domaine et votre référencement Google.",
    points: [
      "Packs crédits articles (500 / 800 / 1500 DHS)",
      "Suggestions de backlinks",
      "Publication multi-domaines",
    ],
    href: "/dashboard/articles",
    image:
      "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Articles SEO et backlinks pour le référencement",
  },
  {
    id: "analyse",
    title: "Analyse & suivi",
    description:
      "Transformez vos données en décisions : suivez le positionnement des mots-clés, le trafic organique et le ROI Google Ads au Maroc.",
    points: [
      "Suivi mots-clés & rankings Google",
      "Rapports clairs et actionnables",
      "Optimisation continue SEO + Ads",
    ],
    href: "/pricing",
    image: "/home/analytics-desk.jpg",
    imageAlt: "Bureau analytics Google et tableaux de bord",
  },
  {
    id: "sxo",
    title: "SXO — SEO + expérience",
    description:
      "Alliez référencement et expérience utilisateur : structure claire, mobile-first et parcours qui convertissent les visiteurs marocains.",
    points: [
      "Architecture de pages conversion-first",
      "UX alignée sur l'intention de recherche",
      "Réduction du taux de rebond",
    ],
    href: "/pricing",
    image:
      "https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Design d'interface utilisateur sur ordinateur portable",
  },
  {
    id: "local",
    title: "Référencement local Maroc",
    description:
      "Captez les recherches locales (« près de chez moi », ville + service) pour dominer Google sur votre zone : Casablanca, Rabat, Marrakech…",
    points: [
      "Pages locales et fiches services",
      "Mots-clés géolocalisés Maroc",
      "CTA WhatsApp / devis rapides",
    ],
    href: "/dashboard/create-article",
    image:
      "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Carte et recherche locale sur mobile",
  },
] as const;

export const HOME_DOMAINS = [
  {
    label: "Immobilier",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80",
  },
  {
    label: "Voiture",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=600&q=80",
  },
  {
    label: "Motos",
    image:
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80",
  },
  {
    label: "Électronique",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
  },
  {
    label: "Produits digitaux",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
  },
  {
    label: "Manufacturing",
    image:
      "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=600&q=80",
  },
  {
    label: "Beauty",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80",
  },
  {
    label: "Gadget",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80",
  },
  {
    label: "Informatique",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80",
  },
  {
    label: "Tourisme",
    image:
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80",
  },
  {
    label: "Électroménager",
    image:
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=600&q=80",
  },
  {
    label: "Maison & Déco",
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80",
  },
  {
    label: "Services",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80",
  },
] as const;

export const HOME_PROCESS = [
  {
    step: "01",
    title: "Consultation & objectifs",
    text: "Nous clarifions votre marché, vos personas et vos priorités de trafic organique.",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80",
  },
  {
    step: "02",
    title: "Stratégie personnalisée",
    text: "Choix des domaines, clusters de mots-clés et plan éditorial alignés sur vos objectifs.",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
  },
  {
    step: "03",
    title: "Mise en œuvre",
    text: "Création de briefs SEO, articles et annonces prêts à publier dans votre dashboard.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
  },
  {
    step: "04",
    title: "Mesure & optimisation",
    text: "Suivi des résultats et itérations continues pour renforcer votre positionnement.",
    image: "/home/analytics-desk.jpg",
  },
] as const;

export const HOME_RESULTS = [
  {
    label: "Trafic organique annuel",
    before: "726",
    after: "10 265",
  },
  {
    label: "Mots-clés positionnés",
    before: "1 026",
    after: "8 426",
  },
  {
    label: "Retour sur investissement",
    before: "488%",
    after: "726%",
  },
] as const;

export const HOME_PILLARS = [
  {
    title: "Contenu de valeur",
    text: "Textes uniques, structurés et utiles, enrichis pour captiver les visiteurs et satisfaire Google comme les assistants IA.",
    image:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Optimisation mobile",
    text: "Expérience fluide sur tous les écrans : vitesse, lisibilité et structure mobile-first indispensables aujourd'hui.",
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Expérience utilisateur",
    text: "Navigation claire, intention de recherche respectée et parcours pensés pour convertir chaque visite.",
    image:
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=600&q=80",
  },
] as const;

export const HOME_NEWS = [
  {
    title: "Mots-clés SEO les plus cherchés au Maroc en 2026",
    excerpt:
      "Référencement naturel, backlinks, Google Ads : le top des intentions de recherche locales.",
    date: "12 Jan, 2026",
    href: "/#mots-cles",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Backlinks de qualité : booster son SEO au Maroc",
    excerpt:
      "Comment un netlinking propre accélère votre positionnement Google sans pénalité.",
    date: "28 Fév, 2026",
    href: "/dashboard/create-article",
    image:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Google Ads + SEO : la combo gagnante",
    excerpt:
      "Trafic immédiat via Ads pendant que votre référencement naturel monte en puissance.",
    date: "05 Mar, 2026",
    href: "/pricing",
    image: "/home/seo-google.jpg",
  },
] as const;

export const HOME_TESTIMONIALS = [
  {
    name: "Nadia J.",
    role: "Directrice marketing",
    quote:
      "Manchoufouch a structuré notre production de contenu. Le trafic organique a clairement décollé.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Idriss M.",
    role: "Fondateur e-commerce",
    quote:
      "Les briefs par domaine nous font gagner un temps énorme. Professionnels et efficaces.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Yousra C.",
    role: "Responsable SEO",
    quote:
      "Enfin une plateforme qui combine création éditoriale et bonnes pratiques SEO Next.js.",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Redouane Y.",
    role: "Agence digitale",
    quote:
      "Très convivial. Nos clients adorent la clarté des briefs Hn et méta-descriptions.",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
  },
] as const;

export const HOME_FAQ = [
  {
    question: "Qu'est-ce que le SEO et pourquoi est-il important au Maroc ?",
    answer:
      "Le SEO (référencement naturel) améliore votre visibilité sur Google Maroc, attire des clients qualifiés à Casablanca, Rabat, Marrakech et ailleurs, et réduit la dépendance à la publicité payante.",
  },
  {
    question: "Proposez-vous des backlinks et du netlinking ?",
    answer:
      "Oui. Nos articles SEO incluent des suggestions de backlinks et une stratégie de netlinking pour renforcer votre autorité de domaine et votre positionnement Google.",
  },
  {
    question: "Quelle est la différence entre SEO et Google Ads ?",
    answer:
      "Le SEO construit un classement organique durable. Google Ads (SEA) apporte une visibilité immédiate via des campagnes payantes — les deux se complètent très bien au Maroc.",
  },
  {
    question: "Quels mots-clés SEO sont les plus demandés ?",
    answer:
      "Référencement naturel Maroc, agence SEO Maroc, backlinks Maroc, Google Ads Maroc, mots-clés SEO, audit SEO, référencement Casablanca / Rabat / Marrakech, et de nombreuses longue traîne locales.",
  },
  {
    question: "En combien de temps puis-je voir des résultats ?",
    answer:
      "Avec une stratégie régulière, une amélioration notable apparaît souvent entre 3 et 6 mois. Google Ads peut générer du trafic dès les premiers jours.",
  },
  {
    question: "Combien coûtent vos crédits articles ?",
    answer:
      "5 articles à 500 DHS, 10 articles à 800 DHS, 20 articles à 1 500 DHS. Commande via WhatsApp au +212 661 876 103.",
  },
] as const;
