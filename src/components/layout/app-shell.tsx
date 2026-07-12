"use client";

import { AuthProvider } from "@/components/auth/auth-provider";
import { SiteHeader } from "@/components/layout/site-header";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SiteHeader />
      <main className="flex-1">{children}</main>
    </AuthProvider>
  );
}
