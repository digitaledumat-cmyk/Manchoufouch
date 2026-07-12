import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Connexion",
  description: "Connectez-vous pour gérer vos crédits et créer des articles SEO.",
  path: "/auth/login",
  noIndex: true,
});

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Connexion</h1>
        <p className="mt-2 text-muted-foreground">
          Accédez à vos crédits et à la création d&apos;articles SEO.
        </p>
      </div>
      <Suspense fallback={<p className="text-center text-sm">Chargement…</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
