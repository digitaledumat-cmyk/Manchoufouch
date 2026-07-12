import Link from "next/link";

import { getWhatsAppUrl, SITE_CONFIG } from "@/lib/seo/site";

const FOOTER_LINKS = {
  information: [
    { href: "/", label: "Accueil" },
    { href: "/#services", label: "À propos" },
    { href: "/#services", label: "Nos services" },
    { href: "/#faq", label: "FAQ" },
    { href: "/articles", label: "Articles SEO" },
  ],
  services: [
    { href: "/auth/register", label: "Créer un compte" },
    { href: "/pricing", label: "Acheter des crédits" },
    { href: "/dashboard/create-article", label: "SEO Backlink" },
    { href: "/admin", label: "Panel admin" },
    { href: "/#audit-seo", label: "Audit score SEO" },
  ],
} as const;

export function SiteFooter() {
  return (
    <footer className="border-t bg-foreground text-background">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3 sm:col-span-2 lg:col-span-1">
          <Link href="/" className="inline-flex items-center gap-2">
            <img
              src="/logo-mark.svg"
              alt={`Logo ${SITE_CONFIG.name}`}
              width={28}
              height={28}
              className="size-7 rounded-md bg-white"
            />
            <span className="text-lg font-semibold tracking-tight">
              {SITE_CONFIG.name}
            </span>
          </Link>
          <p className="text-sm text-background/70">
            Plateforme de référencement et de contenu SEO pour générer du trafic
            qualifié et maximiser votre retour sur investissement.
          </p>
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-background/70 hover:text-background"
          >
            Tel / WhatsApp : {SITE_CONFIG.phone}
          </a>
          <a
            href={`mailto:${SITE_CONFIG.email}`}
            className="block text-sm text-background/70 hover:text-background"
          >
            Email : {SITE_CONFIG.email}
          </a>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium">Information</p>
          <ul className="space-y-2 text-sm text-background/70">
            {FOOTER_LINKS.information.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="hover:text-background">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium">Services</p>
          <ul className="space-y-2 text-sm text-background/70">
            {FOOTER_LINKS.services.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="hover:text-background">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium">Contact</p>
          <p className="text-sm text-background/70">
            Nos experts vous répondront sous 24 heures.
          </p>
          <a
            href={`mailto:${SITE_CONFIG.email}`}
            className="mt-4 block text-sm font-medium underline-offset-4 hover:underline"
          >
            {SITE_CONFIG.email}
          </a>
          <a
            href={getWhatsAppUrl(
              "Bonjour Manchoufouch, je souhaite un devis pour des crédits articles SEO.",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm font-medium underline-offset-4 hover:underline"
          >
            WhatsApp {SITE_CONFIG.phone}
          </a>
        </div>
      </div>

      <div className="border-t border-background/15">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-background/55">
          © {new Date().getFullYear()} {SITE_CONFIG.name}. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
