"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    grecaptcha?: {
      render: (
        container: HTMLElement,
        parameters: {
          sitekey: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark";
        },
      ) => number;
      reset: (widgetId?: number) => void;
    };
  }
}

type RecaptchaV2Props = {
  onChange: (token: string | null) => void;
  className?: string;
};

export function RecaptchaV2({ onChange, className }: RecaptchaV2Props) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() || "";
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const onChangeRef = useRef(onChange);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!siteKey || !scriptReady || !containerRef.current) return;
    if (widgetIdRef.current != null) return;
    if (!window.grecaptcha?.render) return;

    widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
      sitekey: siteKey,
      callback: (token) => onChangeRef.current(token),
      "expired-callback": () => onChangeRef.current(null),
      "error-callback": () => onChangeRef.current(null),
      theme: "light",
    });
  }, [siteKey, scriptReady]);

  if (!siteKey) {
    return (
      <p className="text-xs text-muted-foreground">
        reCAPTCHA non configuré (ajoutez NEXT_PUBLIC_RECAPTCHA_SITE_KEY).
      </p>
    );
  }

  return (
    <div className={className}>
      <Script
        src="https://www.google.com/recaptcha/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <div ref={containerRef} />
      <p className="mt-2 text-xs text-muted-foreground">
        Protection anti-spam Google reCAPTCHA.
      </p>
    </div>
  );
}
