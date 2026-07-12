import { CircleMotionImage } from "@/components/home/circle-motion-image";
import { HOME_RESULTS } from "@/lib/data/home";

export function HomeResults() {
  return (
    <section className="border-y bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-20">
        <div className="mb-12 grid items-center gap-10 lg:grid-cols-[1fr_auto]">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Attendez-vous à des résultats exceptionnels
            </h2>
            <p className="text-muted-foreground">
              Des chiffres concrets issus d&apos;accompagnements SEO réussis —
              avant et après optimisation.
            </p>
          </div>
          <div className="relative mx-auto flex h-40 w-56 items-center justify-center">
            <CircleMotionImage
              src="/home/seo-google.jpg"
              alt="Croissance SEO Google"
              size="md"
              motion="float"
              className="absolute left-0 z-10"
            />
            <CircleMotionImage
              src="/home/analytics-desk.jpg"
              alt="Résultats analytics"
              size="sm"
              motion="float-delayed"
              className="absolute right-0 top-2 z-20"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {HOME_RESULTS.map((result) => (
            <div key={result.label} className="space-y-4 border-t pt-6">
              <p className="text-sm text-muted-foreground">{result.label}</p>
              <div className="flex items-end gap-6">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Avant
                  </p>
                  <p className="text-2xl text-muted-foreground line-through decoration-1">
                    {result.before}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Après
                  </p>
                  <p className="text-4xl font-semibold tracking-tight">
                    {result.after}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
