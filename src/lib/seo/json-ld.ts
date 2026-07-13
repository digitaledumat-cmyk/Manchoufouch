import type { Article } from "@/lib/data/articles";
import { getDomainLabel } from "@/lib/data/domains";
import { absoluteUrl } from "@/lib/seo/metadata";
import { getWhatsAppUrl, SITE_CONFIG } from "@/lib/seo/site";

export function organizationJsonLd() {
  const logoUrl = absoluteUrl(SITE_CONFIG.logoPath);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.name,
    legalName: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    email: SITE_CONFIG.email,
    telephone: SITE_CONFIG.phone,
    logo: {
      "@type": "ImageObject",
      url: logoUrl,
      width: 512,
      height: 512,
      contentUrl: logoUrl,
      caption: SITE_CONFIG.name,
    },
    image: logoUrl,
    sameAs: [
      getWhatsAppUrl(),
    ].filter(Boolean),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    inLanguage: "fr-FR",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_CONFIG.url}/articles?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function articleJsonLd(article: Article) {
  const isListing = article.type === "annonce";

  return {
    "@context": "https://schema.org",
    "@type": isListing ? "Product" : "Article",
    headline: article.title,
    name: article.title,
    description: article.metaDescription,
    keywords: article.keywords.join(", "),
    inLanguage: "fr-FR",
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      "@type": "Person",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(SITE_CONFIG.logoPath),
        width: 512,
        height: 512,
      },
    },
    image: absoluteUrl(SITE_CONFIG.logoPath),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/articles/${article.slug}`),
    },
    articleSection: getDomainLabel(article.domain),
    about: getDomainLabel(article.domain),
  };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function pricingOfferJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${SITE_CONFIG.name} Crédits articles SEO`,
    description:
      "Packs de crédits pour publier des articles SEO optimisés avec backlinks.",
    brand: {
      "@type": "Brand",
      name: SITE_CONFIG.name,
    },
    offers: [
      {
        "@type": "Offer",
        name: "Pack 5 articles",
        price: "500.00",
        priceCurrency: "MAD",
        availability: "https://schema.org/InStock",
        url: absoluteUrl("/pricing"),
      },
      {
        "@type": "Offer",
        name: "Pack 10 articles",
        price: "800.00",
        priceCurrency: "MAD",
        availability: "https://schema.org/InStock",
        url: absoluteUrl("/pricing"),
      },
      {
        "@type": "Offer",
        name: "Pack 20 articles",
        price: "1500.00",
        priceCurrency: "MAD",
        availability: "https://schema.org/InStock",
        url: absoluteUrl("/pricing"),
      },
    ],
  };
}
