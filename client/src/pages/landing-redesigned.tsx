
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
  const navbarOpacity = useTransform(scrollY, [0, 100], [0.8, 0.95]);

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

  const handleGetStarted = () => {
    if (isLoggedIn) {
      window.location.href = '/dashboard';
    } else {
      // Handle sign up/login
      window.location.href = '/auth/signup';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      
      {/* Floating Glass Navbar - Always Visible */}
      <motion.header 
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-6xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <nav className="bg-white/[0.08] backdrop-blur-3xl border border-white/[0.15] rounded-2xl px-6 py-3 shadow-2xl" style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.10) 100%)',
          backdropFilter: 'blur(60px) saturate(200%) contrast(140%) brightness(120%)',
          WebkitBackdropFilter: 'blur(60px) saturate(200%) contrast(140%) brightness(120%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 4px 16px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.25)',
          borderImage: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1)) 1'
        }}>
          <div className="flex items-center justify-between">
            {/* Logo Section - Left */}
            <motion.div 
              className="flex items-center space-x-3 cursor-pointer"
              onClick={handleNavigation}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <img src={careerateLogo} alt="Careerate" className="w-14 h-14 rounded-lg" />
              <span className="text-xl font-bold text-white/90 tracking-wide">
                Careerate
              </span>
            </motion.div>
            
            {/* Desktop Navigation - Center */}
            <div className="hidden lg:flex items-center space-x-8">
              <a href="#features" className="text-white/70 hover:text-white transition-colors font-medium text-sm">Features</a>
              <a href="#agents" className="text-white/70 hover:text-white transition-colors font-medium text-sm">Agents</a>
              <a href="#workflow" className="text-white/70 hover:text-white transition-colors font-medium text-sm">Workflow</a>
              <a href="#pricing" className="text-white/70 hover:text-white transition-colors font-medium text-sm">Pricing</a>
            </div>

            {/* Dynamic CTA Buttons - Right side */}
            <div className="flex items-center space-x-3">
              {isLoggedIn ? (
                <>
                  <Button
                    onClick={() => window.location.href = '/dashboard'}
                    className="bg-blue-600/80 hover:bg-blue-600 text-white border-0 px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 group text-sm"
                  >
                    Dashboard
                    <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    onClick={() => {
                      // Handle logout
                      setIsLoggedIn(false);
                      window.location.href = '/';
                    }}
                    variant="ghost"
                    className="text-white/70 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => window.location.href = '/auth/signin'}
                    variant="ghost"
                    className="text-white/70 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={handleGetStarted}
                    className="bg-white/15 hover:bg-white/25 text-white border border-white/20 hover:border-white/30 px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 group text-sm backdrop-blur-sm"
                  >
                    Start Building
                    <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-white/80 hover:bg-white/10 hover:text-white border border-white/20 rounded-lg p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu - Floating */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="lg:hidden mt-2 bg-white/[0.08] backdrop-blur-3xl border border-white/[0.15] rounded-xl p-4 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.10) 100%)',
              backdropFilter: 'blur(60px) saturate(200%) contrast(140%) brightness(120%)',
              WebkitBackdropFilter: 'blur(60px) saturate(200%) contrast(140%) brightness(120%)',
            }}
          >
            <div className="flex flex-col space-y-3">
              <a href="#features" className="text-white/70 hover:text-white transition-colors py-2 font-medium text-sm">Features</a>
              <a href="#agents" className="text-white/70 hover:text-white transition-colors py-2 font-medium text-sm">Agents</a>
              <a href="#workflow" className="text-white/70 hover:text-white transition-colors py-2 font-medium text-sm">Workflow</a>
              <a href="#pricing" className="text-white/70 hover:text-white transition-colors py-2 font-medium text-sm">Pricing</a>
              <div className="border-t border-white/15 pt-3 mt-3">
                {isLoggedIn ? (
                  <div className="flex flex-col space-y-2">
                    <Button
                      onClick={() => window.location.href = '/dashboard'}
                      className="bg-blue-600/80 hover:bg-blue-600 text-white w-full justify-center"
                    >
                      Dashboard
                    </Button>
                    <Button
                      onClick={() => {
                        setIsLoggedIn(false);
                        window.location.href = '/';
                      }}
                      variant="ghost"
                      className="text-white/70 hover:text-white w-full"
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Button
                      onClick={() => window.location.href = '/auth/signin'}
                      variant="ghost"
                      className="text-white/70 hover:text-white w-full"
                    >
                      Sign In
                    </Button>
                    <Button
                      onClick={handleGetStarted}
                      className="bg-white/15 hover:bg-white/25 text-white border border-white/20 w-full justify-center"
                    >
                      Start Building
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </motion.header>

      {/* Hero Section - Centered */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <motion.div 
          className="absolute inset-0 opacity-30"
          style={{ y: backgroundY }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10" />
        </motion.div>

        <div className="relative z-10 text-center max-w-6xl mx-auto px-4 pt-32">
          {/* Particle Text Effect - Hero Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="mb-12"
          >
            <ParticleTextEffect words={["INTRODUCING", "VIBE", "HOSTING"]} />
          </motion.div>

          {/* Simple Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-lg text-gray-400 mb-8"
          >
            Next-Generation Autonomous DevOps Platform
          </motion.p>

          <motion.h2 
            className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            Multi-agent orchestration that thinks,<br />
            communicates, and deploys autonomously.
          </motion.h2>

          <motion.p 
            className="text-lg md:text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            Experience the future of DevOps with AI agents that collaborate, 
            reason, and execute complex deployments without human intervention.
            <span className="text-purple-300 font-semibold"> Beyond traditional DevOps.</span>
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          >
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg group shadow-2xl"
              onClick={handleGetStarted}
            >
              <Bot className="mr-2 h-5 w-5 group-hover:animate-pulse" />
              Deploy with AI Agents
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg backdrop-blur-sm"
            >
              <Brain className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Performance Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            {[
              { value: "99.9%", label: "Uptime" },
              { value: "10x", label: "Faster Deployments" },
              { value: "85%", label: "Cost Reduction" },
              { value: "0", label: "Manual Intervention" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-blue-400 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 relative bg-gradient-to-br from-slate-950/80 to-indigo-950/80">
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent blur-sm"></div>
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-blue-400/60 to-transparent"></div>
        
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
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
              Autonomous DevOps <br/>
              <span className="text-blue-400">Ecosystem</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Five specialized AI agents working in perfect harmony through our proprietary A2A communication protocol.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Bot className="h-8 w-8" />,
                title: "Planner Agent",
                description: "Analyzes your codebase and creates optimal deployment strategies.",
                color: "blue"
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Security Agent", 
                description: "Continuously monitors and secures your infrastructure.",
                color: "green"
              },
              {
                icon: <Cloud className="h-8 w-8" />,
                title: "Deployer Agent",
                description: "Orchestrates multi-cloud deployments with intelligence.",
                color: "purple"
              },
              {
                icon: <Activity className="h-8 w-8" />,
                title: "Monitor Agent", 
                description: "Real-time observability with predictive analytics.",
                color: "orange"
              },
              {
                icon: <Workflow className="h-8 w-8" />,
                title: "Optimizer Agent",
                description: "Continuously optimizes performance and costs.",
                color: "cyan"
              },
              {
                icon: <Brain className="h-8 w-8" />,
                title: "A2A Protocol",
                description: "Advanced Agent-to-Agent communication for coordination.",
                color: "pink"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group"
              >
                <Card className="bg-black/40 border border-white/10 hover:border-white/20 transition-all duration-500 h-full backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className={`text-${feature.color}-400 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
