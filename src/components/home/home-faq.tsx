import { HOME_FAQ } from "@/lib/data/home";

export function HomeFaq() {
  return (
    <section id="faq" className="border-y border-[#e8ecf0] bg-[var(--brand-mist)]">
      <div className="mx-auto w-full max-w-3xl px-4 py-20">
        <div className="mb-10 space-y-3 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Vous avez encore des questions ?
          </h2>
          <p className="text-muted-foreground">
            Notre équipe vous répond sous 24 heures.
          </p>
        </div>

        <div className="space-y-3">
          {HOME_FAQ.map((item) => (
            <details
              key={item.question}
              className="group border-b py-4 open:pb-5"
            >
              <summary className="cursor-pointer list-none font-medium outline-none marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-start justify-between gap-4">
                  {item.question}
                  <span className="mt-0.5 text-[var(--brand-coral)] transition group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 pr-8 text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
