import { CircleMotionImage } from "@/components/home/circle-motion-image";
import { HOME_DOMAINS } from "@/lib/data/home";

const MOTIONS = ["float", "float-delayed", "breathe", "sway"] as const;

export function HomeDomains() {
  return (
    <section className="border-y bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-20">
        <div className="mb-12 max-w-2xl space-y-3">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Des domaines métiers prêts pour le SEO
          </h2>
          <p className="text-muted-foreground">
            Immobilier, auto, électronique, beauty, maison… générez des briefs
            adaptés à chaque secteur.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4">
          {HOME_DOMAINS.map((domain, index) => (
            <div
              key={domain.label}
              className="flex flex-col items-center gap-3 text-center"
            >
              <CircleMotionImage
                src={domain.image}
                alt={domain.label}
                size="sm"
                motion={MOTIONS[index % MOTIONS.length]}
              />
              <p className="text-sm font-medium">{domain.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
