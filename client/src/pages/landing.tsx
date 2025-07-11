
import { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThreeHero } from "@/components/ui/three-hero";
import { EnhancedGlass, GlassCard, GlassPanel } from "@/components/ui/enhanced-glass";
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
  X,
  Heart,
  Play,
  Pause,
  TrendingUp,
  Timer,
  Eye,
  Settings
} from "lucide-react";

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Device motion values
  const motionX = useMotionValue(0);
  const motionY = useMotionValue(0);
  const smoothMotionX = useSpring(motionX, { stiffness: 100, damping: 30 });
  const smoothMotionY = useSpring(motionY, { stiffness: 100, damping: 30 });

  // Enhanced animations with device motion support
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      if (event.accelerationIncludingGravity) {
        const { x, y } = event.accelerationIncludingGravity;
        // Normalize values and apply subtle movement
        motionX.set((x || 0) * 2);
        motionY.set((y || 0) * 2);
      }
    };

    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      const { beta, gamma } = event;
      // Beta is front-to-back tilt, gamma is left-to-right tilt
      motionX.set((gamma || 0) * 0.5);
      motionY.set((beta || 0) * 0.5);
    };

    window.addEventListener('scroll', handleScroll);
    
    // Request permission for device motion on iOS 13+
    if (typeof DeviceMotionEvent !== 'undefined' && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      (DeviceMotionEvent as any).requestPermission().then((response: string) => {
        if (response === 'granted') {
          window.addEventListener('devicemotion', handleDeviceMotion);
          window.addEventListener('deviceorientation', handleDeviceOrientation);
        }
      });
    } else {
      window.addEventListener('devicemotion', handleDeviceMotion);
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('devicemotion', handleDeviceMotion);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, [motionX, motionY]);

  const features = [
    {
      icon: Zap,
      title: "Vibe-First Development",
      description: "Built on the foundation of Vibe coding principles - intuitive, collaborative, and lightning-fast development that feels natural and flows with your creative process.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Bot,
      title: "Multi-Agent Orchestration",
      description: "Five specialized AI agents work together: Planner analyzes repos, Builder compiles assets, Tester validates code, Deployer manages infrastructure, and Monitor ensures uptime.",
      color: "from-purple-500 to-violet-500"
    },
    {
      icon: Cloud,
      title: "Multi-Cloud Native",
      description: "Seamlessly deploy across AWS, GCP, and Azure with unified management. Intelligent load balancing and cost optimization across providers.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Workflow,
      title: "Visual Workflow Editor",
      description: "Design complex deployment pipelines with our intuitive drag-and-drop interface. Real-time collaboration and version control built-in.",
      color: "from-red-500 to-pink-500"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Zero-trust architecture with OAuth2, RBAC, and end-to-end encryption. SOC2 compliant with audit trails for all operations.",
      color: "from-orange-500 to-yellow-500"
    },
    {
      icon: Activity,
      title: "Autonomous Healing",
      description: "Self-diagnosing infrastructure that automatically resolves issues. Predictive scaling and intelligent failure recovery.",
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

  const pageVariants = {
    initial: { opacity: 0, scale: 0.95 },
    in: { opacity: 1, scale: 1 },
    out: { opacity: 0, scale: 1.05 }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.8
  };

  return (
    <motion.div 
      className="min-h-screen relative overflow-hidden bg-black"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {/* Three.js Hero Section */}
      <ThreeHero />
      
      {/* Floating Navigation */}
      <motion.header 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-4 left-4 right-4 z-50"
        style={{
          x: smoothMotionX,
          y: smoothMotionY,
        }}
      >
          <motion.nav 
            className={`backdrop-blur-xl border rounded-2xl px-6 py-4 transition-all duration-700 ease-out ${
              isScrolled 
                ? 'bg-black/20 border-white/30' 
                : 'bg-black/10 border-white/20'
            }`}
            whileHover={{ 
              backgroundColor: "rgba(0, 0, 0, 0.25)",
              borderColor: "rgba(255, 255, 255, 0.4)",
              transition: { duration: 0.3 }
            }}
          >
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <motion.div 
                  className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Boxes className="text-white text-lg" />
                </motion.div>
                <div>
                  <h1 className="text-xl font-bold text-white">Careerate</h1>
                  <p className="text-xs text-gray-300">Vibe Hosting Platform</p>
                </div>
              </motion.div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-6">
                {['Features', 'Agents', 'Pricing'].map((item, index) => (
                  <motion.a 
                    key={item}
                    href={`#${item.toLowerCase()}`} 
                    className="text-gray-300 hover:text-white transition-colors"
                    whileHover={{ y: -2, scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ animationDelay: `${0.1 * index}s` }}
                  >
                    {item}
                  </motion.a>
                ))}
                <div className="flex space-x-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      onClick={() => window.location.href = "/api/auth/azure"}
                      className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/50 transition-all duration-300"
                      variant="outline"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Azure
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      onClick={() => window.location.href = "/api/auth/github"}
                      className="bg-gray-500/20 text-gray-300 hover:bg-gray-500/30 border border-gray-500/50 transition-all duration-300"
                      variant="outline"
                    >
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </Button>
                  </motion.div>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-white"
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
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
                  initial={{ opacity: 0, height: 0, y: -20 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="md:hidden mt-4 pt-4 border-t border-white/20 overflow-hidden"
                >
                  <div className="flex flex-col space-y-4">
                    {['Features', 'Agents', 'Pricing'].map((item, index) => (
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
                    <div className="flex flex-col space-y-2">
                      <Button 
                        onClick={() => window.location.href = "/api/auth/azure"}
                        className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/50 justify-start transition-all duration-300"
                        variant="outline"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Sign in with Azure
                      </Button>
                      <Button 
                        onClick={() => window.location.href = "/api/auth/github"}
                        className="bg-gray-500/20 text-gray-300 hover:bg-gray-500/30 border border-gray-500/50 justify-start transition-all duration-300"
                        variant="outline"
                      >
                        <Github className="h-4 w-4 mr-2" />
                        Sign in with GitHub
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.nav>
        </motion.header>

      {/* Features Section */}
      <section id="features" className="relative py-32 px-6 bg-gradient-to-b from-black via-slate-900/20 to-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Autonomous Features
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Built with advanced AI agents that work together to deliver seamless DevOps experiences
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
                <GlassCard className="h-full group cursor-pointer">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300`}>
                    <feature.icon className="text-white text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Agents Section */}
      <section id="agents" className="relative py-32 px-6 bg-gradient-to-b from-black via-slate-800/10 to-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              AI Agent Orchestra
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Five specialized AI agents working in perfect harmony to manage your entire DevOps lifecycle
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {agents.map((agent, index) => (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <GlassPanel className="h-full group cursor-pointer">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-4">
                      <Bot className="text-white text-xl" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{agent.name}</h3>
                      <p className="text-blue-400 text-sm">{agent.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-6 leading-relaxed">{agent.description}</p>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-white mb-3">Capabilities:</h4>
                    <div className="flex flex-wrap gap-2">
                      {agent.capabilities.map((capability, capIndex) => (
                        <Badge
                          key={capIndex}
                          variant="secondary"
                          className="bg-white/10 text-gray-300 border-white/20 hover:bg-white/20 transition-all duration-300"
                        >
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </GlassPanel>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-6 bg-gradient-to-b from-black via-blue-900/10 to-black">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <GlassCard className="group">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-all duration-300">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6 bg-gradient-to-b from-black via-slate-900/20 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Ready to Transform Your DevOps?
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Join the future of autonomous infrastructure management. Start your journey with AI-powered DevOps today.
            </p>
            
            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-12 py-6 text-lg font-medium rounded-full shadow-2xl transition-all duration-300"
                  onClick={() => window.location.href = "/api/auth/azure"}
                >
                  <Rocket className="mr-2 h-5 w-5" />
                  Get Started with Azure
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30 hover:border-white/50 px-12 py-6 text-lg font-medium rounded-full backdrop-blur-sm transition-all duration-300"
                  onClick={() => window.location.href = "/api/auth/github"}
                >
                  <Github className="mr-2 h-5 w-5" />
                  Connect GitHub
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 px-6 bg-gradient-to-b from-black to-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center">
                  <Boxes className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Careerate</h3>
                  <p className="text-gray-400 text-sm">Autonomous DevOps Platform</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                The next evolution of DevOps. Where AI agents orchestrate your infrastructure with precision, 
                delivering seamless deployment experiences across all cloud providers.
              </p>
              <div className="flex space-x-4">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/5 hover:bg-white/10 text-gray-400 border-gray-600 hover:border-gray-400"
                  >
                    <Github className="h-4 w-4" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/5 hover:bg-white/10 text-gray-400 border-gray-600 hover:border-gray-400"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <div className="space-y-2">
                {['Features', 'Agents', 'Pricing', 'Documentation'].map((item) => (
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
              © 2024 Careerate. Built with ❤️ for the future of DevOps.
            </p>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
