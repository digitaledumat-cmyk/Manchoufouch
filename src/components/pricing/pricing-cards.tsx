"use client";

import Link from "next/link";
import { Check, Coins, Sparkles } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CREDIT_PACKS, type CreditPack } from "@/lib/data/pricing";
import { getWhatsAppUrl } from "@/lib/seo/site";
import { cn } from "@/lib/utils";

function packWhatsAppMessage(pack: CreditPack) {
  return `Bonjour Manchoufouch, je souhaite acheter le ${pack.name} (${pack.articles} articles) à ${pack.priceLabel}. Merci de me confirmer le paiement.`;
}

export function PricingCards() {
  const { session, ready } = useAuth();

  return (
    <div className="space-y-6">
      {ready && session ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/40 px-4 py-3 text-sm">
          <p>
            Connecté en tant que <strong>{session.user.name}</strong>
          </p>
          <p className="inline-flex items-center gap-2 font-medium">
            <Coins className="size-4" />
            {session.credits} crédit{session.credits > 1 ? "s" : ""} article
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground">
          Étape 1 :{" "}
          <Link
            href="/auth/register"
            className="font-medium text-foreground underline underline-offset-4"
          >
            créez un compte
          </Link>{" "}
          — Étape 2 : contactez-nous sur WhatsApp pour acheter des crédits —
          Étape 3 : publiez vos articles SEO.
        </div>
      )}

      <div className="grid items-stretch gap-6 lg:grid-cols-3">
        {CREDIT_PACKS.map((pack) => (
          <Card
            key={pack.id}
            className={cn(
              "flex h-full flex-col overflow-visible border border-border bg-card shadow-none ring-0",
              pack.highlighted && "border-primary border-2",
            )}
          >
            <CardHeader className="gap-3">
              {pack.highlighted ? (
                <Badge className="w-fit gap-1">
                  <Sparkles className="size-3" />
                  Le plus populaire
                </Badge>
              ) : (
                <span className="h-6" aria-hidden />
              )}
              <CardTitle className="text-xl">{pack.name}</CardTitle>
              <CardDescription className="min-h-16">
                {pack.description}
              </CardDescription>
              <div className="pt-1">
                <span className="text-4xl font-semibold tracking-tight">
                  {pack.priceLabel}
                </span>
                <p className="mt-1 text-sm text-muted-foreground">
                  {pack.articles} articles · {pack.perArticleLabel}
                </p>
              </div>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-5">
              <Separator />
              <ul className="space-y-2.5">
                {pack.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="mt-auto">
              <a
                href={getWhatsAppUrl(packWhatsAppMessage(pack))}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({
                    variant: pack.highlighted ? "default" : "outline",
                  }),
                  "w-full whitespace-normal text-center",
                )}
              >
                Acheter {pack.articles} crédits via WhatsApp
              </a>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Link
          href="/dashboard/create-article"
          className={cn(buttonVariants({ variant: "link" }))}
        >
          J&apos;ai déjà des crédits — créer un article
        </Link>
      </div>
    </div>
  );
}
