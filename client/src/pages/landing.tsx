import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ThreeHero } from '@/components/ui/three-hero';
import { GlassCard, GlassPanel, GlassButton } from '@/components/ui/enhanced-glass';
import {
  Bot,
  Cloud,
  Shield,
  Activity,
  Workflow,
  Zap,
  Users,
  Github,
  Menu,
  X,
  ChevronRight,
  Play,
  CheckCircle,
  Star,
  Monitor,
  Lock,
  Globe,
  Cpu,
  Database,
  GitBranch
} from 'lucide-react';

// Agent types for the autonomous DevOps platform
const agents = [
  {
    name: "Planner Agent",
    type: "planner",
    description: "Analyzes your repository and generates comprehensive deployment plans with optimal resource allocation.",
    capabilities: ["analyze-repo", "generate-plan", "cost-optimization"],
    status: "active",
    icon: Bot,
    color: "from-blue-500 to-cyan-500"
  },
  {
    name: "Builder Agent", 
    type: "builder",
    description: "Renders templates, compiles assets, and builds container images with enterprise-grade security.",
    capabilities: ["render-templates", "compile-assets", "docker-build"],
    status: "building",
    icon: Workflow,
    color: "from-purple-500 to-pink-500"
  },
  {
    name: "Tester Agent",
    type: "tester", 
    description: "Runs comprehensive test suites, security audits, and performance benchmarks.",
    capabilities: ["unit-tests", "security-scans", "load-testing"],
    status: "active",
    icon: Shield,
    color: "from-green-500 to-emerald-500"
  },
  {
    name: "Deployer Agent",
    type: "deployer",
    description: "Orchestrates deployments across AWS, GCP, and Azure with zero-downtime strategies.",
    capabilities: ["k8s-deploy", "serverless-deploy", "multi-cloud"],
    status: "deploying",
    icon: Cloud,
    color: "from-orange-500 to-red-500"
  },
  {
    name: "Monitor Agent",
    type: "monitor",
    description: "Provides real-time health monitoring, auto-healing, and intelligent alerting.",
    capabilities: ["health-check", "auto-heal", "smart-alerts"],
    status: "monitoring",
    icon: Activity,
    color: "from-yellow-500 to-orange-500"
  }
];

// Cloud providers with OAuth integration
const cloudProviders = [
  {
    name: "AWS",
    description: "Enterprise-grade infrastructure with CDK modules",
    services: ["ECS", "EKS", "Lambda", "RDS"],
    authUrl: "/api/auth/aws",
    icon: "🟧",
    status: "connected"
  },
  {
    name: "Google Cloud",
    description: "Serverless-first with advanced AI/ML capabilities", 
    services: ["GKE", "Cloud Run", "BigQuery", "Vertex AI"],
    authUrl: "/api/auth/gcp",
    icon: "🔵",
    status: "connected"
  },
  {
    name: "Azure",
    description: "Hybrid cloud with seamless Microsoft integrations",
    services: ["AKS", "Container Apps", "Cosmos DB", "Cognitive Services"],
    authUrl: "/api/auth/azure",
    icon: "🔷",
    status: "connected"
  }
];

// Platform features
const features = [
  {
    title: "Autonomous Multi-Agent Core",
    description: "Five specialized AI agents work in perfect harmony using A2A protocol for secure inter-agent messaging.",
    icon: Bot,
    color: "from-blue-500 to-purple-500"
  },
  {
    title: "Multi-Cloud Infrastructure",
    description: "Deploy seamlessly across AWS, GCP, and Azure with intelligent cost optimization.",
    icon: Cloud,
    color: "from-purple-500 to-pink-500"
  },
  {
    title: "Self-Healing Systems",
    description: "Automatic issue detection, rollback capabilities, and proactive maintenance.",
    icon: Shield,
    color: "from-green-500 to-blue-500"
  },
  {
    title: "Real-Time Observability",
    description: "Comprehensive monitoring with Datadog, Prometheus, and custom metrics.",
    icon: Activity,
    color: "from-orange-500 to-red-500"
  },
  {
    title: "GitOps Workflows",
    description: "Infrastructure as code with automated CI/CD pipelines and secure rollbacks.",
    icon: GitBranch,
    color: "from-yellow-500 to-orange-500"
  },
  {
    title: "Enterprise Security", 
    description: "Zero-trust architecture with comprehensive auth workflows and compliance.",
    icon: Lock,
    color: "from-indigo-500 to-purple-500"
  }
];

