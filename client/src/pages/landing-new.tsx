import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles, Code, Cloud, Shield, Cpu, Globe, Users, Database, Terminal, Activity, GitBranch } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { GradientDots } from "@/components/ui/gradient-dots";
import CybercoreBackground from "@/components/ui/cybercore-section-hero";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";

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
        <h2 className="text-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">Deploy Without the DevOps Headache</h2>
        <p className="text-lg text-foreground/70">
            You built your app. Now just tell our AI where it should go. It picks the right cloud, shows you what it'll cost, and handles everything. No Kubernetes. No Terraform. No weekend spent reading AWS docs.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
            { icon: Cpu, title: "Smart Cloud Picker", description: "Tell us what you're building. We'll figure out if it belongs on AWS, Azure, GCP, Vercel, or Railway—and explain why.", colorClass: "from-primary to-secondary" },
            { icon: Cloud, title: "See Costs Upfront", description: "No surprise bills. We show you exactly what you'll pay before we deploy anything. Change your mind? No problem.", colorClass: "from-green-500 to-emerald-500" },
            { icon: Shield, title: "Deploy to YOUR Cloud", description: "We connect to your AWS/Azure/GCP account. You own the infrastructure. Kick us out anytime and it keeps running.", colorClass: "from-orange-500 to-red-500" },
            { icon: GitBranch, title: "Just Talk to It", description: "\"Deploy my Next.js app to AWS with a Postgres database.\" That's it. The AI figures out the rest.", colorClass: "from-pink-500 to-rose-500" },
            { icon: Activity, title: "Sets Up Everything", description: "Databases, CDN, monitoring, SSL certificates—all the boring stuff you'd spend hours googling gets configured automatically.", colorClass: "from-indigo-500 to-purple-500" },
            { icon: Globe, title: "Works Everywhere", description: "Connect GitHub, GitLab, AWS, Azure, GCP, Vercel, Railway. If you use it, we probably integrate with it.", colorClass: "from-blue-500 to-cyan-500" },
        ].map((feature, idx) => <FeatureCard key={feature.title} {...feature} index={idx} />)}
      </div>
    </div>
  </section>
);

const Pricing = () => (
  <section id="pricing" className="py-24 sm:py-32">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-display text-4xl font-bold mb-2">Pricing that makes sense</h2>
        <p className="text-foreground/70">Free to start. Pay only when you're actually using it.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {        [{
          name: 'Free', price: '$0', desc: 'Try it out, no credit card', features: ['1 project', '1 deployment', 'Community help', 'All core features']
        },{
          name: 'Pro', price: '$49', desc: 'For real projects', features: ['Unlimited projects', 'Unlimited deployments', 'Email support', 'Custom domains', 'Priority deployment queue']
        },{
          name: 'Enterprise', price: 'Let\'s talk', desc: 'For teams who need more', features: ['SSO & SAML', 'Private cloud deployment', '99.9% uptime SLA', 'Dedicated support', 'Custom integrations']
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
          <h2 className="text-display text-4xl font-bold mb-4">Works how you work</h2>
          <p className="text-foreground/70 mb-6">Use the web UI, CLI, or API. Whatever fits your workflow. Docs are actually readable (we promise).</p>
          <div className="flex gap-3">
            <a href="/docs" className="rounded-full px-5 py-3 glass-pane hover:bg-primary/10 transition-colors">Read the docs</a>
            <a href="/deploy" className="rounded-full px-5 py-3 glass-pane hover:bg-primary/10 transition-colors">Try it now</a>
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
                    <h2 className="text-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">Try it with your next project</h2>
                    <p className="max-w-2xl mx-auto text-lg text-foreground/70 mb-8">
                        Import from GitHub and we'll show you exactly what deployment would look like—which cloud, what it costs, how long it'll take. No commitment required.
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
  <footer className="relative mt-20 overflow-hidden bg-black">
    {/* Cybercore Background - Blurred */}
    <div className="absolute inset-0 opacity-40 blur-sm">
      <CybercoreBackground beamCount={50} />
    </div>
    
    {/* Footer Content with transparency */}
    <div className="relative z-10 border-t border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-12">
         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-8">
            <div className="col-span-full lg:col-span-1">
                <h3 className="text-display font-semibold text-lg mb-2 text-white">Careerate</h3>
                <p className="text-sm text-gray-300/80">Deploy to any cloud without the DevOps headache.</p>
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
                    <h4 className="font-semibold mb-4 text-white">{section.title}</h4>
                    <ul className="space-y-3">
                        {section.links.map(link => (
                          <li key={link}><a href="#" className="text-sm text-gray-300/70 hover:text-white transition">{link}</a></li>
                        ))}
                    </ul>
                </div>
            ))}
         </div>
         <div className="border-t border-white/10 pt-8 text-center text-sm text-gray-300/70">
          <p>© {new Date().getFullYear()} Careerate. All rights reserved.</p>
         </div>
      </div>
    </div>
  </footer>
)


export default function LandingNew() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Dashboard redirect removed - dashboard page deleted

  const handleImportFromGitHub = () => {
    // Initiate GitHub OAuth flow
    window.location.href = '/api/integrations/github/oauth/initiate';
  };

  const handleGetStarted = () => {
    // Redirect to GitHub import
    handleImportFromGitHub();
  };

  // Don't render landing page if user is authenticated (they'll be redirected)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppShell className="bg-transparent flex-1" hideFooter={true}>
        {/* Hero Section with Cybercore Background */}
        <div className="relative min-h-screen overflow-hidden bg-black text-foreground -mt-24 md:-mt-28">
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
                Deploy to Any Cloud
                <br />
                By Just Asking
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="text-lg md:text-xl text-gray-300/90 max-w-2xl mb-8"
              >
                Stop choosing between AWS, Azure, and GCP. Our AI picks the right one for your app, shows you the cost, and deploys it. Works with whatever you're already using.
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

        {/* Structured content area */}
        <div className="relative z-10 bg-[#090806]">
          <Features />
          <Pricing />
          <Docs />
          <CTA onImportClick={handleImportFromGitHub} />
          <Footer />
        </div>
      </AppShell>
    </div>
  );
}
