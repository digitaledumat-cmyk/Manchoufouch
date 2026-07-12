import { CircleMotionImage } from "@/components/home/circle-motion-image";
import { HOME_PILLARS } from "@/lib/data/home";

const MOTIONS = ["float", "breathe", "sway"] as const;

export function HomePillars() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20">
      <div className="mb-12 max-w-2xl space-y-3">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          3 piliers pour dominer les résultats Google
        </h2>
        <p className="text-muted-foreground">
          Contenu, mobile et expérience utilisateur : les fondations d&apos;une
          visibilité durable.
        </p>
      </div>

      <div className="grid gap-12 md:grid-cols-3">
        {HOME_PILLARS.map((pillar, index) => (
          <div key={pillar.title} className="flex flex-col items-start gap-4">
            <CircleMotionImage
              src={pillar.image}
              alt={pillar.title}
              size="md"
              motion={MOTIONS[index % MOTIONS.length]}
            />
            <h3 className="text-xl font-medium">{pillar.title}</h3>
            <p className="text-sm text-muted-foreground">{pillar.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
