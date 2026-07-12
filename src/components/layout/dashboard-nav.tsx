"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coins, FileText, Shield, Tags, UserPlus } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";

const CLIENT_ITEMS = [
  {
    href: "/auth/register",
    label: "Créer un compte",
    icon: UserPlus,
  },
  {
    href: "/pricing",
    label: "Acheter crédits",
    icon: Coins,
  },
  {
    href: "/dashboard/create-article",
    label: "SEO Backlink",
    icon: FileText,
  },
  {
    href: "/dashboard/annonces",
    label: "Annonces",
    icon: Tags,
  },
];

const ADMIN_ITEMS = [
  {
    href: "/admin",
    label: "Panel admin",
    icon: Shield,
  },
  {
    href: "/dashboard/create-article",
    label: "SEO Backlink",
    icon: FileText,
  },
  {
    href: "/dashboard/annonces",
    label: "Annonces",
    icon: Tags,
  },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { session, isAdmin } = useAuth();
  const items = isAdmin ? ADMIN_ITEMS : CLIENT_ITEMS;

  return (
    <aside className="w-full shrink-0 border-b md:w-56 md:border-b-0 md:border-r">
      <div className="flex gap-1 overflow-x-auto p-3 md:flex-col">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm whitespace-nowrap transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
      {session ? (
        <p className="hidden px-4 pb-3 text-xs text-muted-foreground md:block">
          {isAdmin
            ? "Mode administrateur"
            : `${session.credits} crédit${session.credits > 1 ? "s" : ""} disponible${session.credits > 1 ? "s" : ""}`}
        </p>
      ) : null}
    </aside>
  );
}
