import { CircleMotionImage } from "@/components/home/circle-motion-image";
import { HOME_TESTIMONIALS } from "@/lib/data/home";

const MOTIONS = ["float", "breathe", "sway", "float-delayed"] as const;

export function HomeTestimonials() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20">
      <div className="mb-12 max-w-2xl space-y-3">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Nos clients sont heureux
        </h2>
        <p className="text-muted-foreground">
          La satisfaction client reste notre priorité absolue.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {HOME_TESTIMONIALS.map((item, index) => (
          <blockquote
            key={item.name}
            className="home-soft-card flex flex-col items-start gap-4 p-5"
          >
            <CircleMotionImage
              src={item.image}
              alt={item.name}
              size="sm"
              motion={MOTIONS[index % MOTIONS.length]}
            />
            <p className="text-sm leading-relaxed text-foreground/90">
              “{item.quote}”
            </p>
            <footer>
              <p className="font-semibold text-[var(--brand-navy)]">
                {item.name}
              </p>
              <p className="text-sm text-muted-foreground">{item.role}</p>
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
