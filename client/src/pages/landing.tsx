import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Bot, Zap, Shield, Layers, Cloud, GitBranch, Activity, Users, Globe, Menu, X, Sparkles, Rocket, Brain, Cpu, Star, Target, TrendingUp, CheckCircle2, MessageSquare, Workflow } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import careerateLogo from "@assets/CareerateLogo.png";

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { login } = useAuth();

  const handleStartTrial = () => {
    login();
  };

  // Navigation items for mobile menu
  const navItems = [
    { name: 'Features', href: '#features' },
    { name: 'Agents', href: '#agents' },
    { name: 'Workflow', href: '#workflow' },
    { name: 'About', href: '#about' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
      
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4 lg:p-6">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <img src={careerateLogo} alt="CAREERATE" className="w-10 h-10 rounded-lg" />
            <div>
              <span className="text-xl font-bold">CAREERATE</span>
              <p className="text-xs text-blue-300">interacting vibe hosting</p>
            </div>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <a key={item.name} href={item.href} className="hover:text-blue-300 transition-colors">
                {item.name}
              </a>
            ))}
            <Button 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10"
              onClick={handleStartTrial}
            >
              Start Free Trial
            </Button>
          </div>

          {/* Mobile Hamburger Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden mt-4 bg-black/90 backdrop-blur-sm rounded-2xl border border-white/10 p-4"
          >
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <a key={item.name} href={item.href} className="hover:text-blue-300 transition-colors py-2">
                  {item.name}
                </a>
              ))}
              <Button 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10 mt-4"
                onClick={handleStartTrial}
              >
                Start Free Trial
              </Button>
            </div>
          </motion.div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="relative z-20 text-center max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <Badge className="mb-6 bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-blue-200 border-blue-400/40 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              2025 • Next-Generation Autonomous DevOps • A2A Protocol
            </Badge>
            
            <motion.h1 
              className="text-5xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              CAREERATE
              <br />
              <span className="text-4xl md:text-6xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                DevOps Platform
              </span>
            </motion.h1>

            <motion.p 
              className="text-xl md:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Introducing <strong>vibe hosting</strong> with DevOps and SRE Agents.
              <br />
              The world's first autonomous multi-agent platform that thinks, communicates, and acts independently.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-2xl"
                onClick={handleStartTrial}
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold"
              >
                Watch Demo
                <Activity className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Revolutionary Features
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Experience the future of DevOps with our cutting-edge agent-based platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Bot,
                title: "AI Agent Orchestra",
                description: "Five specialized AI agents work together seamlessly - Planner, Builder, Tester, Deployer, and Monitor agents."
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Deploy applications in seconds with our optimized agent workflows and intelligent caching."
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                description: "Bank-grade security with end-to-end encryption and compliance with industry standards."
              },
              {
                icon: Cloud,
                title: "Multi-Cloud Native",
                description: "Seamlessly deploy across AWS, GCP, Azure, and other cloud providers with intelligent cost optimization."
              },
              {
                icon: Activity,
                title: "Real-time Monitoring",
                description: "Advanced observability with predictive analytics and auto-healing capabilities."
              },
              {
                icon: Workflow,
                title: "Visual Workflows",
                description: "Drag-and-drop workflow builder with real-time agent communication visualization."
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all duration-300 h-full">
                  <CardContent className="p-6">
                    <feature.icon className="h-12 w-12 text-blue-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                    <p className="text-blue-100">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <img src={careerateLogo} alt="CAREERATE" className="w-8 h-8 rounded-lg" />
            <span className="text-xl font-bold">CAREERATE</span>
          </div>
          <p className="text-blue-200 mb-4">
            Made with 💙 in Seattle in 2025
          </p>
          <p className="text-sm text-blue-300">
            © 2025 CAREERATE. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}