// Stats for the platform
const stats = [
  { value: "99.9%", label: "Uptime SLA" },
  { value: "50ms", label: "Avg Response" },
  { value: "24/7", label: "AI Monitoring" },
  { value: "3 Clouds", label: "Multi-Cloud" }
];

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeAgent, setActiveAgent] = useState(0);

  // Auto-cycle through agents
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAgent((prev) => (prev + 1) % agents.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Three.js Background */}
      <ThreeHero />
      
      {/* Header */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <GlassPanel className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                CAREERATE
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {['Agents', 'Features', 'Cloud', 'Pricing'].map((item, index) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-gray-300 hover:text-white transition-colors relative"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {item}
                </motion.a>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <GlassButton
                onClick={() => window.location.href = "/api/auth/azure"}
                className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/50"
                variant="outline"
              >
                <Users className="h-4 w-4 mr-2" />
                Azure SSO
              </GlassButton>
              <GlassButton
                onClick={() => window.location.href = "/api/auth/github"}
                className="bg-gray-500/20 text-gray-300 hover:bg-gray-500/30 border border-gray-500/50"
                variant="outline"
              >
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </GlassButton>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white"
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="md:hidden mt-6 pt-6 border-t border-white/20 overflow-hidden"
              >
                <div className="flex flex-col space-y-4">
                  {['Agents', 'Features', 'Cloud', 'Pricing'].map((item, index) => (
                    <motion.a
                      key={item}
                      href={`#${item.toLowerCase()}`}
                      className="text-gray-300 hover:text-white transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 10 }}
                    >
                      {item}
                    </motion.a>
                  ))}
                  <div className="flex flex-col space-y-2 pt-4">
                    <GlassButton
                      onClick={() => window.location.href = "/api/auth/azure"}
                      className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/50 justify-start"
                      variant="outline"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Azure SSO
                    </GlassButton>
                    <GlassButton
                      onClick={() => window.location.href = "/api/auth/github"}
                      className="bg-gray-500/20 text-gray-300 hover:bg-gray-500/30 border border-gray-500/50 justify-start"
                      variant="outline"
                    >
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </GlassButton>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassPanel>
      </motion.header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24">
        <div className="text-center max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.h1 
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              CAREERATE
            </motion.h1>
            
            <motion.h2 
              className="text-2xl md:text-4xl lg:text-5xl font-light mb-8 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              Autonomous DevOps & Hosting Platform
            </motion.h2>
            
            <motion.p 
              className="text-lg md:text-xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
            >
              Five specialized AI agents orchestrate your entire development lifecycle—from code analysis to production monitoring. 
              Deploy across AWS, GCP, and Azure with zero-downtime, self-healing infrastructure.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.3 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <GlassButton
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 px-8 py-6 text-lg font-semibold"
                  onClick={() => window.location.href = "/api/auth/azure"}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Your Journey
                  <ChevronRight className="h-5 w-5 ml-2" />
                </GlassButton>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <GlassButton
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold"
                  onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Monitor className="h-5 w-5 mr-2" />
                  Watch Demo
                </GlassButton>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.5 }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.7 + index * 0.1 }}
                  whileHover={{ 
                    scale: 1.1, 
                    y: -5,
                    transition: { type: "spring", stiffness: 400, damping: 25 }
                  }}
                >
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Agents Section */}
      <section id="agents" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Meet Your AI Agents
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Five specialized agents working in perfect harmony using the A2A protocol for secure, high-throughput messaging
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {agents.map((agent, index) => (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="cursor-pointer"
                onClick={() => setActiveAgent(index)}
              >
                <GlassCard className="p-8 h-full border-2 border-transparent hover:border-white/20 transition-all duration-300">
                  <div className="flex items-start space-x-4 mb-6">
                    <motion.div 
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${agent.color} flex items-center justify-center flex-shrink-0`}
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <agent.icon className="h-8 w-8 text-white" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{agent.name}</h3>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-4 ${
                        agent.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        agent.status === 'building' ? 'bg-yellow-500/20 text-yellow-400' :
                        agent.status === 'deploying' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          agent.status === 'active' ? 'bg-green-400 animate-pulse' :
                          agent.status === 'building' ? 'bg-yellow-400 animate-pulse' :
                          agent.status === 'deploying' ? 'bg-blue-400 animate-pulse' :
                          'bg-purple-400 animate-pulse'
                        }`} />
                        {agent.status}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-6 leading-relaxed">{agent.description}</p>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-white uppercase tracking-wide">Capabilities</h4>
                    <div className="flex flex-wrap gap-2">
                      {agent.capabilities.map((capability) => (
                        <span
                          key={capability}
                          className="px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300 backdrop-blur-sm"
                        >
                          {capability}
                        </span>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cloud Providers Section */}
      <section id="cloud" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Multi-Cloud Infrastructure
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Seamlessly deploy across AWS, Google Cloud, and Azure with intelligent cost optimization and unified management
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cloudProviders.map((provider, index) => (
              <motion.div
                key={provider.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <GlassCard className="p-8 h-full text-center">
                  <div className="text-6xl mb-6">{provider.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-4">{provider.name}</h3>
                  <p className="text-gray-300 mb-6">{provider.description}</p>
                  
                  <div className="space-y-4 mb-8">
                    <h4 className="text-sm font-semibold text-white uppercase tracking-wide">Services</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {provider.services.map((service) => (
                        <div
                          key={service}
                          className="px-3 py-2 bg-white/10 rounded-lg text-sm text-gray-300 backdrop-blur-sm"
                        >
                          {service}
                        </div>
                      ))}
                    </div>
                  </div>

                  <GlassButton
                    onClick={() => window.location.href = provider.authUrl}
                    className={`w-full ${
                      provider.status === 'connected' 
                        ? 'bg-green-500/20 text-green-400 border-green-500/50' 
                        : 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                    }`}
                    variant="outline"
                  >
                    {provider.status === 'connected' ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Connected
                      </>
                    ) : (
                      <>
                        <Globe className="h-4 w-4 mr-2" />
                        Connect {provider.name}
                      </>
                    )}
                  </GlassButton>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Revolutionary Features
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Built for the future of development with cutting-edge AI and cloud-native architecture
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -10, 
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 400, damping: 25 }
                }}
              >
                <GlassCard className="p-8 h-full">
                  <motion.div 
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <feature.icon className="h-8 w-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-24 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
              See CAREERATE in Action
            </h2>
            <p className="text-xl text-gray-300 mb-12">
              Watch how our autonomous agents transform your development workflow
            </p>
            
            <motion.div 
              className="relative aspect-video bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl p-8 backdrop-blur-sm border border-white/10"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.button
                  className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30"
                  whileHover={{ scale: 1.1, bg: "rgba(255,255,255,0.3)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="h-8 w-8 text-white ml-1" />
                </motion.button>
              </div>
              <div className="absolute bottom-4 left-4 text-left">
                <div className="text-white font-semibold">Live Demo</div>
                <div className="text-gray-300 text-sm">Multi-Agent Deployment in Action</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  CAREERATE
                </span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                The next evolution of DevOps. Where autonomous AI agents meet enterprise-grade infrastructure management.
              </p>
              <div className="flex space-x-4">
                <motion.a
                  href="https://github.com/careerate"
                  className="text-gray-400 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                >
                  <Github className="h-6 w-6" />
                </motion.a>
                <motion.a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                >
                  <Users className="h-6 w-6" />
                </motion.a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <div className="space-y-2">
                {['Agents', 'Features', 'Cloud', 'Pricing', 'Documentation'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="block text-gray-400 hover:text-white transition-colors"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <div className="space-y-2">
                {['Help Center', 'Community', 'Status', 'Contact'].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="block text-gray-400 hover:text-white transition-colors"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 CAREERATE. Autonomous DevOps for the future.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}