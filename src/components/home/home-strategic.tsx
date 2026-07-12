import { CircleMotionImage } from "@/components/home/circle-motion-image";
import { HOME_STRATEGIC } from "@/lib/data/home";
import { cn } from "@/lib/utils";

const MOTIONS = ["float", "float-delayed", "sway"] as const;
const SECONDARY_MOTIONS = ["breathe", "sway", "float"] as const;

export function HomeStrategic() {
  return (
    <section id="strategie" className="border-y bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-20">
        <div className="mb-16 max-w-2xl space-y-3">
          <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            Strategic Thinking
          </p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Notre façon de penser la stratégie
          </h2>
          <p className="text-muted-foreground">
            Collaboration, solutions sur mesure et transparence : trois piliers
            pour des résultats SEO durables.
          </p>
        </div>

        <div className="space-y-20">
          {HOME_STRATEGIC.map((item, index) => {
            const reverse = index % 2 === 1;

            return (
              <article
                key={item.id}
                className={cn(
                  "grid items-center gap-10 md:grid-cols-2 md:gap-14",
                  reverse && "md:[&>*:first-child]:order-2",
                )}
              >
                <div className="relative mx-auto flex h-64 w-full max-w-md items-center justify-center sm:h-72">
                  <div className="absolute size-44 rounded-full border border-foreground/10 bg-foreground/5 animate-breathe sm:size-56" />
                  <CircleMotionImage
                    src={item.image}
                    alt={item.imageAlt}
                    size="lg"
                    motion={MOTIONS[index % MOTIONS.length]}
                    className="relative z-10"
                  />
                  <CircleMotionImage
                    src={item.secondaryImage}
                    alt={`${item.title} — illustration SEO complémentaire`}
                    size="sm"
                    motion={SECONDARY_MOTIONS[index % SECONDARY_MOTIONS.length]}
                    className={cn(
                      "absolute z-20",
                      reverse ? "left-2 bottom-2" : "right-2 bottom-2",
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                    {item.eyebrow}
                  </p>
                  <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    {item.title}
                  </h3>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    {item.text}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
