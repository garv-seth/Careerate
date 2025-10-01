import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles, Code, Cloud, Shield, Brain, Globe, Users, Database, Terminal, Activity, GitBranch } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { GradientDots } from "@/components/ui/gradient-dots";
import CybercoreBackground from "@/components/ui/cybercore-section-hero";

const FeatureCard = ({ icon: Icon, title, description, colorClass }: { icon: React.ElementType, title: string, description: string, colorClass: string }) => (
    <div className="glass-pane rounded-3xl p-6 flex flex-col items-start text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10">
      <div className={`mb-4 p-3 rounded-xl bg-gradient-to-br ${colorClass}`}>
          <Icon className="h-6 w-6 text-white"/>
      </div>
      <h3 className="text-display text-xl font-semibold mb-2">{title}</h3>
      <p className="text-foreground/60">{description}</p>
    </div>
);


const Features = () => (
  <section id="features" className="py-24 sm:py-32">
    <div className="container mx-auto px-4">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">Production Infrastructure for AI-Built Apps</h2>
        <p className="text-lg text-foreground/70">
            Built it with AI? Deploy it for real with Careerate. Autonomous agents handle migration, scaling, and enterprise features while you focus on growth.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
            { icon: Brain, title: "Agent-Powered Migration", description: "Upload any GitHub repo and our agents fix production issues automatically", colorClass: "from-primary to-secondary" },
            { icon: Globe, title: "Multi-Platform Import", description: "Works with apps from Replit, Base44, Emergent, Bolt.new and any AI coding platform", colorClass: "from-blue-500 to-cyan-500" },
            { icon: Cloud, title: "Enterprise Infrastructure", description: "Azure Container Apps with auto-scaling, SSL, custom domains, and 99.9% uptime", colorClass: "from-green-500 to-emerald-500" },
            { icon: Shield, title: "Production Security", description: "Azure KeyVault encryption, SOC 2 Type II compliance, and enterprise SSO", colorClass: "from-orange-500 to-red-500" },
            { icon: Activity, title: "Autonomous Monitoring", description: "AI agents handle scaling, health checks, and maintenance 24/7", colorClass: "from-indigo-500 to-purple-500" },
            { icon: GitBranch, title: "GitHub Integration", description: "Every push triggers automatic rebuild and deployment to production", colorClass: "from-pink-500 to-rose-500" },
        ].map(feature => <FeatureCard key={feature.title} {...feature} />)}
      </div>
    </div>
  </section>
);

