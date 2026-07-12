import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";

import { CircleMotionImage } from "@/components/home/circle-motion-image";
import { buttonVariants } from "@/components/ui/button";
import { HOME_INTRO, HOME_SERVICES } from "@/lib/data/home";
import { cn } from "@/lib/utils";

const MOTIONS = ["float", "float-delayed", "breathe", "sway"] as const;

export function HomeServices() {
  return (
    <section id="services" className="mx-auto w-full max-w-6xl px-4 py-20">
      <div className="mb-16 grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative mx-auto flex h-56 w-full max-w-sm items-center justify-center sm:h-64">
          <CircleMotionImage
            src="/home/analytics-desk.jpg"
            alt="Analytics SEO"
            size="lg"
            motion="float"
            className="absolute left-4 top-2 z-10"
          />
          <CircleMotionImage
            src="/home/seo-google.jpg"
            alt="Croissance Google SEO"
            size="md"
            motion="float-delayed"
            className="absolute bottom-0 right-6 z-20"
          />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {HOME_INTRO.title}
          </h2>
          <p className="text-muted-foreground">{HOME_INTRO.text}</p>
        </div>
      </div>

      <div className="mb-12 max-w-2xl space-y-3">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Nos services pour dominer Google
        </h2>
        <p className="text-muted-foreground">
          De la stratégie SEO au contenu multi-domaines, Manchoufouch couvre les
          leviers qui transforment votre site en moteur de croissance.
        </p>
      </div>

      <div className="space-y-20">
        {HOME_SERVICES.map((service, index) => {
          const reverse = index % 2 === 1;
          const motion = MOTIONS[index % MOTIONS.length];

          return (
            <article
              key={service.id}
              className={cn(
                "grid items-center gap-10 md:grid-cols-2 md:gap-14",
                reverse && "md:[&>*:first-child]:order-2",
              )}
            >
              <div className="relative mx-auto flex h-64 w-full max-w-md items-center justify-center sm:h-72">
                <div className="absolute size-40 rounded-full border border-foreground/10 bg-foreground/5 animate-breathe sm:size-52" />
                <CircleMotionImage
                  src={service.image}
                  alt={service.imageAlt}
                  size="lg"
                  motion={motion}
                  className="relative z-10"
                />
                <div
                  className={cn(
                    "absolute size-16 rounded-full border border-foreground/10 bg-background/80",
                    reverse ? "left-4 top-6 animate-sway" : "right-4 bottom-8 animate-float",
                  )}
                />
              </div>

              <div className="space-y-5">
                <h3 className="text-2xl font-semibold tracking-tight">
                  {service.title}
                </h3>
                <p className="text-muted-foreground">{service.description}</p>
                <ul className="space-y-2">
                  {service.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2 text-sm text-foreground/90"
                    >
                      <Check className="mt-0.5 size-4 shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
                <Link
                  href={service.href}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "inline-flex",
                  )}
                >
                  En savoir plus
                  <ArrowUpRight className="size-4" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
