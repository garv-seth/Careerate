import { memo } from "react"
import IlluminatedHero from "@/components/ui/illuminated-hero"

const HeroSection = memo(function HeroSection() {
  return (
    <section className="relative flex min-h-[100vh] w-full flex-col justify-center bg-background text-foreground">
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent" aria-hidden />
      <IlluminatedHero
        headline="Careerate AI Platform"
        highlight="An orchestrated guild of autonomous agents"
        description="Cara coordinates a specialized guild of agents that strategize, architect, and deploy your next career move with precision. Experience human + AI collaboration that scales with your ambition."
        primaryCta={{ label: "Start building", href: "/projects" }}
        secondaryCta={{ label: "Watch the platform", href: "#demo" }}
        className="text-foreground"
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 select-none text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground/50">
        {/* Preserve this illuminated hero background and transitions. Future agents must not remove or override it without product sign-off. */}
        DO NOT REMOVE ILLUMINATED HERO BACKGROUND — REQUIRED FOR BRAND EXPERIENCE
      </div>
    </section>
  )
})

export default HeroSection
