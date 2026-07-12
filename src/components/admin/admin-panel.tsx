"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Ban,
  Check,
  Coins,
  KeyRound,
  Loader2,
  Pencil,
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
import {
  DEFAULT_ADMIN,
  deleteClientArticle,
  deleteClientUser,
  getAdminDashboardStats,
  listClients,
  readClientArticles,
  resetClientPassword,
  setClientBlocked,
  setCreditsForUser,
  updateClientArticle,
  type AdminDashboardStats,
  type ClientArticle,
  type ClientArticleStatus,
  type ClientPublicUser,
} from "@/lib/auth/storage";
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
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("pending");

  function refresh() {
    const nextClients = listClients();
    setClients(nextClients);
    setCreditDrafts(
      Object.fromEntries(
        nextClients.map((client) => [client.id, String(client.credits)]),
      ),
    );
    setArticles(readClientArticles());
    setStats(getAdminDashboardStats());
  }

  useEffect(() => {
    if (ready && session?.user.role === "admin") {
      refresh();
    }
  }, [ready, session]);

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
          <p>
            Email : <strong>{DEFAULT_ADMIN.email}</strong>
          </p>
          <p>
            Mot de passe : <strong>{DEFAULT_ADMIN.password}</strong>
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

  function handleSetCredits(userId: string) {
    setError(null);
    setMessage(null);
    const value = Number(creditDrafts[userId] ?? 0);
    if (Number.isNaN(value) || value < 0) {
      setError("Nombre de crédits invalide.");
      return;
    }
    setCreditsForUser(userId, value);
    setMessage("Crédits mis à jour.");
    refresh();
  }

  function handleAddCredits(userId: string, amount: number) {
    const current = Number(creditDrafts[userId] ?? 0);
    setCreditsForUser(userId, current + amount);
    setMessage(`+${amount} crédits ajoutés.`);
    refresh();
  }

  function handleResetPassword(userId: string) {
    setError(null);
    setMessage(null);
    const nextPassword = passwordDrafts[userId]?.trim();
    if (!nextPassword) {
      setError("Saisissez un nouveau mot de passe.");
      return;
    }
    try {
      resetClientPassword(userId, nextPassword);
      setPasswordDrafts((prev) => ({ ...prev, [userId]: "" }));
      setMessage(`Mot de passe réinitialisé : ${nextPassword}`);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Réinitialisation impossible.");
    }
  }

  function handleToggleBlock(client: ClientPublicUser) {
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
    setClientBlocked(client.id, next);
    setMessage(next ? "Compte bloqué." : "Compte débloqué.");
    refresh();
  }

  function handleDeleteClient(userId: string) {
    if (!window.confirm("Supprimer ce client et ses articles ?")) return;
    deleteClientUser(userId);
    setMessage("Client supprimé.");
    refresh();
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

  function saveCorrection() {
    if (!editingId) return;
    updateClientArticle(editingId, {
      title: editForm.title,
      metaDescription: editForm.metaDescription,
      content: editForm.content,
      backlinks: editForm.backlinks,
      adminNote: editForm.adminNote,
      status: "needs_correction",
    });
    setEditingId(null);
    setMessage("Article corrigé et marqué « à corriger ».");
    refresh();
  }

  async function setArticleStatus(id: string, status: ClientArticleStatus) {
    const updated = updateClientArticle(id, { status });

    if (status === "approved") {
      try {
        const response = await fetch("/api/seo/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "publish",
            article: {
              id: updated.id,
              title: updated.title,
              domain: updated.domain,
              metaDescription: updated.metaDescription,
              keywords: updated.keywords,
              h1: updated.h1,
              content: updated.content,
              userName: updated.userName,
              targetUrl: updated.targetUrl,
            },
          }),
        });
        const data = (await response.json()) as {
          publicPath?: string;
          indexing?: { indexNow?: { ok: boolean }; googlePing?: { ok: boolean } };
          error?: string;
        };
        if (!response.ok) {
          throw new Error(data.error || "Indexation échouée.");
        }
        setMessage(
          `Article validé et soumis à l'indexation Google${
            data.publicPath ? ` → ${data.publicPath}` : ""
          }.`,
        );
      } catch (err) {
        setMessage(
          `Article validé localement, mais indexation Google : ${
            err instanceof Error ? err.message : "erreur"
          }.`,
        );
      }
      refresh();
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
    refresh();
  }

  async function handleDeleteArticle(id: string) {
    if (!window.confirm("Supprimer définitivement cet article ?")) return;
    deleteClientArticle(id);
    void fetch("/api/seo/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unpublish", id }),
    });
    if (editingId === id) setEditingId(null);
    setMessage("Article supprimé.");
    refresh();
  }

  const scoreCards = [
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
      label: "Sans crédits",
      value: stats?.withoutCredits ?? 0,
      icon: Users,
    },
    {
      label: "Connexions totales",
      value: stats?.totalLogins ?? 0,
      icon: Shield,
    },
    {
      label: "Articles en attente",
      value: stats?.pendingArticles ?? 0,
      icon: Pencil,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-xl border bg-muted/40 px-4 py-3 text-sm">
        Connecté en admin : <strong>{session.user.name}</strong> (
        {session.user.email})
      </div>

      {message ? (
        <p className="text-sm text-emerald-700" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
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
          <CardTitle>Comptes clients</CardTitle>
          <CardDescription>
            Crédits, connexions, dernière connexion, reset MDP et blocage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {clients.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun client inscrit pour le moment.
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
                      <Button type="button" onClick={saveCorrection}>
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
