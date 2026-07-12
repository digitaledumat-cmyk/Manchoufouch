import { Badge } from "@/components/ui/badge";
import { MOROCCO_KEYWORD_CLUSTERS } from "@/lib/data/morocco-seo-keywords";

export function HomeKeywords() {
  return (
    <section id="mots-cles" className="border-y bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-20">
        <div className="mb-12 max-w-3xl space-y-3">
          <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            Mots-clés demandés au Maroc
          </p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            SEO, backlinks, référencement Google & Ads : ce que cherchent les
            Marocains
          </h2>
          <p className="text-muted-foreground">
            Clusters de mots-clés à fort volume d&apos;intention au Maroc —
            pour vos articles, campagnes Google Ads et stratégies de netlinking.
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-2">
          {MOROCCO_KEYWORD_CLUSTERS.map((cluster) => (
            <article key={cluster.title} className="space-y-4 border-t pt-6">
              <h3 className="text-xl font-medium">{cluster.title}</h3>
              <p className="text-sm text-muted-foreground">
                {cluster.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {cluster.keywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
