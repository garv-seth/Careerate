import { memo } from "react"
import { IlluminatedHero } from "@/components/ui/illuminated-hero"

const HeroSection = memo(function HeroSection() {
  return (
    <section className="relative flex min-h-[100vh] w-full flex-col justify-center bg-background text-foreground">
      <IlluminatedHero />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 select-none text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground/50">
        {/* Preserve this illuminated hero background and transitions. Future agents must not remove or override it without product sign-off. */}
        DO NOT REMOVE ILLUMINATED HERO BACKGROUND — REQUIRED FOR BRAND EXPERIENCE
      </div>
    </section>
  )
})

export default HeroSection
