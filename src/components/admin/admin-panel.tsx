"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Ban,
  Check,
  Coins,
  KeyRound,
  Loader2,
  Pencil,
  RefreshCw,
  Shield,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  XCircle,
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
import { Textarea } from "@/components/ui/textarea";
import type {
  AdminDashboardStats,
  ClientArticle,
  ClientArticleStatus,
  ClientPublicUser,
} from "@/lib/auth/types";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<ClientArticleStatus, string> = {
  pending: "En attente",
  approved: "Validé",
  rejected: "Refusé",
  needs_correction: "À corriger",
};

function formatDate(value: string | null) {
  if (!value) return "Jamais";
  return new Date(value).toLocaleString("fr-FR");
}

async function parseJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Requête impossible.",
    );
  }
  return data;
}

export function AdminPanel() {
  const { session, ready } = useAuth();
  const [clients, setClients] = useState<ClientPublicUser[]>([]);
  const [articles, setArticles] = useState<ClientArticle[]>([]);
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [creditDrafts, setCreditDrafts] = useState<Record<string, string>>({});
  const [passwordDrafts, setPasswordDrafts] = useState<Record<string, string>>(
    {},
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    metaDescription: "",
    content: "",
    backlinks: "",
    adminNote: "",
  });
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    credits: "0",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [clientsRes, articlesRes] = await Promise.all([
        fetch("/api/admin/clients", { credentials: "include" }),
        fetch("/api/admin/articles", { credentials: "include" }),
      ]);
      const clientsData = await parseJson<{
        clients: ClientPublicUser[];
        stats: AdminDashboardStats;
      }>(clientsRes);
      const articlesData = await parseJson<{
        articles: ClientArticle[];
        stats: AdminDashboardStats;
      }>(articlesRes);

      setClients(clientsData.clients);
      setStats(articlesData.stats ?? clientsData.stats);
      setCreditDrafts(
        Object.fromEntries(
          clientsData.clients.map((client) => [
            client.id,
            String(client.credits),
          ]),
        ),
      );
      setArticles(articlesData.articles);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ready && session?.user.role === "admin") {
      void refresh();
    }
  }, [ready, session, refresh]);

  const pendingArticles = useMemo(
    () => articles.filter((article) => article.status === "pending"),
    [articles],
  );

  const filteredArticles = useMemo(() => {
    if (statusFilter === "all") return articles;
    return articles.filter((article) => article.status === statusFilter);
  }, [articles, statusFilter]);

  if (!ready) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Chargement…
      </div>
    );
  }

  if (!session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-5" />
            Accès admin
          </CardTitle>
          <CardDescription>
            Connectez-vous avec le compte administrateur.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            Connectez-vous avec votre compte administrateur pour accéder au
            panel.
          </p>
          <Link
            href="/auth/login?next=/admin"
            className={cn(buttonVariants())}
          >
            Se connecter
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (session.user.role !== "admin") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Accès refusé</CardTitle>
          <CardDescription>
            Ce panel est réservé à l&apos;administrateur Manchoufouch.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  async function handleCreateClient(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setCreating(true);
    try {
      const response = await fetch("/api/admin/clients", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createForm.name,
          email: createForm.email,
          password: createForm.password,
          credits: Number(createForm.credits) || 0,
        }),
      });
      const data = await parseJson<{
        message?: string;
        clients: ClientPublicUser[];
        stats: AdminDashboardStats;
      }>(response);
      setClients(data.clients);
      setStats(data.stats);
      setCreditDrafts(
        Object.fromEntries(
          data.clients.map((client) => [client.id, String(client.credits)]),
        ),
      );
      setCreateForm({ name: "", email: "", password: "", credits: "0" });
      setMessage(data.message || "Compte client créé.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Création impossible.");
    } finally {
      setCreating(false);
    }
  }

  async function handleSetCredits(userId: string) {
    setError(null);
    setMessage(null);
    const value = Number(creditDrafts[userId] ?? 0);
    if (Number.isNaN(value) || value < 0) {
      setError("Nombre de crédits invalide.");
      return;
    }
    try {
      const response = await fetch(`/api/admin/clients/${userId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credits: value }),
      });
      const data = await parseJson<{
        clients: ClientPublicUser[];
        stats: AdminDashboardStats;
      }>(response);
      setClients(data.clients);
      setStats(data.stats);
      setMessage("Crédits mis à jour.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mise à jour impossible.");
    }
  }

  async function handleAddCredits(userId: string, amount: number) {
    setError(null);
    try {
      const response = await fetch(`/api/admin/clients/${userId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addCredits: amount }),
      });
      const data = await parseJson<{
        clients: ClientPublicUser[];
        stats: AdminDashboardStats;
      }>(response);
      setClients(data.clients);
      setStats(data.stats);
      setCreditDrafts(
        Object.fromEntries(
          data.clients.map((client) => [client.id, String(client.credits)]),
        ),
      );
      setMessage(`+${amount} crédits ajoutés.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mise à jour impossible.");
    }
  }

  async function handleResetPassword(userId: string) {
    setError(null);
    setMessage(null);
    const nextPassword = passwordDrafts[userId]?.trim();
    if (!nextPassword) {
      setError("Saisissez un nouveau mot de passe.");
      return;
    }
    try {
      await parseJson(
        await fetch(`/api/admin/clients/${userId}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: nextPassword }),
        }),
      );
      setPasswordDrafts((prev) => ({ ...prev, [userId]: "" }));
      setMessage(`Mot de passe réinitialisé : ${nextPassword}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Réinitialisation impossible.",
      );
    }
  }

  async function handleToggleBlock(client: ClientPublicUser) {
    const next = !client.blocked;
    if (
      !window.confirm(
        next
          ? `Bloquer le compte de ${client.name} ?`
          : `Débloquer le compte de ${client.name} ?`,
      )
    ) {
      return;
    }
    try {
      const response = await fetch(`/api/admin/clients/${client.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked: next }),
      });
      const data = await parseJson<{
        clients: ClientPublicUser[];
        stats: AdminDashboardStats;
      }>(response);
      setClients(data.clients);
      setStats(data.stats);
      setMessage(next ? "Compte bloqué." : "Compte débloqué.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action impossible.");
    }
  }

  async function handleDeleteClient(userId: string) {
    if (!window.confirm("Supprimer ce client et ses articles ?")) return;
    try {
      const response = await fetch(`/api/admin/clients/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await parseJson<{
        clients: ClientPublicUser[];
        stats: AdminDashboardStats;
      }>(response);
      setClients(data.clients);
      setStats(data.stats);
      setMessage("Client supprimé.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible.");
    }
  }

  function startEdit(article: ClientArticle) {
    setEditingId(article.id);
    setEditForm({
      title: article.title,
      metaDescription: article.metaDescription,
      content: article.content,
      backlinks: article.backlinks,
      adminNote: article.adminNote,
    });
  }

  async function saveCorrection() {
    if (!editingId) return;
    try {
      const response = await fetch(`/api/admin/articles/${editingId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title,
          metaDescription: editForm.metaDescription,
          content: editForm.content,
          backlinks: editForm.backlinks,
          adminNote: editForm.adminNote,
          status: "needs_correction",
        }),
      });
      const data = await parseJson<{
        articles: ClientArticle[];
        stats: AdminDashboardStats;
      }>(response);
      setArticles(data.articles);
      setStats(data.stats);
      setEditingId(null);
      setMessage("Article corrigé et marqué « à corriger ».");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible.");
    }
  }

  async function setArticleStatus(id: string, status: ClientArticleStatus) {
    try {
      const response = await fetch(`/api/admin/articles/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await parseJson<{
        article: ClientArticle;
        articles: ClientArticle[];
        stats: AdminDashboardStats;
      }>(response);
      setArticles(data.articles);
      setStats(data.stats);

      if (status === "approved") {
        try {
          const publishRes = await fetch("/api/seo/publish", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "publish",
              article: {
                id: data.article.id,
                title: data.article.title,
                domain: data.article.domain,
                metaDescription: data.article.metaDescription,
                keywords: data.article.keywords,
                h1: data.article.h1,
                content: data.article.content,
                userName: data.article.userName,
                targetUrl: data.article.targetUrl,
              },
            }),
          });
          const publishData = (await publishRes.json()) as {
            publicPath?: string;
            error?: string;
          };
          if (!publishRes.ok) {
            throw new Error(publishData.error || "Indexation échouée.");
          }
          await refresh();
          setMessage(
            `Page publique créée${
              publishData.publicPath
                ? ` : ${publishData.publicPath} (lien unique, pas de doublon)`
                : ""
            }. Indexation Google lancée.`,
          );
        } catch (err) {
          setMessage(
            `Article validé, mais page / indexation : ${
              err instanceof Error ? err.message : "erreur"
            }.`,
          );
        }
        return;
      }

      if (status === "rejected") {
        void fetch("/api/seo/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "unpublish", id }),
        });
      }

      setMessage(`Statut mis à jour : ${STATUS_LABEL[status]}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mise à jour impossible.");
    }
  }

  async function handleDeleteArticle(id: string) {
    if (!window.confirm("Supprimer définitivement cet article ?")) return;
    try {
      const response = await fetch(`/api/admin/articles/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await parseJson<{
        articles: ClientArticle[];
        stats: AdminDashboardStats;
      }>(response);
      setArticles(data.articles);
      setStats(data.stats);
      void fetch("/api/seo/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unpublish", id }),
      });
      if (editingId === id) setEditingId(null);
      setMessage("Article supprimé.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible.");
    }
  }

  const scoreCards = [
    {
      label: "Clients",
      value: stats?.totalClients ?? clients.length,
      icon: Users,
    },
    {
      label: "Nouveaux (7j)",
      value: stats?.newUsers ?? 0,
      icon: UserPlus,
    },
    {
      label: "Actifs (30j)",
      value: stats?.activeUsers ?? 0,
      icon: UserCheck,
    },
    {
      label: "Avec crédits",
      value: stats?.withCredits ?? 0,
      icon: Coins,
    },
    {
      label: "Connexions totales",
      value: stats?.totalLogins ?? 0,
      icon: Shield,
    },
    {
      label: "Articles en attente",
      value: stats?.pendingArticles ?? pendingArticles.length,
      icon: Pencil,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/40 px-4 py-3 text-sm">
        <p>
          Connecté en admin : <strong>{session.user.name}</strong> (
          {session.user.email})
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => void refresh()}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          Actualiser
        </Button>
      </div>

      {message ? (
        <p
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          role="status"
        >
          {message}
        </p>
      ) : null}
      {error ? (
        <p
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scoreCards.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border bg-card p-4 shadow-none"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <item.icon className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {item.value}
            </p>
          </div>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="size-5" />
            Créer un compte client
          </CardTitle>
          <CardDescription>
            Le compte apparaît immédiatement dans la liste ci-dessous.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleCreateClient}
            className="grid gap-4 md:grid-cols-2"
          >
            <div className="space-y-2">
              <Label htmlFor="create-name">Nom</Label>
              <Input
                id="create-name"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-email">E-mail</Label>
              <Input
                id="create-email"
                type="email"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-password">Mot de passe</Label>
              <Input
                id="create-password"
                type="text"
                minLength={6}
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-credits">Crédits initiaux</Label>
              <Input
                id="create-credits"
                type="number"
                min={0}
                value={createForm.credits}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    credits: e.target.value,
                  }))
                }
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={creating}>
                {creating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <UserPlus className="size-4" />
                )}
                Créer le compte
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Articles postés en attente</CardTitle>
          <CardDescription>
            Soumissions clients à valider, corriger ou supprimer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingArticles.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun article en attente pour le moment.
            </p>
          ) : (
            pendingArticles.map((article) => (
              <div key={article.id} className="space-y-3 rounded-xl border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{article.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {article.userName} · {article.userEmail} · {article.domain}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Soumis le {formatDate(article.createdAt)}
                    </p>
                  </div>
                  <Badge>En attente</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {article.metaDescription || article.content}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setArticleStatus(article.id, "approved")}
                  >
                    <Check className="size-4" />
                    Valider
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => startEdit(article)}
                  >
                    <Pencil className="size-4" />
                    Corriger
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setArticleStatus(article.id, "rejected")}
                  >
                    <XCircle className="size-4" />
                    Refuser
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteArticle(article.id)}
                  >
                    <Trash2 className="size-4" />
                    Supprimer
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Comptes clients ({clients.length})
          </CardTitle>
          <CardDescription>
            Tous les comptes inscrits (partagés serveur — visibles ici dès
            création).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {clients.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun client inscrit pour le moment. Créez un compte ci-dessus ou
              demandez au client de s&apos;inscrire sur /auth/register.
            </p>
          ) : (
            clients.map((client) => (
              <div
                key={client.id}
                className="space-y-4 rounded-xl border p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-muted-foreground">{client.email}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Inscrit le {formatDate(client.createdAt)} ·{" "}
                      {client.loginCount} connexion
                      {client.loginCount > 1 ? "s" : ""} · Dernière :{" "}
                      {formatDate(client.lastLoginAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={client.blocked ? "destructive" : "secondary"}>
                      {client.blocked ? "Bloqué" : "Actif"}
                    </Badge>
                    <Badge variant="outline">
                      {client.credits} crédit{client.credits > 1 ? "s" : ""}
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`credits-${client.id}`}>Crédits</Label>
                    <div className="flex gap-2">
                      <Input
                        id={`credits-${client.id}`}
                        type="number"
                        min={0}
                        value={creditDrafts[client.id] ?? "0"}
                        onChange={(event) =>
                          setCreditDrafts((prev) => ({
                            ...prev,
                            [client.id]: event.target.value,
                          }))
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleSetCredits(client.id)}
                      >
                        Sauver
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[5, 10, 20].map((amount) => (
                        <Button
                          key={amount}
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => handleAddCredits(client.id, amount)}
                        >
                          <Coins className="size-3.5" />+{amount}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`password-${client.id}`}>
                      Réinitialiser mot de passe
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id={`password-${client.id}`}
                        type="text"
                        placeholder="Nouveau mot de passe"
                        value={passwordDrafts[client.id] ?? ""}
                        onChange={(event) =>
                          setPasswordDrafts((prev) => ({
                            ...prev,
                            [client.id]: event.target.value,
                          }))
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleResetPassword(client.id)}
                      >
                        <KeyRound className="size-4" />
                        Reset
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={client.blocked ? "secondary" : "outline"}
                    onClick={() => handleToggleBlock(client)}
                  >
                    <Ban className="size-4" />
                    {client.blocked ? "Débloquer" : "Bloquer"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteClient(client.id)}
                  >
                    <Trash2 className="size-4" />
                    Supprimer
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle>Tous les articles</CardTitle>
            <CardDescription>
              Filtrez et gérez l&apos;ensemble des soumissions.
            </CardDescription>
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value ?? "pending")}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="approved">Validés</SelectItem>
              <SelectItem value="needs_correction">À corriger</SelectItem>
              <SelectItem value="rejected">Refusés</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredArticles.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun article dans ce filtre.
            </p>
          ) : (
            filteredArticles.map((article) => (
              <div key={article.id} className="space-y-3 rounded-xl border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{article.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {article.userName} · {article.userEmail} · {article.domain}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Soumis le {formatDate(article.createdAt)}
                    </p>
                    {article.publicPath ? (
                      <p className="mt-2 text-sm">
                        Page :{" "}
                        <a
                          href={article.publicPath}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium underline underline-offset-4"
                        >
                          {article.publicPath}
                        </a>
                      </p>
                    ) : null}
                  </div>
                  <Badge variant="secondary">
                    {STATUS_LABEL[article.status]}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {article.metaDescription || article.content}
                </p>

                {editingId === article.id ? (
                  <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
                    <div className="space-y-2">
                      <Label>Titre</Label>
                      <Input
                        value={editForm.title}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Méta-description</Label>
                      <Textarea
                        rows={3}
                        value={editForm.metaDescription}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            metaDescription: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Contenu / brief</Label>
                      <Textarea
                        rows={5}
                        value={editForm.content}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            content: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Backlinks</Label>
                      <Textarea
                        rows={3}
                        value={editForm.backlinks}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            backlinks: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Note admin au client</Label>
                      <Textarea
                        rows={2}
                        value={editForm.adminNote}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            adminNote: e.target.value,
                          }))
                        }
                        placeholder="Corrections demandées…"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" onClick={() => void saveCorrection()}>
                        Enregistrer la correction
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setArticleStatus(article.id, "approved")}
                  >
                    <Check className="size-4" />
                    Valider
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => startEdit(article)}
                  >
                    <Pencil className="size-4" />
                    Corriger
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setArticleStatus(article.id, "needs_correction")
                    }
                  >
                    Demander correction
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setArticleStatus(article.id, "rejected")}
                  >
                    <XCircle className="size-4" />
                    Refuser
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteArticle(article.id)}
                  >
                    <Trash2 className="size-4" />
                    Supprimer
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
