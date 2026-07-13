import { HOME_STATS } from "@/lib/data/home";

export function HomeStats() {
  return (
    <section className="border-y border-[#e8ecf0] bg-[var(--brand-mist)]">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-8 px-4 py-12 sm:grid-cols-3 lg:grid-cols-6">
        {HOME_STATS.map((stat, index) => (
          <div
            key={stat.label}
            className="animate-fade-up space-y-1"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <p className="text-2xl font-bold tracking-tight text-[var(--brand-navy)] sm:text-3xl">
              <span className="home-accent">{stat.value}</span>
            </p>
            <p className="text-xs text-muted-foreground sm:text-sm">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
