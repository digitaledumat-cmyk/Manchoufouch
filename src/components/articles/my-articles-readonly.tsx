"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2, Lock } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ClientArticle } from "@/lib/auth/types";

const STATUS_LABEL: Record<ClientArticle["status"], string> = {
  pending: "En attente",
  approved: "Publié",
  rejected: "Refusé",
  needs_correction: "À corriger",
};

export function MyArticlesReadonly() {
  const { session, ready } = useAuth();
  const [articles, setArticles] = useState<ClientArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !session) {
      setLoading(false);
      return;
    }
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/articles", {
          credentials: "include",
        });
        const data = (await response.json()) as {
          articles?: ClientArticle[];
          error?: string;
        };
        if (!response.ok) {
          throw new Error(data.error || "Chargement impossible.");
        }
        setArticles(data.articles || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de chargement.");
      } finally {
        setLoading(false);
      }
    })();
  }, [ready, session]);

  if (!ready || !session) return null;

  const published = articles.filter(
    (article) => article.status === "approved" && article.publicPath,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Mes articles publiés
          <Lock className="size-4 text-muted-foreground" />
        </CardTitle>
        <CardDescription>
          Liens publics en lecture seule — non modifiables de votre côté.
          L&apos;admin gère la validation et les corrections.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Chargement…
          </p>
        ) : null}
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        {!loading && !error && published.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun article publié pour le moment. Créez un article SEO, puis
            attendez la validation admin.
          </p>
        ) : null}
        {published.map((article) => (
          <div
            key={article.id}
            className="flex flex-wrap items-start justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-3"
          >
            <div className="min-w-0 space-y-1">
              <p className="font-medium">{article.title}</p>
              <p className="break-all font-mono text-xs text-muted-foreground">
                {article.publicPath}
              </p>
              <Badge variant="secondary">
                {STATUS_LABEL[article.status]} · lecture seule
              </Badge>
            </div>
            {article.publicPath ? (
              <a
                href={article.publicPath}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4"
              >
                Ouvrir
                <ExternalLink className="size-3.5" />
              </a>
            ) : null}
          </div>
        ))}

        {!loading && articles.some((a) => a.status !== "approved") ? (
          <div className="space-y-2 border-t pt-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Autres soumissions
            </p>
            {articles
              .filter((article) => article.status !== "approved")
              .map((article) => (
                <div
                  key={article.id}
                  className="flex flex-wrap items-center justify-between gap-2 text-sm"
                >
                  <span className="text-muted-foreground">{article.title}</span>
                  <Badge variant="outline">
                    {STATUS_LABEL[article.status]}
                  </Badge>
                </div>
              ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
