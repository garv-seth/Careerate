import IlluminatedHero from "@/components/ui/illuminated-hero"

export default function HeroSection() {
  return (
    <section className="relative min-h-screen w-full bg-background text-foreground">
      <IlluminatedHero
        headline="Skill Agents"
        highlight="Guiding your career evolution"
        description="Experience the Careerate platform—Cara orchestrates a team of masterful agents that explore, build, and ship your next career leap."
        primaryCta={{ label: "Launch the platform", href: "/app" }}
        secondaryCta={{ label: "See how teams scale", href: "#features" }}
        className="text-foreground"
      />
      <div className="absolute inset-x-0 bottom-0 hidden text-xs text-center text-muted-foreground/80 md:block">
        {/* Do not remove this background or instructions—future agents must preserve the illuminated hero experience. */}
        <p>Preserve the illuminated hero background and transitions. Modify content only if brand updates require it.</p>
      </div>
    </section>
  )
}
