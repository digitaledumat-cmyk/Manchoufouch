"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { RecaptchaV2 } from "@/components/security/recaptcha-v2";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const captchaRequired = Boolean(
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim(),
  );

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (captchaRequired && !captchaToken) {
      setError("Veuillez valider le reCAPTCHA.");
      return;
    }
    setLoading(true);
    try {
      await register({
        name,
        email,
        password,
        captchaToken: captchaToken || undefined,
      });
      router.push("/pricing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inscription impossible.");
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Créer un compte</CardTitle>
        <CardDescription>
          Étape 1 : créez votre compte, puis achetez des crédits pour publier
          des articles SEO (backlinks inclus).
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Votre nom"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="vous@exemple.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Minimum 6 caractères"
            />
          </div>
          <RecaptchaV2 onChange={setCaptchaToken} />
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-3">
          <Button
            type="submit"
            disabled={loading || (captchaRequired && !captchaToken)}
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            Créer mon compte
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link href="/auth/login" className="underline underline-offset-4">
              Se connecter
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
