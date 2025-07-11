import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ParticleTextEffect } from "@/components/ui/particle-text-effect";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Bot, Zap, Shield, Cloud, GitBranch, Activity, Users, Globe, Menu, X, Brain, Cpu, Target, TrendingUp, CheckCircle2, Workflow } from "lucide-react";
import careerateLogo from "@assets/CareerateLogo.png";

export default function LandingRedesigned() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const { scrollY } = useScroll();
  
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
  const opacityRange = useTransform(scrollY, [0, 300], [1, 0.3]);

  // Handle footer visibility on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const clientHeight = window.innerHeight;
      
      setFooterVisible(scrollTop + clientHeight >= scrollHeight - 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOAuthLogin = (provider: string) => {
    window.location.href = `/api/auth/${provider}`;
  };

  const agents = [
    {
      name: "Planner Agent",
      description: "Analyzes repositories and generates deployment strategies",
      icon: Brain,
      color: "from-blue-500/20 to-cyan-500/20",
      integration: "GitHub, GitLab, Bitbucket"
    },
    {
      name: "Builder Agent", 
      description: "Compiles, builds and optimizes applications automatically",
      icon: Cpu,
      color: "from-purple-500/20 to-pink-500/20",
      integration: "Docker, Kubernetes, CI/CD"
    },
    {
      name: "Deployer Agent",
      description: "Orchestrates multi-cloud deployments seamlessly", 
      icon: Cloud,
      color: "from-green-500/20 to-emerald-500/20",
      integration: "AWS, GCP, Azure, Vercel"
    },
    {
      name: "Monitor Agent",
      description: "Real-time monitoring with auto-healing capabilities",
      icon: Activity,
      color: "from-orange-500/20 to-red-500/20", 
      integration: "Datadog, Prometheus, Grafana"
    }
  ];

  const integrations = [
    { name: "GitHub", status: "Connected", icon: GitBranch },
    { name: "AWS", status: "Active", icon: Cloud },
    { name: "Docker", status: "Running", icon: Bot },
    { name: "Kubernetes", status: "Healthy", icon: Target }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-black/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <img src={careerateLogo} alt="CAREERATE" className="h-8 w-8" />
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                CAREERATE
              </span>
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#agents" className="text-gray-300 hover:text-white transition-colors">Agents</a>
              <a href="#integrations" className="text-gray-300 hover:text-white transition-colors">Integrations</a>
              <a href="#platform" className="text-gray-300 hover:text-white transition-colors">Platform</a>
              <Button 
                onClick={() => handleOAuthLogin('github')}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20"
              >
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div 
            className="md:hidden bg-black/90 backdrop-blur-lg border-t border-white/10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="px-4 py-6 space-y-4">
              <a href="#agents" className="block text-gray-300 hover:text-white">Agents</a>
              <a href="#integrations" className="block text-gray-300 hover:text-white">Integrations</a>
              <a href="#platform" className="block text-gray-300 hover:text-white">Platform</a>
              <Button 
                onClick={() => handleOAuthLogin('github')}
                className="w-full bg-white/10 hover:bg-white/20"
              >
                Get Started
              </Button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <motion.div 
          className="absolute inset-0 opacity-30"
          style={{ y: backgroundY }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10" />
        </motion.div>

        <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="relative z-20 mt-16"
          >
            <ParticleTextEffect />
          </motion.div>

          <motion.h2 
            className="text-4xl md:text-6xl font-bold mt-8 mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Autonomous DevOps Platform
          </motion.h2>

          <motion.p 
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            Multi-agent orchestration that thinks, communicates, and deploys autonomously. 
            <span className="text-white font-semibold"> Beyond traditional DevOps.</span>
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <Button 
              onClick={() => handleOAuthLogin('github')}
              size="lg"
              className="bg-white text-black hover:bg-gray-200 font-semibold px-8 py-3 text-lg group"
            >
              Start Building 
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-3 text-lg"
            >
              View Demo
            </Button>
          </motion.div>

          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          >
            {integrations.map((integration, index) => (
              <motion.div 
                key={integration.name}
                className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                transition={{ duration: 0.2 }}
              >
                <integration.icon className="h-4 w-4 text-green-400" />
                <div className="text-left">
                  <div className="text-sm font-medium">{integration.name}</div>
                  <div className="text-xs text-green-400">{integration.status}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Agents Section */}
      <section id="agents" className="py-24 relative">
        <motion.div 
          className="max-w-7xl mx-auto px-4"
        >
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4 text-white border-white/30">
              AI Agent Orchestra
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Meet Your Autonomous Team
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Four specialized AI agents working in perfect harmony through our revolutionary A2A protocol
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {agents.map((agent, index) => (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <Card className="bg-white/5 backdrop-blur-sm border-white/10 h-full hover:bg-white/10 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center mb-4`}>
                      <agent.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{agent.name}</h3>
                    <p className="text-gray-300 mb-4 text-sm leading-relaxed">{agent.description}</p>
                    <div className="text-xs text-gray-400 bg-white/5 rounded-md px-2 py-1">
                      {agent.integration}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Platform Section */}
      <section id="platform" className="py-24 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Why Choose CAREERATE
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              The only platform with true multi-agent autonomy and A2A communication protocols
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Workflow,
                title: "A2A Protocol",
                description: "Agents communicate and coordinate autonomously without human intervention"
              },
              {
                icon: TrendingUp,
                title: "Multi-Cloud Native", 
                description: "Deploy across AWS, GCP, and Azure with intelligent cost optimization"
              },
              {
                icon: Shield,
                title: "Zero Downtime",
                description: "Auto-healing infrastructure with predictive monitoring and instant recovery"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-white/10 to-white/5 rounded-xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer 
        className="bg-black/50 backdrop-blur-sm border-t border-white/10 py-12"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: footerVisible ? 1 : 0, y: footerVisible ? 0 : 50 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <img src={careerateLogo} alt="CAREERATE" className="h-8 w-8" />
            <span className="text-2xl font-bold text-white">CAREERATE</span>
          </div>
          <p className="text-gray-400 mb-6">
            The future of autonomous DevOps. Built for the next generation of developers.
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}