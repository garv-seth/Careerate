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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { scrollY } = useScroll();

  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
  const navbarOpacity = useTransform(scrollY, [0, 100], [0.9, 0.98]);

  // Check auth status
  useEffect(() => {
    // Mock auth check - replace with actual auth logic
    const checkAuth = () => {
      // This would be your actual auth check
      setIsLoggedIn(false);
    };
    checkAuth();
  }, []);

  const handleNavigation = () => {
    if (isLoggedIn) {
      // Navigate to dashboard
      window.location.href = '/dashboard';
    } else {
      // Navigate to landing
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">

      {/* Floating Navigation Bar */}
      <header className="fixed top-4 left-4 right-4 z-50">
        <motion.nav 
          className="backdrop-blur-xl bg-black/10 border border-white/20 rounded-2xl shadow-2xl shadow-black/20"
          style={{ opacity: navbarOpacity }}
        >
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <img src={careerateLogo} alt="CAREERATE" className="w-8 h-8 rounded-lg" />
                <span className="text-lg font-bold bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">CAREERATE</span>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-1">
                <div className="flex items-center space-x-1 bg-white/5 rounded-xl p-1 backdrop-blur-sm">
                  <a href="#features" className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
                    Features
                  </a>
                  <a href="#pricing" className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
                    Pricing
                  </a>
                  <a href="#about" className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
                    About
                  </a>
                  <a href="#contact" className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
                    Contact
                  </a>
                </div>
                <Button 
                  onClick={handleNavigation}
                  className="ml-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white px-6 py-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 font-medium"
                >
                  {isLoggedIn ? 'Dashboard' : 'Get Started'}
                </Button>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="text-white hover:bg-white/10 rounded-xl"
                >
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </div>
            </div>
          </div>
        </motion.nav>
      </header>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-24 left-4 right-4 z-40 md:hidden"
        >
          <div className="backdrop-blur-xl bg-black/20 border border-white/20 rounded-2xl shadow-2xl shadow-black/20 px-6 py-6 space-y-2">
            <a href="#features" className="block text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 py-3 px-4 rounded-xl">
              Features
            </a>
            <a href="#pricing" className="block text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 py-3 px-4 rounded-xl">
              Pricing
            </a>
            <a href="#about" className="block text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 py-3 px-4 rounded-xl">
              About
            </a>
            <a href="#contact" className="block text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 py-3 px-4 rounded-xl">
              Contact
            </a>
            <div className="pt-2">
              <Button 
                onClick={handleNavigation}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl font-medium"
              >
                {isLoggedIn ? 'Dashboard' : 'Get Started'}
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Hero Section - Full Height with Top Padding */}
      <section className="relative min-h-screen flex items-center justify-center pt-24">
        <motion.div 
          className="absolute inset-0 opacity-30"
          style={{ y: backgroundY }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10" />
        </motion.div>

        <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
          {/* Particle Text Effect - Main Hero Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="mb-8"
          >
            <ParticleTextEffect words={["CAREERATE"]} />
          </motion.div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="space-y-4"
          >
            <p className="text-xl md:text-2xl text-gray-300 font-light leading-relaxed">
              Next-Generation Autonomous DevOps Platform
            </p>

            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Where AI agents orchestrate your infrastructure with precision and intelligence
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 relative bg-gradient-to-br from-slate-950/80 to-indigo-950/80">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>

        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <Badge className="mb-6 bg-gradient-to-r from-purple-500/30 to-blue-500/30 text-purple-200 border-purple-400/40">
              <Cpu className="w-4 h-4 mr-2" />
              Advanced A2A Agent Architecture
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
              Autonomous DevOps <br/>
              <span className="text-blue-400">Ecosystem</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Five specialized AI agents working in perfect harmony through our proprietary A2A communication protocol. 
              Each agent handles specific aspects of your infrastructure, from planning to monitoring.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Bot className="h-8 w-8" />,
                title: "Planner Agent",
                description: "Analyzes your codebase with advanced AI reasoning. Creates optimal deployment strategies that account for dependencies, performance requirements, and scaling patterns.",
                status: "Next-Gen Intelligence",
                color: "blue"
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Builder Agent", 
                description: "Compiles, optimizes, and containerizes your applications. Handles multi-stage builds, dependency resolution, and performance optimization automatically.",
                status: "Zero Configuration",
                color: "purple"
              },
              {
                icon: <Zap className="h-8 w-8" />,
                title: "Tester Agent",
                description: "Runs comprehensive testing suites including unit, integration, and security tests. Validates deployments with chaos engineering principles.",
                status: "Autonomous Validation", 
                color: "green"
              },
              {
                icon: <Cloud className="h-8 w-8" />,
                title: "Deployer Agent",
                description: "Orchestrates multi-cloud deployments with intelligent resource allocation. Manages blue-green deployments, canary releases, and rollback strategies.",
                status: "Multi-Cloud Native",
                color: "orange"
              },
              {
                icon: <Activity className="h-8 w-8" />,
                title: "Monitor Agent", 
                description: "Provides real-time observability with predictive analytics. Implements auto-healing, anomaly detection, and proactive incident response.",
                status: "Self-Healing",
                color: "red"
              },
              {
                icon: <Workflow className="h-8 w-8" />,
                title: "A2A Protocol",
                description: "Advanced Agent-to-Agent communication protocol enabling seamless coordination, task delegation, and collaborative problem-solving between all agents.",
                status: "Revolutionary",
                color: "yellow"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group"
              >
                <Card className="bg-black/40 border border-white/10 hover:border-white/20 transition-all duration-500 h-full backdrop-blur-sm group-hover:shadow-2xl group-hover:shadow-blue-500/10">
                  <CardContent className="p-6">
                    <div className={`text-${feature.color}-400 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                      <Badge className={`text-xs bg-${feature.color}-500/20 text-${feature.color}-300 border-${feature.color}-400/30`}>
                        {feature.status}
                      </Badge>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Competition Section */}
      <section id="competition" className="py-32 px-6 relative bg-gradient-to-br from-slate-950/90 to-indigo-950/90">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>

        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <Badge className="mb-6 bg-gradient-to-r from-red-500/30 to-yellow-500/30 text-red-200 border-red-400/40">
              <Target className="w-4 h-4 mr-2" />
              Competitive Analysis • Why We Win
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-red-300 bg-clip-text text-transparent">
              Beyond the Competition
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              While StarSling and Monk.io offer basic automation, CAREERATE delivers true autonomous intelligence with multi-agent A2A communication.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                name: "StarSling (YC S25)",
                description: "AI-powered Internal Developer Portal",
                features: ["Unified dashboard", "One-click autofix", "Tool integration"],
                limitations: ["Single-agent approach", "Manual oversight required", "Limited automation"],
                color: "gray"
              },
              {
                name: "Monk.io", 
                description: "Autonomous AI DevOps platform",
                features: ["VS Code integration", "Multi-cloud support", "Token-based pricing"],
                limitations: ["Basic AI reasoning", "Human intervention needed", "Limited agent collaboration"],
                color: "blue"
              },
              {
                name: "CAREERATE",
                description: "Truly Autonomous Multi-Agent DevOps",
                features: ["5 specialized AI agents", "A2A communication protocol", "Vibe coding integration", "Complete autonomy"],
                limitations: [""],
                color: "purple"
              }
            ].map((platform, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`relative ${index === 2 ? 'lg:scale-105' : ''}`}
              >
                <Card className={`${index === 2 ? 'bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-purple-400/30' : 'bg-black/40 border-white/10'} backdrop-blur-sm h-full`}>
                  <CardContent className="p-6">
                    {index === 2 && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          WINNER
                        </Badge>
                      </div>
                    )}
                    <h3 className="text-xl font-bold mb-2">{platform.name}</h3>
                    <p className="text-gray-400 mb-4">{platform.description}</p>

                    <div className="space-y-3">
                      <div>
                        <h4 className="text-green-400 font-semibold mb-2">✓ Features</h4>
                        <ul className="space-y-1">
                          {platform.features.map((feature, i) => (
                            <li key={i} className="text-sm text-gray-300 flex items-center">
                              <CheckCircle2 className="w-3 h-3 mr-2 text-green-400" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {platform.limitations[0] && (
                        <div>
                          <h4 className="text-red-400 font-semibold mb-2">✗ Limitations</h4>
                          <ul className="space-y-1">
                            {platform.limitations.map((limitation, i) => (
                              <li key={i} className="text-sm text-gray-400">
                                • {limitation}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6 bg-gradient-to-br from-slate-950 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <img src={careerateLogo} alt="CAREERATE" className="w-8 h-8 rounded-lg" />
              <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">CAREERATE</span>
            </div>
            <div className="text-gray-400 text-sm text-center md:text-right">
              © 2025 CAREERATE. The future of autonomous DevOps.
              <br />
              <span className="text-purple-400">Powered by A2A Protocol • Built for Vibe Coding</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}