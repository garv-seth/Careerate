import { cn } from "@/lib/utils"

const styles = `
@keyframes hero-orb {
  0% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.6; }
  50% { transform: translate3d(40px, -20px, 0) scale(1.05); opacity: 0.9; }
  100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.6; }
}
@keyframes hero-orb-delayed {
  0% { transform: translate3d(0, 0, 0) scale(0.95); opacity: 0.5; }
  50% { transform: translate3d(-30px, 30px, 0) scale(1.08); opacity: 0.85; }
  100% { transform: translate3d(0, 0, 0) scale(0.95); opacity: 0.5; }
}
.animate-hero-orb { animation: hero-orb 18s ease-in-out infinite; }
.animate-hero-orb-delayed { animation: hero-orb-delayed 22s ease-in-out infinite; }
`

interface IlluminatedHeroProps {
  headline: string
  highlight: string
  description: string
  primaryCta?: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
  className?: string
}

const gradientStops = [
  "from-orange-500/90 via-amber-400/60 to-yellow-300/40",
  "from-amber-500/80 via-orange-400/40 to-orange-500/80",
]

export default function IlluminatedHero({
  headline,
  highlight,
  description,
  primaryCta,
  secondaryCta,
  className,
}: IlluminatedHeroProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background text-foreground",
        className,
      )}
    >
      <style>{styles}</style>
      {/* DO NOT REMOVE: Illuminated hero background for brand experience */}
      <div className="pointer-events-none absolute inset-0 select-none" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,153,0,0.25),transparent_55%),radial-gradient(circle_at_80%_10%,rgba(255,214,94,0.18),transparent_50%),radial-gradient(circle_at_50%_80%,rgba(255,98,0,0.22),transparent_60%)]" />
        <div className="absolute -left-32 -top-32 h-[36rem] w-[36rem] animate-hero-orb rounded-full bg-gradient-to-br from-orange-500/40 via-amber-400/30 to-orange-500/10 blur-[120px]" />
        <div className="absolute bottom-[-18rem] right-[-18rem] h-[40rem] w-[40rem] animate-hero-orb-delayed rounded-full bg-gradient-to-tr from-amber-500/30 via-orange-400/20 to-yellow-300/10 blur-[140px]" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background via-background/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-10 px-6 text-center md:gap-14">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-orange-500/10 px-5 py-2 text-xs font-medium uppercase tracking-[0.4em] text-amber-200 shadow-[0_0_25px_rgba(251,191,36,0.25)]">
          Cara orchestrated
        </div>

        <div className="space-y-6">
          <h1 className="text-balance text-4xl font-semibold leading-tight text-foreground md:text-6xl lg:text-7xl">
            {headline}
          </h1>
          <p className="text-balance text-3xl font-light text-amber-200/90 md:text-4xl">
            {highlight}
          </p>
          <p className="mx-auto max-w-3xl text-base text-muted-foreground/90 md:text-lg">
            {description}
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row">
          {primaryCta && (
            <a
              href={primaryCta.href}
              className="group inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-amber-400 px-10 py-4 text-sm font-semibold text-black shadow-lg shadow-orange-500/30 transition-transform duration-300 ease-out hover:scale-[1.02] hover:shadow-orange-400/40"
            >
              {primaryCta.label}
            </a>
          )}
          {secondaryCta && (
            <a
              href={secondaryCta.href}
              className="inline-flex items-center justify-center rounded-full border border-amber-200/30 bg-orange-500/5 px-8 py-4 text-sm font-semibold text-amber-100 transition-colors hover:border-amber-200/50 hover:bg-orange-500/15"
            >
              {secondaryCta.label}
            </a>
          )}
        </div>

        <div className="mt-8 grid w-full max-w-4xl gap-4 rounded-3xl border border-orange-500/10 bg-orange-500/5 p-6 shadow-[0_0_35px_rgba(253,186,116,0.25)] backdrop-blur">
          <p className="text-xs uppercase tracking-[0.35em] text-orange-200/70">
            orchestrated agent guild
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                label: "Architect & Guardian",
                text: "Balance innovation and resilience with automated design reviews and security guards.",
              },
              {
                label: "CodeSmith",
                text: "Generative builders craft and refactor modules with production-ready polish.",
              },
              {
                label: "Deployer",
                text: "CI/CD shepherd ensures releases ship safely across cloud regions.",
              },
            ].map((item) => (
              <div
                key={item.label}
                className={cn(
                  "rounded-2xl border border-orange-500/20 bg-gradient-to-br p-5 text-left shadow-lg",
                  gradientStops[0],
                )}
              >
                <p className="text-sm font-semibold text-foreground/90">{item.label}</p>
                <p className="mt-2 text-sm text-foreground/70">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