const Pricing = () => (
  <section id="pricing" className="py-24 sm:py-32">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-display text-4xl font-bold mb-2">Simple, transparent pricing</h2>
        <p className="text-foreground/70">Start free. Scale when your AI app gets traction.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {        [{
          name: 'Free', price: '$0', desc: 'For prototypes and testing', features: ['1 Project', 'Basic migration', 'Community support']
        },{
          name: 'Pro', price: '$49', desc: 'For growing AI apps', features: ['Unlimited Projects', 'Advanced agents', 'Priority migrations', 'Email support', 'Custom domains']
        },{
          name: 'Enterprise', price: 'Contact', desc: 'For teams and production apps', features: ['SSO & SAML', 'Private deployments', '99.9% SLA', 'Dedicated support', 'Compliance features']
        }].map(tier => (
          <div key={tier.name} className="glass-pane rounded-3xl p-8 flex flex-col">
            <h3 className="text-xl font-semibold mb-1">{tier.name}</h3>
            <p className="text-3xl font-bold mb-2">{tier.price}</p>
            <p className="text-foreground/60 mb-6">{tier.desc}</p>
            <ul className="space-y-2 text-sm flex-1">
              {tier.features.map(f => <li key={f} className="text-foreground/70">• {f}</li>)}
            </ul>
            <Button className="mt-6 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300">Get Started</Button>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Docs = () => (
  <section id="docs" className="py-24 sm:py-32">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-display text-4xl font-bold mb-4">Developer-first docs</h2>
          <p className="text-foreground/70 mb-6">Clear guides, API references, and copy‑paste snippets to automate everything—from code generation to multi‑cloud deploys.</p>
          <div className="flex gap-3">
            <a href="#" className="rounded-full px-5 py-3 glass-pane">Quickstart</a>
            <a href="#" className="rounded-full px-5 py-3 glass-pane">CLI & API</a>
          </div>
        </div>
        <div className="glass-pane rounded-3xl p-6 text-sm text-foreground/80">
          <pre className="whitespace-pre-wrap">{
            `curl -X POST /api/ai/deploy \\\n+  -d '{\"project\":\"shop-app\",\"provider\":\"azure\",\"strategy\":\"blue-green\"}'`
          }</pre>
        </div>
      </div>
    </div>
  </section>
);

const CTA = () => (
    <section className="py-24 sm:py-32">
        <div className="container mx-auto px-4">
            <div className="relative rounded-3xl p-10 sm:p-16 text-center overflow-hidden glass-pane">
                 <div className="absolute -inset-2 bg-gradient-to-r from-primary to-secondary opacity-10 blur-3xl"></div>
                 <div className="relative z-10">
                    <h2 className="text-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">Ready to Make Your AI App Production-Ready?</h2>
                    <p className="max-w-2xl mx-auto text-lg text-foreground/70 mb-8">
                        Join developers who've already built with AI and now need production infrastructure. Upload your GitHub repo and deploy for real.
                    </p>
                    <Button size="lg" className="rounded-full px-10 py-6 text-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white transition-all duration-300 hover:scale-105 shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/40">
                      <Sparkles className="mr-2 h-5 w-5" />
                      Import from GitHub
                    </Button>
                 </div>
            </div>
        </div>
    </section>
);

const Footer = () => (
  <footer className="border-t border-white/10 mt-20">
    <div className="container mx-auto px-4 py-12">
       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-8">
          <div className="col-span-full lg:col-span-1">
              <h3 className="text-display font-semibold text-lg mb-2">Careerate</h3>
              <p className="text-sm text-foreground/60">Production infrastructure for AI-built applications.</p>
          </div>
          {[
            {
              title: 'Migration',
              links: ['From Replit', 'From Base44', 'From Emergent', 'From Bolt.new']
            },
            {
              title: 'Platform',
              links: ['GitHub Integration', 'Azure Infrastructure', 'Auto-scaling', 'Monitoring']
            },
            {
              title: 'Enterprise',
              links: ['SSO & SAML', 'Private Deployments', 'Compliance', 'Support']
            },
            {
              title: 'Company',
              links: ['About', 'Blog', 'Careers', 'Contact']
            }
          ].map(section => (
              <div key={section.title}>
                  <h4 className="font-semibold mb-4">{section.title}</h4>
                  <ul className="space-y-3">
                      {section.links.map(link => (
                        <li key={link}><a href="#" className="text-sm text-foreground/60 hover:text-foreground transition">{link}</a></li>
                      ))}
                  </ul>
              </div>
          ))}
       </div>
       <div className="border-t border-white/10 pt-8 text-center text-sm text-foreground/60">
        <p>© {new Date().getFullYear()} Careerate. All rights reserved.</p>
       </div>
    </div>
  </footer>
)


export default function LandingNew() {
  const handleGetStarted = () => {
    // Scroll to features section
    document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-foreground">
      {/* Cybercore Grid Background */}
      <CybercoreBackground beamCount={70} />

      {/* Content Wrapper */}
      <div className="content-wrapper relative z-10">
        <header className="main-header fixed top-6 left-1/2 transform -translate-x-1/2 z-20 flex items-center justify-between pl-6 pr-6 py-3 backdrop-blur-sm rounded-full border border-[#333] bg-[#1f1f1f57] gap-x-8">
          <div className="flex items-center">
            <div className="text-display font-semibold text-lg text-white">Careerate</div>
          </div>
          <nav className="hidden md:flex items-center space-x-6 text-sm">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
            <a href="#docs" className="text-gray-300 hover:text-white transition-colors">Docs</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-full border-[#333] bg-[rgba(31,31,31,0.62)] text-gray-300 hover:border-white/50 hover:text-white">
              Login
            </Button>
            <div className="relative group">
              <div className="absolute inset-0 -m-2 rounded-full bg-gray-100 opacity-40 filter blur-lg pointer-events-none transition-all duration-300 ease-out group-hover:opacity-60 group-hover:blur-xl group-hover:-m-3"></div>
              <Button className="relative z-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30">
                Get Started
              </Button>
            </div>
          </div>
        </header>

        <main className="hero-section flex flex-col items-center justify-center min-h-screen text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-[0_0_30px_rgba(249,115,22,0.3)]">
            AI Built It.
            <br />
            We'll Deploy It for Real.
          </h1>
          <p className="text-lg md:text-xl text-gray-300/90 max-w-2xl mb-8">
            Your AI prototype got traction. Now make it production-ready with enterprise-grade infrastructure and autonomous agents.
          </p>
          <Button 
            size="lg" 
            onClick={handleGetStarted}
            className="cta-button rounded-full px-10 py-6 text-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white transition-all duration-300 hover:scale-105 shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/40"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Import from GitHub
          </Button>
        </main>
      </div>

      {/* Structured content area */}
      <div className="relative z-10 bg-[#090806]">
        <AppShell className="bg-transparent">
          <main className="relative">
            <Features />
            <Pricing />
            <Docs />
            <CTA />
          </main>
        </AppShell>
      </div>
    </div>
  );
}
