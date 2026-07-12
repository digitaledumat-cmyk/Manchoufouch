"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Filter } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Article } from "@/lib/data/articles";
import { DOMAINS, getDomainLabel } from "@/lib/data/domains";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<Article["status"], string> = {
  draft: "Brouillon",
  published: "Publié",
  scheduled: "Planifié",
};

const STATUS_VARIANT: Record<
  Article["status"],
  "secondary" | "default" | "outline"
> = {
  draft: "secondary",
  published: "default",
  scheduled: "outline",
};

export function AnnoncesList({ articles }: { articles: Article[] }) {
  const [domain, setDomain] = useState<string>("all");

  const filtered = useMemo(() => {
    if (domain === "all") return articles;
    return articles.filter((article) => article.domain === domain);
  }, [articles, domain]);

  return (
    <Card>
      <CardHeader className="gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <CardTitle>Annonces & articles</CardTitle>
          <CardDescription>
            Filtrez par domaine pour retrouver vos contenus SEO déjà créés.
          </CardDescription>
        </div>
        <div className="flex min-w-[220px] items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <Select
            value={domain}
            onValueChange={(value) => setDomain(value ?? "all")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filtrer par domaine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les domaines</SelectItem>
              {DOMAINS.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Domaine</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Mots-clés</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Aucun contenu pour ce domaine.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="max-w-[280px]">
                      <div className="font-medium">{article.title}</div>
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                        {article.excerpt}
                      </p>
                    </TableCell>
                    <TableCell>{getDomainLabel(article.domain)}</TableCell>
                    <TableCell className="capitalize">{article.type}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[article.status]}>
                        {STATUS_LABEL[article.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex max-w-[200px] flex-wrap gap-1">
                        {article.keywords.slice(0, 2).map((keyword) => (
                          <Badge key={keyword} variant="secondary">
                            {keyword}
                          </Badge>
                        ))}
                        {article.keywords.length > 2 ? (
                          <Badge variant="outline">
                            +{article.keywords.length - 2}
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/annonces/${article.slug}`}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                        )}
                      >
                        Voir
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
        </p>
      </CardContent>
    </Card>
  );
}
