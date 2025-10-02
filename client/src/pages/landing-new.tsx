import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles, Code, Cloud, Shield, Brain, Globe, Users, Database, Terminal, Activity, GitBranch } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { GradientDots } from "@/components/ui/gradient-dots";
import CybercoreBackground from "@/components/ui/cybercore-section-hero";
import { motion } from "framer-motion";

const FeatureCard = ({ icon: Icon, title, description, colorClass, index }: { icon: React.ElementType, title: string, description: string, colorClass: string, index?: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index || 0) * 0.1 }}
      className="glass-pane rounded-3xl p-6 flex flex-col items-start text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10"
    >
      <div className={`mb-4 p-3 rounded-xl bg-gradient-to-br ${colorClass}`}>
          <Icon className="h-6 w-6 text-white"/>
      </div>
      <h3 className="text-display text-xl font-semibold mb-2">{title}</h3>
      <p className="text-foreground/60">{description}</p>
    </motion.div>
);


const Features = () => (
  <section id="features" className="py-24 sm:py-32">
    <div className="container mx-auto px-4">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">From Vibe Coding to Vibe Hosting™ in One Conversation</h2>
        <p className="text-lg text-foreground/70">
            You built it with AI. Now deploy it with AI. Just describe what you need—our agent chooses the best cloud, estimates costs, and ships to production. The natural evolution of vibe coding.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
            { icon: Brain, title: "AI Cloud Selection", description: "Agent analyzes your app and chooses the best cloud provider based on framework, budget, and traffic", colorClass: "from-primary to-secondary" },
            { icon: Globe, title: "Multi-Cloud Support", description: "Deploy to AWS, Azure, GCP, Vercel, or Railway—agent picks the optimal platform for each use case", colorClass: "from-blue-500 to-cyan-500" },
            { icon: Cloud, title: "Cost Transparency", description: "Get detailed cost estimates before deployment. Agent suggests most cost-effective architecture", colorClass: "from-green-500 to-emerald-500" },
            { icon: Shield, title: "Zero Lock-In", description: "Not tied to one vendor. Switch clouds anytime. 60+ integrations pre-configured in Azure Key Vault", colorClass: "from-orange-500 to-red-500" },
            { icon: Activity, title: "Intelligent Provisioning", description: "Agent provisions databases (Neon, MongoDB Atlas), monitoring (Datadog), and CDN automatically", colorClass: "from-indigo-500 to-purple-500" },
            { icon: GitBranch, title: "Natural Language Interface", description: "Just describe what you need. Agent handles GitHub analysis, deployment, and configuration", colorClass: "from-pink-500 to-rose-500" },
        ].map((feature, idx) => <FeatureCard key={feature.title} {...feature} index={idx} />)}
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

const CTA = ({ onImportClick }: { onImportClick: () => void }) => (
    <section className="py-24 sm:py-32">
        <div className="container mx-auto px-4">
            <div className="relative rounded-3xl p-10 sm:p-16 text-center overflow-hidden glass-pane">
                 <div className="absolute -inset-2 bg-gradient-to-r from-primary to-secondary opacity-10 blur-3xl"></div>
                 <div className="relative z-10">
                    <h2 className="text-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">Ready to Deploy Without Vendor Lock-In?</h2>
                    <p className="max-w-2xl mx-auto text-lg text-foreground/70 mb-8">
                        Stop choosing between AWS, Azure, and GCP. Let our AI agent analyze your app and deploy to the best cloud for your specific needs—all through natural language.
                    </p>
                    <Button size="lg" onClick={onImportClick} className="rounded-full px-10 py-6 text-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white transition-all duration-300 hover:scale-105 shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/40">
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
  const handleImportFromGitHub = () => {
    // Initiate GitHub OAuth flow
    window.location.href = '/api/integrations/github/oauth/initiate';
  };

  const handleGetStarted = () => {
    // Redirect to GitHub import
    handleImportFromGitHub();
  };

  return (
    <>
      {/* Hero Section with Cybercore Background */}
      <div className="relative min-h-screen overflow-hidden bg-black text-foreground">
        {/* Cybercore Grid Background */}
        <CybercoreBackground beamCount={70} />

        {/* Content Wrapper */}
        <div className="content-wrapper relative z-10">
          <main className="hero-section flex flex-col items-center justify-center min-h-screen text-center px-4 pt-32">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-[0_0_30px_rgba(249,115,22,0.3)]"
            >
              Vibe Hosting
              <br />
              For the Vibe Coding Era
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-lg md:text-xl text-gray-300/90 max-w-2xl mb-8"
            >
              Built with Cursor? Ship with Careerate. Tell our AI what you need—it picks the best cloud (AWS, Azure, GCP, Vercel, Railway), shows you the costs, and ships your app. Zero DevOps required.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            >
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="cta-button rounded-full px-10 py-6 text-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white transition-all duration-300 hover:scale-105 shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/40"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Import from GitHub
              </Button>
            </motion.div>
          </main>
        </div>

        {/* Gradient Transition to Features */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-b from-transparent via-black/50 to-[#090806] pointer-events-none z-20" />
      </div>

      {/* Structured content area with AppShell (navbar + footer) */}
      <div className="relative z-10 bg-[#090806]">
        <AppShell className="bg-transparent">
          <main className="relative">
            <Features />
            <Pricing />
            <Docs />
            <CTA onImportClick={handleImportFromGitHub} />
          </main>
        </AppShell>
      </div>
    </>
  );
}
