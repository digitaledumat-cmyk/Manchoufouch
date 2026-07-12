import type { Metadata } from "next";

import { AdminPanel } from "@/components/admin/admin-panel";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Panel admin",
  description:
    "Gestion des comptes clients, crédits articles et validation des soumissions SEO.",
  path: "/admin",
  noIndex: true,
});

export default function AdminPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Panel admin</h1>
        <p className="text-muted-foreground">
          Gérez les comptes clients, ajoutez des crédits, validez, corrigez ou
          supprimez les articles.
        </p>
      </div>
      <AdminPanel />
    </div>
  );
}
