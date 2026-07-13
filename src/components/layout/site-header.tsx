"use client";

import Image from "next/image";
import Link from "next/link";

import { AuthHeaderActions } from "@/components/layout/auth-header-actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/seo/site";

const NAV_LINKS = [
  { href: "/#services", label: "Services" },
  { href: "/#mots-cles", label: "Mots-clés" },
  { href: "/#audit-seo", label: "Audit SEO" },
  { href: "/pricing", label: "Crédits" },
  { href: "/dashboard/create-article", label: "SEO Backlink" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#e8ecf0] bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold tracking-tight text-[var(--brand-navy)]"
        >
          <Image
            src="/logo-mark.svg"
            alt={SITE_CONFIG.name}
            width={32}
            height={32}
            className="size-8 rounded-md border border-border bg-white"
            priority
          />
          <span className="hidden sm:inline">{SITE_CONFIG.name}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-muted-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <AuthHeaderActions />
      </div>
    </header>
  );
}
