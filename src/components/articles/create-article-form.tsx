"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  Bot,
  Coins,
  Loader2,
  Lock,
  Sparkles,
  Wand2,
} from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  ARTICLE_MODELS,
  getArticleModelLabel,
  type ArticleModelId,
} from "@/lib/ai/simulate-article";
import { type SeoBrief } from "@/lib/ai/simulate-seo";
import { stripMarkdownHashes } from "@/lib/ai/strip-markdown-hashes";
import { createClientArticle } from "@/lib/auth/storage";
import { DOMAINS } from "@/lib/data/domains";
import { cn } from "@/lib/utils";

export function CreateArticleForm() {
  const { session, ready, useCredit } = useAuth();
  const [domain, setDomain] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [articleModel, setArticleModel] = useState<ArticleModelId | null>(
    "referencement",
  );
  const [articleBody, setArticleBody] = useState("");
  const [brief, setBrief] = useState<SeoBrief | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isGeneratingArticle, startArticleTransition] = useTransition();
  const [isPublishing, setIsPublishing] = useState(false);

  if (!ready) {
    return (
      <div className="rounded-xl border px-4 py-8 text-center text-sm text-muted-foreground">
        Chargement de votre compte…
      </div>
    );
  }

  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="size-5" />
            Compte requis
          </CardTitle>
          <CardDescription>
            Pour créer un article SEO, commencez par créer un compte, puis
            achetez des crédits.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/auth/register" className={cn(buttonVariants())}>
            Créer un compte
          </Link>
          <Link
            href="/auth/login?next=/dashboard/create-article"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Se connecter
          </Link>
          <Link
            href="/pricing"
            className={cn(buttonVariants({ variant: "ghost" }))}
          >
            Voir les packs (500 / 800 / 1500 DHS)
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (session.credits < 1) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="size-5" />
            Crédits insuffisants
          </CardTitle>
          <CardDescription>
            Bonjour {session.user.name}. Il vous faut au moins 1 crédit pour
            publier un article sur le site.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Packs disponibles : <strong>5 articles = 500 DHS</strong>,{" "}
            <strong>10 articles = 800 DHS</strong>,{" "}
            <strong>20 articles = 1 500 DHS</strong>.
          </p>
          <Link href="/pricing" className={cn(buttonVariants())}>
            Acheter des crédits
          </Link>
        </CardContent>
      </Card>
    );
  }

  function handleGenerateBrief() {
    if (!domain) {
      setError("Sélectionnez un domaine avant de générer le brief SEO.");
      return;
    }

    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/ai/generate-brief", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domainId: domain, url: targetUrl || undefined }),
        });
        const data = (await response.json()) as {
          brief?: SeoBrief;
          provider?: string;
          error?: string;
        };
        if (!response.ok || !data.brief) {
          throw new Error(data.error || "La génération du brief a échoué.");
        }
        setBrief(data.brief);
        if (!title) setTitle(data.brief.headings.h1);
        setSuccess(
          data.provider === "gemini"
            ? "Brief SEO généré avec Gemini (gratuit)."
            : data.provider === "openai"
              ? "Brief SEO généré avec OpenAI."
              : "Brief SEO en mode simulation. Ajoutez GEMINI_API_KEY (gratuit) dans .env.local.",
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "La génération IA a échoué.");
      }
    });
  }

  function handleGenerateArticleByAi() {
    if (!targetUrl.trim()) {
      setError("Indiquez le lien du site web pour générer l'article par IA.");
      return;
    }
    if (!articleModel) {
      setError("Choisissez un modèle d'article.");
      return;
    }

    setError(null);
    setSuccess(null);
    startArticleTransition(async () => {
      try {
        const domainLabel = DOMAINS.find((item) => item.id === domain)?.label;
        const response = await fetch("/api/ai/generate-article", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: targetUrl,
            model: articleModel,
            domainLabel,
          }),
        });
        const data = (await response.json()) as {
          article?: {
            title: string;
            body: string;
            metaDescription: string;
            sourceUrl: string;
            generatedAt: string;
          };
          provider?: string;
          error?: string;
        };
        if (!response.ok || !data.article) {
          throw new Error(data.error || "La génération d'article a échoué.");
        }

        const generated = data.article;
        setArticleBody(stripMarkdownHashes(generated.body));
        setTitle(stripMarkdownHashes(generated.title));
        setBrief((prev) =>
          prev
            ? { ...prev, metaDescription: generated.metaDescription }
            : {
                domain: (domain as SeoBrief["domain"]) || "tech",
                keywords: [
                  "SEO Maroc",
                  "référencement Google",
                  getArticleModelLabel(articleModel),
                ],
                headings: {
                  h1: generated.title,
                  h2: [
                    "Pourquoi nous choisir",
                    "Nos avantages",
                    "Passer à l'action",
                  ],
                  h3: ["Preuves", "FAQ", "Contact"],
                },
                metaDescription: generated.metaDescription,
                generatedAt: generated.generatedAt,
              },
        );
        setSuccess(
          data.provider === "gemini"
            ? `Article généré avec Gemini à partir du contenu réel du site (${getArticleModelLabel(articleModel)}).`
            : data.provider === "openai"
              ? `Article généré avec OpenAI à partir du site (${getArticleModelLabel(articleModel)}).`
              : `Article en simulation (${getArticleModelLabel(articleModel)}). Ajoutez GEMINI_API_KEY (gratuit).`,
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Génération d'article impossible.",
        );
      }
    });
  }

  async function handlePublish() {
    if ((!brief && !articleBody.trim()) || !title.trim() || !session) {
      setError("Générez un article/brief et renseignez un titre avant de publier.");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsPublishing(true);
    try {
      const next = await useCredit();
      createClientArticle({
        userId: session.user.id,
        userName: session.user.name,
        userEmail: session.user.email,
        title: stripMarkdownHashes(title.trim()),
        domain: domain ?? articleModel ?? "referencement",
        targetUrl,
        backlinks: "",
        metaDescription:
          brief?.metaDescription ||
          articleBody.slice(0, 155).replace(/\n/g, " "),
        keywords: brief?.keywords ?? ["SEO Maroc", "référencement Google"],
        h1: stripMarkdownHashes(brief?.headings.h1 || title.trim()),
        content: stripMarkdownHashes(
          articleBody.trim() ||
            [
              `H1: ${brief?.headings.h1}`,
              `H2: ${brief?.headings.h2.join(" | ")}`,
              `H3: ${brief?.headings.h3.join(" | ")}`,
              brief?.metaDescription,
            ].join("\n"),
        ),
      });
      setSuccess(
        `Article « ${title} » soumis pour validation admin. Après validation : indexation Google automatique. 1 crédit utilisé (${next.credits} restant(s)).`,
      );
      setBrief(null);
      setArticleBody("");
      setTitle("");
      setTargetUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publication impossible.");
    } finally {
      setIsPublishing(false);
    }
  }

  const selectedModel = ARTICLE_MODELS.find((item) => item.id === articleModel);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/40 px-4 py-3 text-sm">
        <p>
          Connecté : <strong>{session.user.name}</strong>
        </p>
        <p className="inline-flex items-center gap-2 font-medium">
          <Coins className="size-4" />
          {session.credits} crédit{session.credits > 1 ? "s" : ""} restant
          {session.credits > 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Créer un article SEO</CardTitle>
            <CardDescription>
              Lien du site + modèle IA pour générer le texte. Publier consomme{" "}
              <strong>1 crédit</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="domain">Domaine</Label>
              <Select
                value={domain}
                onValueChange={(value) => {
                  setDomain(value);
                  setBrief(null);
                  setError(null);
                }}
              >
                <SelectTrigger id="domain" className="w-full">
                  <SelectValue placeholder="Sélectionner un domaine" />
                </SelectTrigger>
                <SelectContent>
                  {DOMAINS.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Titre de l&apos;article</Label>
              <Input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ex. Guide SEO pour produits digitaux"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetUrl">Lien du site web</Label>
              <Input
                id="targetUrl"
                type="url"
                value={targetUrl}
                onChange={(event) => setTargetUrl(event.target.value)}
                placeholder="https://votresite.ma"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="article-model">Modèle d&apos;article IA</Label>
              <Select
                value={articleModel}
                onValueChange={(value) =>
                  setArticleModel((value as ArticleModelId) ?? null)
                }
              >
                <SelectTrigger id="article-model" className="w-full">
                  <SelectValue placeholder="Choisir un modèle" />
                </SelectTrigger>
                <SelectContent>
                  {ARTICLE_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedModel ? (
                <p className="text-xs text-muted-foreground">
                  {selectedModel.description}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor="article-body">Texte de l&apos;article</Label>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleGenerateArticleByAi}
                  disabled={isGeneratingArticle}
                >
                  {isGeneratingArticle ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Bot className="size-4" />
                  )}
                  {isGeneratingArticle
                    ? "Génération…"
                    : "Créer l'article par IA"}
                </Button>
              </div>
              <Textarea
                id="article-body"
                value={articleBody}
                onChange={(event) =>
                  setArticleBody(stripMarkdownHashes(event.target.value))
                }
                rows={12}
                placeholder="Le texte généré par IA apparaîtra ici (sans #). Vous pourrez le modifier avant publication."
              />
            </div>

            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="text-sm text-emerald-700" role="status">
                {success}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleGenerateBrief}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Wand2 className="size-4" />
                )}
                {isPending ? "Génération…" : "Générer brief SEO"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={(!brief && !articleBody.trim()) || isPublishing}
                onClick={handlePublish}
              >
                {isPublishing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                Publier (−1 crédit)
              </Button>
              <Link
                href="/pricing"
                className={cn(buttonVariants({ variant: "ghost" }))}
              >
                Recharger des crédits
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <CardTitle className="text-lg">Brief SEO + aperçu</CardTitle>
            </div>
            <CardDescription>
              Mots-clés, Hn, méta-description et modèle IA sélectionné.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {articleModel ? (
              <p className="mb-4 text-sm">
                Modèle actif :{" "}
                <Badge variant="secondary">
                  {getArticleModelLabel(articleModel)}
                </Badge>
              </p>
            ) : null}

            {!brief && !isPending ? (
              <div className="rounded-lg border border-dashed bg-muted/40 p-6 text-sm text-muted-foreground">
                Générez un brief SEO ou créez l&apos;article par IA à partir du
                lien du site.
              </div>
            ) : null}

            {isPending || isGeneratingArticle ? (
              <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-6 text-sm">
                <Loader2 className="size-4 animate-spin" />
                {isGeneratingArticle
                  ? "L'IA rédige l'article selon le lien et le modèle…"
                  : "Génération du brief…"}
              </div>
            ) : null}

            {brief ? (
              <div className="space-y-5">
                <section className="space-y-2">
                  <h3 className="text-sm font-medium">Mots-clés cibles</h3>
                  <div className="flex flex-wrap gap-2">
                    {brief.keywords.map((keyword) => (
                      <Badge key={keyword} variant="secondary">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </section>

                <Separator />

                <section className="space-y-3">
                  <h3 className="text-sm font-medium">Structure Hn</h3>
                  <div className="space-y-2 rounded-lg border bg-muted/30 p-3 text-sm">
                    <p>
                      <span className="font-semibold">H1 — </span>
                      {brief.headings.h1}
                    </p>
                    <div>
                      <p className="mb-1 font-semibold">H2</p>
                      <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                        {brief.headings.h2.map((heading) => (
                          <li key={heading}>{heading}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>

                <Separator />

                <section className="space-y-2">
                  <h3 className="text-sm font-medium">Méta-description</h3>
                  <Textarea
                    readOnly
                    value={brief.metaDescription}
                    rows={4}
                    className="resize-none bg-muted/30"
                  />
                </section>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
