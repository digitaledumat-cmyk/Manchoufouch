import type { Metadata } from "next";

import { PricingCards } from "@/components/pricing/pricing-cards";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, pricingOfferJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Crédits articles SEO Maroc | Backlinks & référencement Google",
  description:
    "Achetez des crédits articles SEO au Maroc : 5 à 500 DHS, 10 à 800 DHS, 20 à 1500 DHS. Backlinks, mots-clés SEO et référencement Google. WhatsApp +212 661 876 103.",
  path: "/pricing",
  keywords: [
    "crédits articles SEO Maroc",
    "backlinks Maroc",
    "tarif SEO Maroc",
    "acheter backlinks Maroc",
    "référencement Google Maroc",
    "agence SEO Casablanca",
  ],
});

export default function PricingPage() {
  return (
    <>
      <JsonLd
        data={[
          pricingOfferJsonLd(),
          breadcrumbJsonLd([
            { name: "Accueil", path: "/" },
            { name: "Crédits articles", path: "/pricing" },
          ]),
        ]}
      />
      <div className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Achetez des crédits pour publier
          </h1>
          <p className="mt-3 text-muted-foreground">
            1 crédit = 1 article SEO publié sur le site (optimisation,
            backlinks, méta). Commencez par créer un compte, puis choisissez
            votre pack.
          </p>
          <ol className="mt-6 grid gap-2 text-left text-sm text-muted-foreground sm:grid-cols-3 sm:text-center">
            <li className="rounded-lg border bg-muted/30 px-3 py-2">
              1. Créer un compte
            </li>
            <li className="rounded-lg border bg-muted/30 px-3 py-2">
              2. Acheter des crédits
            </li>
            <li className="rounded-lg border bg-muted/30 px-3 py-2">
              3. Créer un article
            </li>
          </ol>
        </div>
        <PricingCards />
      </div>
    </>
  );
}
