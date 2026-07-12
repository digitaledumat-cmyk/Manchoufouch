import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CircleMotionImage } from "@/components/home/circle-motion-image";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HomeCta() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,oklch(0.97_0_0),oklch(0.93_0_0)_40%,oklch(0.98_0_0))]" />
      <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(oklch(0.7_0_0/0.15)_1px,transparent_1px)] [background-size:18px_18px]" />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-20 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col items-start gap-6">
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Propulsez votre visibilité et atteignez vos objectifs
          </h2>
          <p className="max-w-xl text-muted-foreground">
            Lancez un brief SEO ou comparez nos plans. C&apos;est rapide, clair et
            prêt pour Google — et compatible avec les moteurs IA.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/create-article"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Créer un brief
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/pricing"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Voir les tarifs
            </Link>
          </div>
        </div>

        <div className="relative mx-auto flex h-56 w-full max-w-sm items-center justify-center sm:h-64">
          <CircleMotionImage
            src="/home/analytics-desk.jpg"
            alt="Dashboard analytics"
            size="lg"
            motion="float"
            className="absolute left-2 top-0 z-10"
          />
          <CircleMotionImage
            src="/home/seo-google.jpg"
            alt="SEO Google"
            size="md"
            motion="sway"
            className="absolute bottom-0 right-4 z-20"
          />
        </div>
      </div>
    </section>
  );
}
