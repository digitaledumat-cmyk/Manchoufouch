import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/register-form";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Créer un compte",
  description:
    "Créez votre compte Manchoufouch pour acheter des crédits et publier des articles SEO optimisés.",
  path: "/auth/register",
  noIndex: true,
});

export default function RegisterPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Créer un compte
        </h1>
        <p className="mt-2 text-muted-foreground">
          Ensuite, achetez des crédits (5, 10 ou 20 articles) pour publier sur
          le site.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
