const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

export function getRecaptchaSiteKey() {
  return process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() || "";
}

export function getRecaptchaSecretKey() {
  return process.env.RECAPTCHA_SECRET_KEY?.trim() || "";
}

export function isRecaptchaConfigured() {
  return Boolean(getRecaptchaSiteKey() && getRecaptchaSecretKey());
}

export async function verifyRecaptchaToken(
  token: string | undefined | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isRecaptchaConfigured()) {
    // Dev / avant configuration : ne bloque pas le site.
    return { ok: true };
  }

  if (!token?.trim()) {
    return {
      ok: false,
      error: "Veuillez valider le reCAPTCHA.",
    };
  }

  const body = new URLSearchParams({
    secret: getRecaptchaSecretKey(),
    response: token.trim(),
  });

  let response: Response;
  try {
    response = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
  } catch {
    return {
      ok: false,
      error: "Vérification reCAPTCHA impossible. Réessayez.",
    };
  }

  const data = (await response.json()) as {
    success?: boolean;
    "error-codes"?: string[];
  };

  if (!data.success) {
    return {
      ok: false,
      error: "reCAPTCHA invalide ou expiré. Cochez à nouveau la case.",
    };
  }

  return { ok: true };
}
