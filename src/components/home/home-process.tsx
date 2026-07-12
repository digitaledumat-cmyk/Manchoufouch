import { CircleMotionImage } from "@/components/home/circle-motion-image";
import { HOME_PROCESS } from "@/lib/data/home";

const MOTIONS = ["float", "sway", "float-delayed", "breathe"] as const;

export function HomeProcess() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20">
      <div className="mb-12 max-w-2xl space-y-3">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Un processus optimisé pour des résultats concrets
        </h2>
        <p className="text-muted-foreground">
          Une méthode claire, de la première consultation à l&apos;optimisation
          continue.
        </p>
      </div>

      <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {HOME_PROCESS.map((item, index) => (
          <li key={item.step} className="flex flex-col items-start gap-4">
            <CircleMotionImage
              src={item.image}
              alt={item.title}
              size="sm"
              motion={MOTIONS[index % MOTIONS.length]}
            />
            <span className="text-sm font-medium text-muted-foreground">
              {item.step}
            </span>
            <h3 className="text-lg font-medium">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
