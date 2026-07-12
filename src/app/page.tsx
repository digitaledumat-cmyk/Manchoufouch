import { HomeCta } from "@/components/home/home-cta";
import { HomeDomains } from "@/components/home/home-domains";
import { HomeFaq } from "@/components/home/home-faq";
import { HomeHero } from "@/components/home/home-hero";
import { HomeKeywords } from "@/components/home/home-keywords";
import { HomeNews } from "@/components/home/home-news";
import { HomePillars } from "@/components/home/home-pillars";
import { HomeProcess } from "@/components/home/home-process";
import { HomeResults } from "@/components/home/home-results";
import { HomeSeoAudit } from "@/components/home/home-seo-audit";
import { HomeServices } from "@/components/home/home-services";
import { HomeStats } from "@/components/home/home-stats";
import { HomeStrategic } from "@/components/home/home-strategic";
import { HomeTestimonials } from "@/components/home/home-testimonials";

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeStats />
      <HomeSeoAudit />
      <HomeKeywords />
      <HomeServices />
      <HomeStrategic />
      <HomeDomains />
      <HomeProcess />
      <HomeResults />
      <HomePillars />
      <HomeNews />
      <HomeTestimonials />
      <HomeFaq />
      <HomeCta />
    </>
  );
}
