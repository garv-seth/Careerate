
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LiquidGlassPanel } from "@/components/ui/liquid-glass";
import { FuturisticBackground } from "@/components/ui/futuristic-background";
import { 
  Boxes, 
  Github, 
  Users, 
  Zap, 
  Shield,
  Cloud,
  Bot,
  ArrowRight,
  CheckCircle,
  Star,
  Globe,
  Cpu,
  Database,
  Network,
  Activity,
  Layers,
  Rocket,
  Target,
  BarChart3,
  Lock,
  Workflow,
  Terminal,
  GitBranch,
  Server,
  Monitor,
  AlertTriangle,
  Menu,
  X
} from "lucide-react";

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Bot,
      title: "Multi-Agent Orchestration",
      description: "Five specialized AI agents work together: Planner analyzes repos, Builder compiles assets, Tester validates code, Deployer manages infrastructure, and Monitor ensures uptime.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Cloud,
      title: "Multi-Cloud Native",
      description: "Seamlessly deploy across AWS, GCP, and Azure with unified management. Intelligent load balancing and cost optimization across providers.",
      color: "from-purple-500 to-violet-500"
    },
    {
      icon: Workflow,
      title: "Visual Workflow Editor",
      description: "Design complex deployment pipelines with our intuitive drag-and-drop interface. Real-time collaboration and version control built-in.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Zero-trust architecture with OAuth2, RBAC, and end-to-end encryption. SOC2 compliant with audit trails for all operations.",
      color: "from-red-500 to-pink-500"
    },
    {
      icon: Activity,
      title: "Autonomous Healing",
      description: "Self-diagnosing infrastructure that automatically resolves issues. Predictive scaling and intelligent failure recovery.",
      color: "from-orange-500 to-yellow-500"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Comprehensive monitoring with custom dashboards, performance insights, and cost optimization recommendations.",
      color: "from-indigo-500 to-blue-500"
    }
  ];

  const agents = [
    {
      name: "Planner Agent",
      role: "Strategic Analyst",
      description: "Analyzes repository structure, dependencies, and deployment requirements to create optimal deployment strategies.",
      capabilities: ["Code Analysis", "Dependency Mapping", "Risk Assessment", "Resource Planning"]
    },
    {
      name: "Builder Agent", 
      role: "Asset Compiler",
      description: "Handles template rendering, asset compilation, and build optimization across multiple environments.",
      capabilities: ["Asset Bundling", "Template Rendering", "Build Optimization", "Cache Management"]
    },
    {
      name: "Tester Agent",
      role: "Quality Assurance",
      description: "Executes comprehensive testing suites including unit, integration, and performance tests.",
      capabilities: ["Automated Testing", "Performance Profiling", "Security Scanning", "Quality Gates"]
    },
    {
      name: "Deployer Agent",
      role: "Infrastructure Manager", 
      description: "Orchestrates deployments across cloud providers with zero-downtime strategies and rollback capabilities.",
      capabilities: ["Blue-Green Deployments", "Canary Releases", "Infrastructure Provisioning", "Rollback Management"]
    },
    {
      name: "Monitor Agent",
      role: "Health Guardian",
      description: "Continuously monitors system health, performance metrics, and automatically responds to incidents.",
      capabilities: ["Health Monitoring", "Incident Response", "Performance Optimization", "Predictive Scaling"]
    }
  ];

  const stats = [
    { value: "99.9%", label: "Uptime SLA" },
    { value: "50%", label: "Faster Deployments" },
    { value: "5", label: "AI Agents" },
    { value: "3", label: "Cloud Providers" }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Futuristic Background */}
      <FuturisticBackground variant="hybrid" className="fixed inset-0 z-0" />
      
      {/* Content Layer */}
      <div className="relative z-10">
        {/* Floating Navigation */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed top-4 left-4 right-4 z-50"
        >
          <nav className="backdrop-blur-xl bg-black/10 border border-white/20 rounded-2xl px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center">
                  <Boxes className="text-white text-lg" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Careerate</h1>
                  <p className="text-xs text-gray-300">Autonomous DevOps Platform</p>
                </div>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-6">
                <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
                <a href="#agents" className="text-gray-300 hover:text-white transition-colors">Agents</a>
                <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
                <div className="flex space-x-3">
                  <Button 
                    onClick={() => window.location.href = "/api/auth/azure"}
                    className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/50"
                    variant="outline"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Azure
                  </Button>
                  <Button 
                    onClick={() => window.location.href = "/api/auth/github"}
                    className="bg-gray-500/20 text-gray-300 hover:bg-gray-500/30 border border-gray-500/50"
                    variant="outline"
                  >
                    <Github className="h-4 w-4 mr-2" />
                    GitHub
                  </Button>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-white"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-4 pt-4 border-t border-white/20"
              >
                <div className="flex flex-col space-y-4">
                  <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
                  <a href="#agents" className="text-gray-300 hover:text-white transition-colors">Agents</a>
                  <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
                  <div className="flex flex-col space-y-2">
                    <Button 
                      onClick={() => window.location.href = "/api/auth/azure"}
                      className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/50 justify-start"
                      variant="outline"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Sign in with Azure
                    </Button>
                    <Button 
                      onClick={() => window.location.href = "/api/auth/github"}
                      className="bg-gray-500/20 text-gray-300 hover:bg-gray-500/30 border border-gray-500/50 justify-start"
                      variant="outline"
                    >
                      <Github className="h-4 w-4 mr-2" />
                      Sign in with GitHub
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </nav>
        </motion.header>

        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-6 pt-24">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
                Autonomous DevOps
              </h1>
              <h2 className="text-3xl md:text-5xl font-bold mb-8 text-white">
                Redefined by AI
              </h2>
              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
                The world's first truly autonomous DevOps platform. Five specialized AI agents orchestrate your entire deployment lifecycle—from code analysis to production monitoring.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                <Button 
                  onClick={() => window.location.href = "/api/auth/azure"}
                  size="lg"
                  className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white px-8 py-6 text-lg font-semibold"
                >
                  <Rocket className="h-5 w-5 mr-2" />
                  Start Your Journey
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button 
                  onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold backdrop-blur-sm"
                >
                  <Monitor className="h-5 w-5 mr-2" />
                  Watch Demo
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                    <div className="text-gray-400 text-sm">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Revolutionary Features
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Built for the future of DevOps with cutting-edge AI and cloud-native architecture
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <LiquidGlassPanel className="p-8 h-full hover:scale-105 transition-transform duration-300">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                  </LiquidGlassPanel>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Agents Section */}
        <section id="agents" className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Meet Your AI Agents
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Five specialized agents working in perfect harmony to revolutionize your DevOps workflow
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {agents.map((agent, index) => (
                <motion.div
                  key={agent.name}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <LiquidGlassPanel className="p-8 h-full">
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{agent.name}</h3>
                        <p className="text-blue-400 font-medium">{agent.role}</p>
                      </div>
                    </div>
                    <p className="text-gray-300 mb-6 leading-relaxed">{agent.description}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {agent.capabilities.map((capability) => (
                        <div key={capability} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                          <span className="text-sm text-gray-300">{capability}</span>
                        </div>
                      ))}
                    </div>
                  </LiquidGlassPanel>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section id="demo" className="py-24 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                See It In Action
              </h2>
              <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
                Watch how our AI agents collaborate to deploy your applications with zero human intervention
              </p>
              
              <LiquidGlassPanel className="p-8 max-w-4xl mx-auto">
                <div className="aspect-video bg-gradient-to-br from-gray-900 to-black rounded-xl flex items-center justify-center border border-gray-700">
                  <div className="text-center">
                    <Monitor className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Interactive Demo Coming Soon</h3>
                    <p className="text-gray-400">Experience the full power of autonomous DevOps</p>
                  </div>
                </div>
              </LiquidGlassPanel>
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Start your autonomous DevOps journey today with our flexible pricing options
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Starter Plan */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <LiquidGlassPanel className="p-8 h-full">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
                    <div className="text-4xl font-bold text-white mb-4">Free</div>
                    <p className="text-gray-400">Perfect for small projects</p>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-gray-300">1 Active Project</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-gray-300">Basic Agent Access</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-gray-300">Community Support</span>
                    </li>
                  </ul>
                  <Button 
                    onClick={() => window.location.href = "/api/auth/github"}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white"
                    variant="outline"
                  >
                    Get Started
                  </Button>
                </LiquidGlassPanel>
              </motion.div>

              {/* Pro Plan */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <LiquidGlassPanel className="p-8 h-full border-2 border-gradient-to-r from-indigo-500 to-violet-500">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
                      <Star className="h-4 w-4" />
                      <span>Most Popular</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                    <div className="text-4xl font-bold text-white mb-4">$49<span className="text-lg text-gray-400">/month</span></div>
                    <p className="text-gray-400">For growing teams</p>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-gray-300">Unlimited Projects</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-gray-300">Full Agent Access</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-gray-300">Multi-Cloud Deployment</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-gray-300">Priority Support</span>
                    </li>
                  </ul>
                  <Button 
                    onClick={() => window.location.href = "/api/auth/azure"}
                    className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white"
                  >
                    Start Pro Trial
                  </Button>
                </LiquidGlassPanel>
              </motion.div>

              {/* Enterprise Plan */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <LiquidGlassPanel className="p-8 h-full">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
                    <div className="text-4xl font-bold text-white mb-4">Custom</div>
                    <p className="text-gray-400">For large organizations</p>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-gray-300">Custom Agent Training</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-gray-300">On-Premise Deployment</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-gray-300">24/7 Dedicated Support</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-gray-300">SLA Guarantees</span>
                    </li>
                  </ul>
                  <Button 
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white"
                    variant="outline"
                  >
                    Contact Sales
                  </Button>
                </LiquidGlassPanel>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-white/10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center">
                  <Boxes className="text-white text-sm" />
                </div>
                <div>
                  <div className="font-bold text-white">Careerate</div>
                  <div className="text-xs text-gray-400">Autonomous DevOps Platform</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <Shield className="h-4 w-4" />
                <span>Enterprise-grade security with OAuth2 and RBAC</span>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/10 text-center text-gray-400 text-sm">
              © 2024 Careerate. Built for the future of autonomous DevOps.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
