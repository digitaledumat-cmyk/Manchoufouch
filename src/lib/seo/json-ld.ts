import type { Article } from "@/lib/data/articles";
import { getDomainLabel } from "@/lib/data/domains";
import { absoluteUrl } from "@/lib/seo/metadata";
import { getWhatsAppUrl, SITE_CONFIG } from "@/lib/seo/site";

function logoImageObject() {
  const logoUrl = absoluteUrl(SITE_CONFIG.logoPath);
  return {
    "@type": "ImageObject",
    url: logoUrl,
    width: 512,
    height: 512,
    contentUrl: logoUrl,
    caption: SITE_CONFIG.name,
  };
}

function areaServedJsonLd() {
  return [
    {
      "@type": "Country",
      name: SITE_CONFIG.geo.countryName,
    },
    ...SITE_CONFIG.geo.cities.map((city) => ({
      "@type": "City",
      name: city,
      containedInPlace: {
        "@type": "Country",
        name: SITE_CONFIG.geo.countryName,
      },
    })),
  ];
}

export function organizationJsonLd() {
  const logo = logoImageObject();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: SITE_CONFIG.name,
    legalName: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    email: SITE_CONFIG.email,
    telephone: SITE_CONFIG.phone,
    logo,
    image: logo.url,
    areaServed: areaServedJsonLd(),
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE_CONFIG.geo.primaryCity,
      addressCountry: SITE_CONFIG.geo.countryCode,
    },
    sameAs: [getWhatsAppUrl()].filter(Boolean),
  };
}

/** Agence SEO locale Maroc — Knowledge Graph / local SEO. */
export function localBusinessJsonLd() {
  const logo = logoImageObject();

  return {
    "@context": "https://schema.org",
    "@type": ["ProfessionalService", "LocalBusiness"],
    "@id": absoluteUrl("/#localbusiness"),
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    email: SITE_CONFIG.email,
    telephone: SITE_CONFIG.phone,
    image: logo.url,
    logo,
    priceRange: "$$",
    currenciesAccepted: "MAD",
    paymentAccepted: "Cash, Credit Card, Bank Transfer",
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE_CONFIG.geo.primaryCity,
      addressCountry: SITE_CONFIG.geo.countryCode,
    },
    areaServed: areaServedJsonLd(),
    availableLanguage: ["fr", "ar"],
    parentOrganization: {
      "@id": absoluteUrl("/#organization"),
    },
    sameAs: [getWhatsAppUrl()].filter(Boolean),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    inLanguage: SITE_CONFIG.language,
    publisher: {
      "@id": absoluteUrl("/#organization"),
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
    inLanguage: SITE_CONFIG.language,
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
