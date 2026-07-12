"use client";

import Link from "next/link";
import { Coins, Shield } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AuthHeaderActions() {
  const { session, ready, logout, isAdmin } = useAuth();

  if (!ready) {
    return (
      <span className="h-7 w-28 animate-pulse rounded-md bg-muted" aria-hidden />
    );
  }

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/auth/login"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          Connexion
        </Link>
        <Link href="/auth/register" className={cn(buttonVariants({ size: "sm" }))}>
          Créer un compte
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {isAdmin ? (
        <Link
          href="/admin"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
        >
          <Shield className="size-3.5" />
          Admin
        </Link>
      ) : (
        <Link
          href="/pricing"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "gap-1.5",
          )}
        >
          <Coins className="size-3.5" />
          {session.credits} crédit{session.credits > 1 ? "s" : ""}
        </Link>
      )}
      <Link
        href="/dashboard/create-article"
        className={cn(buttonVariants({ size: "sm" }))}
      >
        SEO Backlink
      </Link>
      <button
        type="button"
        onClick={logout}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
      >
        Déconnexion
      </button>
    </div>
  );
}
