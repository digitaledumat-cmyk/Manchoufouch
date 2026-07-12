import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { CircleMotionImage } from "@/components/home/circle-motion-image";
import { buttonVariants } from "@/components/ui/button";
import { HOME_NEWS } from "@/lib/data/home";
import { cn } from "@/lib/utils";

const MOTIONS = ["float", "float-delayed", "sway"] as const;

export function HomeNews() {
  return (
    <section className="border-y bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-20">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Dernières actualités SEO
            </h2>
            <p className="text-muted-foreground">
              Conseils, métriques et stratégies pour rester visible sur Google.
            </p>
          </div>
          <Link
            href="/dashboard/articles"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Voir tout
            <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          {HOME_NEWS.map((item, index) => (
            <article key={item.title} className="flex flex-col items-start gap-4">
              <CircleMotionImage
                src={item.image}
                alt={item.title}
                size="md"
                motion={MOTIONS[index % MOTIONS.length]}
              />
              <p className="text-xs text-muted-foreground">{item.date}</p>
              <h3 className="text-lg font-medium leading-snug">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.excerpt}</p>
              <Link
                href={item.href}
                className="text-sm font-medium underline-offset-4 hover:underline"
              >
                Lire la suite
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
