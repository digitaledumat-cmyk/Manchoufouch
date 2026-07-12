import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CircleMotionImage } from "@/components/home/circle-motion-image";
import { buttonVariants } from "@/components/ui/button";
import { SITE_CONFIG } from "@/lib/seo/site";
import { cn } from "@/lib/utils";

export function HomeHero() {
  return (
    <section className="relative isolate min-h-[calc(100vh-3.5rem)] overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(160deg,oklch(0.99_0_0),oklch(0.95_0_0)_45%,oklch(0.92_0_0))]" />
      <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(oklch(0.75_0_0/0.12)_1px,transparent_1px)] [background-size:22px_22px]" />
      <div className="absolute -right-24 top-10 size-[28rem] rounded-full bg-foreground/5 blur-3xl" />
      <div className="absolute -left-16 bottom-0 size-[22rem] rounded-full bg-foreground/5 blur-3xl" />

      <div className="relative mx-auto grid min-h-[calc(100vh-3.5rem)] w-full max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:py-20">
        <div className="animate-fade-up max-w-xl space-y-6">
          <p className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            {SITE_CONFIG.name}
          </p>
          <h1 className="text-2xl font-medium tracking-tight text-foreground/90 sm:text-3xl">
            Agence SEO Maroc : référencement Google, backlinks & Trafics organic
          </h1>
          <p className="max-w-md text-base text-muted-foreground sm:text-lg">
            Mots-clés SEO demandés au Maroc, netlinking et campagnes Ads pour
            ramener des clients — pas seulement du trafic.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/#audit-seo"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Lancer un audit de votre site web gratuitement
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/pricing"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Demander un devis
            </Link>
          </div>
        </div>

        <div className="relative mx-auto flex h-[320px] w-full max-w-md items-center justify-center sm:h-[400px] lg:max-w-none lg:h-[460px]">
          <CircleMotionImage
            src="/home/analytics-desk.jpg"
            alt="Bureau analytics Google et tableaux de bord SEO"
            size="xl"
            motion="float"
            priority
            className="absolute left-2 top-6 z-10 sm:left-6 sm:top-4"
          />
          <CircleMotionImage
            src="/home/seo-google.jpg"
            alt="Illustration Google SEO en croissance"
            size="lg"
            motion="float-delayed"
            priority
            className="absolute bottom-2 right-2 z-20 sm:bottom-6 sm:right-8"
          />
          <div className="absolute right-10 top-8 size-16 rounded-full border border-foreground/10 bg-background/60 animate-breathe sm:size-20" />
          <div className="absolute bottom-16 left-0 size-10 rounded-full border border-foreground/10 bg-foreground/5 animate-float-delayed sm:left-2" />
        </div>
      </div>
    </section>
  );
}
