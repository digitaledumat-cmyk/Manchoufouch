"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Gauge, Loader2, Search, Sparkles, XCircle } from "lucide-react";

import { CircleMotionImage } from "@/components/home/circle-motion-image";
import { ScoreRing } from "@/components/home/score-ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SeoCheck } from "@/lib/seo/run-page-audit";
import type { SeoAuditResult } from "@/lib/seo/simulate-audit";
import { cn } from "@/lib/utils";

const STATUS_STYLE = {
  good: "bg-emerald-500/15 text-emerald-700",
  average: "bg-amber-500/15 text-amber-700",
  poor: "bg-rose-500/15 text-rose-700",
} as const;

const STATUS_LABEL = {
  good: "Bon",
  average: "À améliorer",
  poor: "Faible",
} as const;

const IMPACT_VARIANT = {
  Élevé: "default",
  Moyen: "secondary",
  Faible: "outline",
} as const;

type AuditPayload = SeoAuditResult & {
  checks?: SeoCheck[];
  mode?: "live" | "pagespeed" | "simulation";
  note?: string;
  scoreSource?: "pagespeed" | "onpage";
};

export function HomeSeoAudit() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<AuditPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAnalyze(event: React.FormEvent) {
    event.preventDefault();
    const value = url.trim();

    if (!value) {
      setError("Saisissez une URL à analyser.");
      return;
    }

    setError(null);
    setWarning(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/seo/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: value }),
        });
        const data = (await response.json()) as {
          result?: AuditPayload;
          error?: string;
          warning?: string;
          provider?: string;
        };
        if (!response.ok || !data.result) {
          throw new Error(data.error || "L'audit SEO a échoué.");
        }
        setResult(data.result);
        if (data.warning) setWarning(data.warning);
      } catch (err) {
        setResult(null);
        setError(err instanceof Error ? err.message : "Audit impossible.");
      }
    });
  }

  return (
    <section id="audit-seo" className="mx-auto w-full max-w-6xl px-4 py-20">
      <div className="mb-10 grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Gauge className="size-4" />
            Audit SEO gratuit
          </p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Analyser votre site web
          </h2>
          <p className="max-w-xl text-muted-foreground">
            Obtenez un score /100 (Performance, Accessibilité, Bonnes
            pratiques, SEO), des contrôles on-page et les métriques Core Web
            Vitals — avec scores Google PageSpeed si une clé API est configurée.
          </p>
        </div>

        <div className="relative mx-auto flex h-48 w-full max-w-sm items-center justify-center">
          <CircleMotionImage
            src="/home/analytics-desk.jpg"
            alt="Analyse de performance web"
            size="md"
            motion="float"
            className="absolute left-4 top-2 z-10"
          />
          <CircleMotionImage
            src="/home/seo-google.jpg"
            alt="Score SEO Google"
            size="sm"
            motion="float-delayed"
            className="absolute right-2 bottom-0 z-20"
          />
        </div>
      </div>

      <div className="rounded-2xl border bg-background/80 p-5 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.35)] sm:p-8">
        <form
          onSubmit={handleAnalyze}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="flex-1 space-y-2">
            <Label htmlFor="audit-url">URL du site</Label>
            <Input
              id="audit-url"
              type="url"
              inputMode="url"
              placeholder="https://votresite.ma"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />
          </div>
          <Button type="submit" size="lg" disabled={isPending} className="sm:mb-0.5">
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Search className="size-4" />
            )}
            {isPending ? "Analyse en cours…" : "Lancer l'audit SEO"}
          </Button>
        </form>

        {error ? (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        {warning ? (
          <p className="mt-3 text-sm text-amber-700" role="status">
            {warning}
          </p>
        ) : null}

        {isPending ? (
          <div className="mt-8 flex items-center gap-3 rounded-xl border border-dashed bg-muted/40 px-4 py-6 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Lecture du HTML, balises SEO, structure et bonnes pratiques…
          </div>
        ) : null}

        {result && !isPending ? (
          <div className="mt-8 space-y-10 animate-fade-up">
            <div className="flex flex-col gap-6 border-b pb-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Résultat pour</p>
                <p className="break-all text-lg font-medium">{result.url}</p>
                <p className="text-xs text-muted-foreground">
                  Analysé le{" "}
                  {new Date(result.analyzedAt).toLocaleString("fr-FR")}
                  {result.mode === "pagespeed"
                    ? " · scores Google PageSpeed"
                    : result.mode === "live"
                      ? " · analyse on-page"
                      : " · estimation"}
                </p>
              </div>
              <ScoreRing
                score={result.overall}
                label="Score global"
                size="lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {result.categories.map((category) => (
                <ScoreRing
                  key={category.id}
                  score={category.score}
                  label={category.label}
                />
              ))}
            </div>

            {result.checks && result.checks.length > 0 ? (
              <div>
                <h3 className="mb-4 text-lg font-medium">Contrôles SEO on-page</h3>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {result.checks.map((check) => (
                    <li
                      key={check.id}
                      className="flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm"
                    >
                      {check.passed ? (
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                      ) : (
                        <XCircle className="mt-0.5 size-4 shrink-0 text-rose-600" />
                      )}
                      <div>
                        <p className="font-medium">{check.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {check.detail}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div>
              <h3 className="mb-4 text-lg font-medium">
                {result.mode === "pagespeed"
                  ? "Métriques Google PageSpeed"
                  : "Métriques type speed test"}
              </h3>
              {result.mode !== "pagespeed" ? (
                <p className="mb-3 text-xs text-muted-foreground">
                  * Valeurs estimées. Pour des scores Google officiels, ajoutez
                  une clé PageSpeed (PAGESPEED_API_KEY) gratuite.
                </p>
              ) : (
                <p className="mb-3 text-xs text-muted-foreground">
                  Scores Lighthouse mobile officiels (Performance,
                  Accessibilité, Bonnes pratiques, SEO).
                </p>
              )}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {result.metrics.map((metric) => (
                  <div
                    key={metric.id}
                    className="flex items-start justify-between gap-3 rounded-xl border px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{metric.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {metric.hint}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold tabular-nums">
                        {metric.value}
                        {metric.unit ? (
                          <span className="ml-0.5 text-xs font-normal text-muted-foreground">
                            {metric.unit}
                          </span>
                        ) : null}
                      </p>
                      <span
                        className={cn(
                          "mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
                          STATUS_STYLE[metric.status],
                        )}
                      >
                        {STATUS_LABEL[metric.status]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="size-4" />
                <h3 className="text-lg font-medium">
                  Opportunités d&apos;optimisation
                </h3>
              </div>
              <ul className="space-y-3">
                {result.opportunities.map((item) => (
                  <li
                    key={item.title}
                    className="rounded-xl border px-4 py-3 sm:flex sm:items-start sm:justify-between sm:gap-4"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <Badge
                      variant={IMPACT_VARIANT[item.impact]}
                      className="mt-2 shrink-0 sm:mt-0"
                    >
                      Impact {item.impact}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
