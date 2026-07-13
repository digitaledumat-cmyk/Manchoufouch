import { TrendingUp } from "lucide-react";

const KEYWORDS = [
  { rank: 1, label: "agence seo maroc", gain: "+15", tone: "coral" as const },
  {
    rank: 2,
    label: "référencement naturel maroc",
    gain: "+8",
    tone: "navy" as const,
  },
  { rank: 1, label: "seo casablanca", gain: "+20", tone: "coral" as const },
];

export function HeroSeoDashboard() {
  return (
    <div className="relative mx-auto w-full max-w-md animate-fade-up lg:max-w-none">
      <div className="absolute -right-1 -top-3 z-20 rounded-2xl border border-[#e8ecf0] bg-white px-3 py-2.5 shadow-[0_16px_40px_-20px_rgb(30_42_59_/_0.35)] sm:-right-3 sm:-top-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-[var(--brand-coral)] text-white">
            <TrendingUp className="size-4" strokeWidth={2.5} />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold text-[var(--brand-navy)]">
              Page #1
            </span>
            <span className="text-[11px] text-muted-foreground">
              sur Google garanti
            </span>
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.35rem] border border-[#e8ecf0] bg-white p-4 shadow-[0_28px_70px_-32px_rgb(30_42_59_/_0.35)] sm:p-5">
        <div className="flex items-center gap-3 rounded-full border border-[#e8ecf0] bg-[#f8fafc] px-3 py-2.5">
          <GoogleMark />
          <span className="truncate text-sm text-[var(--brand-navy)]">
            agence seo maroc
          </span>
        </div>

        <div className="mt-5 space-y-3">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0d9488]">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Suivi de positions
          </p>

          <div className="relative overflow-hidden rounded-2xl bg-[#f3f5f7] px-4 pb-3 pt-3">
            <div className="mb-2 flex items-start justify-between gap-3">
              <p className="text-xs font-medium text-muted-foreground">
                Évolution positions Google
              </p>
              <span className="rounded-full bg-[var(--brand-coral)]/15 px-2.5 py-1 text-[11px] font-semibold text-[var(--brand-coral)]">
                #15 → #1
              </span>
            </div>
            <svg
              viewBox="0 0 280 72"
              className="h-16 w-full"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="hero-rank-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--brand-coral)"
                    stopOpacity="0.28"
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--brand-coral)"
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>
              <path
                d="M0 58 C40 54, 55 48, 80 42 C110 34, 130 38, 155 28 C185 16, 210 22, 240 12 C255 8, 270 6, 280 4 L280 72 L0 72 Z"
                fill="url(#hero-rank-fill)"
              />
              <path
                d="M0 58 C40 54, 55 48, 80 42 C110 34, 130 38, 155 28 C185 16, 210 22, 240 12 C255 8, 270 6, 280 4"
                fill="none"
                stroke="var(--brand-coral)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <ul className="space-y-2">
            {KEYWORDS.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-3 rounded-xl border border-[#eef1f4] bg-white px-2.5 py-2"
              >
                <span
                  className={
                    item.tone === "coral"
                      ? "flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-coral)] text-xs font-bold text-white"
                      : "flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-navy)] text-xs font-bold text-white"
                  }
                >
                  #{item.rank}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--brand-navy)]">
                  {item.label}
                </span>
                <span className="shrink-0 text-sm font-semibold text-emerald-600">
                  {item.gain} ↑
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 grid grid-cols-3 divide-x divide-[#e8ecf0] border-t border-[#e8ecf0] pt-4">
          <div className="px-2 text-center sm:px-3">
            <p className="text-lg font-bold text-[var(--brand-navy)] sm:text-xl">
              +234%
            </p>
            <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">
              Trafic organique
            </p>
          </div>
          <div className="px-2 text-center sm:px-3">
            <p className="text-lg font-bold text-[var(--brand-navy)] sm:text-xl">
              48
            </p>
            <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">
              Mots-clés Top 3
            </p>
          </div>
          <div className="px-2 text-center sm:px-3">
            <p className="text-lg font-bold text-[var(--brand-navy)] sm:text-xl">
              100
            </p>
            <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">
              Score PageSpeed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5 shrink-0"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
