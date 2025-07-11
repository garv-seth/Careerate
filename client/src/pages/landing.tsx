
import { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
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
  X,
  Heart
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
      className="min-h-screen relative overflow-hidden"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {/* Futuristic Background with Hero Overlay */}
      <div className="relative h-screen">
        <FuturisticBackground variant="hybrid" className="absolute inset-0 z-0" />
        
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

        {/* Hero Section - Overlaying the background */}
        <section className="absolute inset-0 flex items-center justify-center px-6 pt-24 z-10">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 1.2, 
                delay: 0.5,
                ease: [0.22, 1, 0.36, 1]
              }}
              style={{
                x: smoothMotionX,
                y: smoothMotionY,
              }}
            >
              <motion.h1 
                className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-400 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                Introducing Vibe Hosting
              </motion.h1>
              <motion.h2 
                className="text-2xl md:text-4xl lg:text-5xl font-bold mb-6 text-white"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
              >
                Autonomous DevOps & SRE
              </motion.h2>
              <motion.p 
                className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.1 }}
              >
                The next evolution of Vibe coding. Where intuitive development meets autonomous infrastructure. 
                Five specialized AI agents orchestrate your entire deployment lifecycle—from code analysis to production monitoring.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.3 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Button 
                    onClick={() => window.location.href = "/api/auth/azure"}
                    size="lg"
                    className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white px-8 py-6 text-lg font-semibold shadow-2xl shadow-indigo-500/25"
                  >
                    <Rocket className="h-5 w-5 mr-2" />
                    Start Your Vibe Journey
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Button 
                    onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold backdrop-blur-sm"
                  >
                    <Monitor className="h-5 w-5 mr-2" />
                    Watch Demo
                  </Button>
                </motion.div>
              </motion.div>

              {/* Stats */}
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
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
      </div>

      {/* Content Layer */}
      <div className="relative z-10 bg-gradient-to-b from-transparent via-black/50 to-black">
        {/* Features Section */}
        <section id="features" className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
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
                  style={{
                    x: smoothMotionX,
                    y: smoothMotionY,
                  }}
                >
                  <LiquidGlassPanel className="p-8 h-full">
                    <motion.div 
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </motion.div>
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
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Meet Your AI Agents
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Five specialized agents working in perfect harmony to revolutionize your development workflow
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {agents.map((agent, index) => (
                <motion.div
                  key={agent.name}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    y: -5,
                    transition: { type: "spring", stiffness: 400, damping: 25 }
                  }}
                  style={{
                    x: smoothMotionX,
                    y: smoothMotionY,
                  }}
                >
                  <LiquidGlassPanel className="p-8 h-full">
                    <div className="flex items-start space-x-4 mb-6">
                      <motion.div 
                        className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0"
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <Bot className="h-6 w-6 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{agent.name}</h3>
                        <p className="text-blue-400 font-medium">{agent.role}</p>
                      </div>
                    </div>
                    <p className="text-gray-300 mb-6 leading-relaxed">{agent.description}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {agent.capabilities.map((capability, capIndex) => (
                        <motion.div 
                          key={capability} 
                          className="flex items-center space-x-2"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + capIndex * 0.05 }}
                          viewport={{ once: true }}
                        >
                          <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                          <span className="text-sm text-gray-300">{capability}</span>
                        </motion.div>
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
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                See Vibe Hosting In Action
              </h2>
              <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
                Watch how our AI agents collaborate to deploy your applications with zero human intervention
              </p>
              
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                style={{
                  x: smoothMotionX,
                  y: smoothMotionY,
                }}
              >
                <LiquidGlassPanel className="p-8 max-w-4xl mx-auto">
                  <div className="aspect-video bg-gradient-to-br from-gray-900 to-black rounded-xl flex items-center justify-center border border-gray-700">
                    <div className="text-center">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          opacity: [0.7, 1, 0.7]
                        }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 2,
                          ease: "easeInOut"
                        }}
                      >
                        <Monitor className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      </motion.div>
                      <h3 className="text-xl font-semibold text-white mb-2">Interactive Demo Coming Soon</h3>
                      <p className="text-gray-400">Experience the full power of Vibe Hosting</p>
                    </div>
                  </div>
                </LiquidGlassPanel>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Start your Vibe Hosting journey today with our flexible pricing options
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Starter Plan */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -10,
                  transition: { type: "spring", stiffness: 400, damping: 25 }
                }}
                style={{
                  x: smoothMotionX,
                  y: smoothMotionY,
                }}
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
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      onClick={() => window.location.href = "/api/auth/github"}
                      className="w-full bg-gray-700 hover:bg-gray-600 text-white transition-all duration-300"
                      variant="outline"
                    >
                      Get Started
                    </Button>
                  </motion.div>
                </LiquidGlassPanel>
              </motion.div>

              {/* Pro Plan */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -15, 
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 400, damping: 25 }
                }}
                style={{
                  x: smoothMotionX,
                  y: smoothMotionY,
                }}
              >
                <LiquidGlassPanel className="p-8 h-full border-2 border-gradient-to-r from-indigo-500 to-violet-500 relative overflow-hidden">
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full opacity-20"></div>
                  <div className="text-center mb-8">
                    <motion.div 
                      className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white px-3 py-1 rounded-full text-sm font-medium mb-4"
                      animate={{ 
                        scale: [1, 1.05, 1],
                        boxShadow: ["0 0 0 0 rgba(99, 102, 241, 0.7)", "0 0 0 10px rgba(99, 102, 241, 0)", "0 0 0 0 rgba(99, 102, 241, 0)"]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 2,
                        ease: "easeInOut"
                      }}
                    >
                      <Star className="h-4 w-4" />
                      <span>Most Popular</span>
                    </motion.div>
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
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      onClick={() => window.location.href = "/api/auth/azure"}
                      className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white transition-all duration-300"
                    >
                      Start Pro Trial
                    </Button>
                  </motion.div>
                </LiquidGlassPanel>
              </motion.div>

              {/* Enterprise Plan */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -10,
                  transition: { type: "spring", stiffness: 400, damping: 25 }
                }}
                style={{
                  x: smoothMotionX,
                  y: smoothMotionY,
                }}
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
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      className="w-full bg-gray-700 hover:bg-gray-600 text-white transition-all duration-300"
                      variant="outline"
                    >
                      Contact Sales
                    </Button>
                  </motion.div>
                </LiquidGlassPanel>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <motion.footer 
          className="py-12 px-6 border-t border-white/10"
          style={{
            x: smoothMotionX,
            y: smoothMotionY,
          }}
        >
          <div className="max-w-6xl mx-auto">
            <motion.div 
              className="flex flex-col md:flex-row items-center justify-between"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >
              <motion.div 
                className="flex items-center space-x-3 mb-4 md:mb-0"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <motion.div 
                  className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Boxes className="text-white text-sm" />
                </motion.div>
                <div>
                  <div className="font-bold text-white">Careerate</div>
                  <div className="text-xs text-gray-400">Vibe Hosting Platform</div>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-6 text-sm text-gray-400"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Shield className="h-4 w-4" />
                <span>Enterprise-grade security with OAuth2 and RBAC</span>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="mt-8 pt-8 border-t border-white/10 text-center text-gray-400 text-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >
              <motion.div 
                className="flex items-center justify-center space-x-1"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <span>© 2025 Careerate. Made with</span>
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2,
                    ease: "easeInOut"
                  }}
                >
                  <Heart className="h-4 w-4 text-blue-400 fill-current" />
                </motion.div>
                <span>in Seattle</span>
              </motion.div>
            </motion.div>
          </div>
        </motion.footer>
      </div>
    </motion.div>
  );
}
