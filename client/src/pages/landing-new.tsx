import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { ThreeHero } from "@/components/ui/three-hero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Bot, Zap, Shield, Layers, Cloud, GitBranch, Activity, Users, Globe, Menu, X, Sparkles, Rocket, Brain, Cpu, Star, Target, TrendingUp, CheckCircle2, MessageSquare, Workflow, Github } from "lucide-react";
import careerateLogo from "@assets/CareerateLogo.png";

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Dynamic horizon effect transforms
  const horizonY = useTransform(scrollYProgress, [0, 1], ["0%", "-100%"]);
  const horizonOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [1, 0.8, 0.5, 0.2]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], ["0%", "20%"]);

  const handleOAuthLogin = (provider: string) => {
    window.location.href = `/api/auth/${provider}`;
  };

  // Close mobile menu when scrolling
  useEffect(() => {
    const handleScroll = () => setMobileMenuOpen(false);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white overflow-hidden">
      
      {/* Fixed Hamburger Navigation */}
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
            <a href="#overview" className="hover:text-blue-300 transition-colors">Platform</a>
            <a href="#agents" className="hover:text-blue-300 transition-colors">Agents</a>
            <a href="#workflow" className="hover:text-blue-300 transition-colors">Workflow</a>
            <a href="#features" className="hover:text-blue-300 transition-colors">Features</a>
            <a href="#competition" className="hover:text-blue-300 transition-colors">Compare</a>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              Get Started
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
              <a href="#overview" className="hover:text-blue-300 transition-colors py-2">Platform</a>
              <a href="#agents" className="hover:text-blue-300 transition-colors py-2">Agents</a>
              <a href="#workflow" className="hover:text-blue-300 transition-colors py-2">Workflow</a>
              <a href="#features" className="hover:text-blue-300 transition-colors py-2">Features</a>
              <a href="#competition" className="hover:text-blue-300 transition-colors py-2">Compare</a>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 mt-4">
                Get Started
              </Button>
            </div>
          </motion.div>
        )}
      </header>

      {/* Dynamic Horizon Hero Section - Single Hero */}
      <motion.section 
        className="relative h-screen flex items-center justify-center"
        style={{ y: horizonY, opacity: horizonOpacity }}
      >
        <ThreeHero />

        {/* Enhanced Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center backdrop-blur-sm">
            <motion.div 
              className="w-1 h-3 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full mt-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <p className="text-xs text-white/60 mt-2 text-center">Scroll to explore</p>
        </motion.div>
      </motion.section>

      {/* Platform Overview Section */}
      <section id="overview" className="py-32 px-6 relative bg-gradient-to-br from-slate-950/95 to-indigo-950/95 backdrop-blur-sm">
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
              <Sparkles className="w-4 h-4 mr-2" />
              Platform Overview • Autonomous Architecture
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
              Truly Autonomous DevOps
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Experience the future where AI agents handle everything from deployment to monitoring, communicating with each other through advanced A2A protocols.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Bot,
                title: "5 Specialized AI Agents",
                description: "Planner, Builder, Tester, Deployer, and Monitor agents work in perfect harmony",
                features: ["Repository Analysis", "Template Rendering", "Automated Testing", "Infrastructure Deployment", "Health Monitoring"],
                color: "blue"
              },
              {
                icon: MessageSquare,
                title: "A2A Communication Protocol",
                description: "Agent-to-Agent communication creates seamless workflows without human intervention",
                features: ["Inter-agent Task Delegation", "Real-time Status Updates", "Autonomous Decision Making", "Error Recovery", "Load Balancing"],
                color: "purple"
              },
              {
                icon: Cloud,
                title: "Multi-Cloud Infrastructure",
                description: "Deploy across AWS, Azure, GCP with intelligent resource optimization",
                features: ["Cost Optimization", "Auto-scaling", "Multi-region Deployment", "Disaster Recovery", "Performance Monitoring"],
                color: "cyan"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group"
              >
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-full hover:bg-white/10 transition-all duration-300 hover:scale-105">
                  <CardContent className="p-8">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${
                      feature.color === 'blue' ? 'from-blue-500 to-blue-600' :
                      feature.color === 'purple' ? 'from-purple-500 to-purple-600' :
                      'from-cyan-500 to-cyan-600'
                    } flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                    <p className="text-gray-300 mb-6 leading-relaxed">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.features.map((feat, i) => (
                        <li key={i} className="flex items-center text-sm text-gray-400">
                          <CheckCircle2 className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent Showcase Section */}
      <section id="agents" className="py-32 px-6 relative bg-gradient-to-br from-indigo-950/95 to-purple-950/95 backdrop-blur-sm">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <Badge className="mb-6 bg-gradient-to-r from-green-500/30 to-purple-500/30 text-green-200 border-green-400/40">
              <Bot className="w-4 h-4 mr-2" />
              AI Agents • Autonomous Intelligence
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
              Meet Your AI Team
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Five specialized agents that think, communicate, and act independently to manage your entire DevOps lifecycle.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-6">
            {[
              {
                name: "Planner Agent",
                icon: Brain,
                description: "Analyzes repositories and creates deployment strategies",
                capabilities: ["Repository Analysis", "Dependency Mapping", "Architecture Planning", "Risk Assessment"],
                color: "blue",
                status: "Planning next deployment"
              },
              {
                name: "Builder Agent",
                icon: Cpu,
                description: "Renders templates and compiles assets",
                capabilities: ["Template Processing", "Asset Compilation", "Build Optimization", "Package Management"],
                color: "green",
                status: "Building application v2.1.3"
              },
              {
                name: "Tester Agent", 
                icon: Shield,
                description: "Runs automated tests and validates deployments",
                capabilities: ["Unit Testing", "Integration Testing", "Security Scanning", "Performance Testing"],
                color: "yellow",
                status: "Running test suite (98% pass)"
              },
              {
                name: "Deployer Agent",
                icon: Rocket,
                description: "Orchestrates infrastructure deployment",
                capabilities: ["Cloud Deployment", "Container Management", "Load Balancing", "Rollback Management"],
                color: "purple",
                status: "Deploying to production"
              },
              {
                name: "Monitor Agent",
                icon: Activity,
                description: "Monitors health and auto-heals issues",
                capabilities: ["Health Monitoring", "Auto-healing", "Alert Management", "Performance Optimization"],
                color: "red",
                status: "All systems healthy ✓"
              }
            ].map((agent, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-full hover:bg-white/10 transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${
                      agent.color === 'blue' ? 'from-blue-500 to-blue-600' :
                      agent.color === 'green' ? 'from-green-500 to-green-600' :
                      agent.color === 'yellow' ? 'from-yellow-500 to-yellow-600' :
                      agent.color === 'purple' ? 'from-purple-500 to-purple-600' :
                      'from-red-500 to-red-600'
                    } flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <agent.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{agent.name}</h3>
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">{agent.description}</p>
                    <div className="space-y-1 mb-4">
                      {agent.capabilities.map((cap, i) => (
                        <div key={i} className="text-xs text-gray-400 flex items-center justify-center">
                          <div className={`w-1 h-1 rounded-full mr-2 ${
                            agent.color === 'blue' ? 'bg-blue-400' :
                            agent.color === 'green' ? 'bg-green-400' :
                            agent.color === 'yellow' ? 'bg-yellow-400' :
                            agent.color === 'purple' ? 'bg-purple-400' :
                            'bg-red-400'
                          }`} />
                          {cap}
                        </div>
                      ))}
                    </div>
                    <div className={`text-xs px-3 py-1 rounded-full ${
                      agent.color === 'blue' ? 'bg-blue-500/20 text-blue-300' :
                      agent.color === 'green' ? 'bg-green-500/20 text-green-300' :
                      agent.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-300' :
                      agent.color === 'purple' ? 'bg-purple-500/20 text-purple-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {agent.status}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Visualization Section */}
      <section id="workflow" className="py-32 px-6 relative bg-gradient-to-br from-purple-950/95 to-slate-950/95 backdrop-blur-sm">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <Badge className="mb-6 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-200 border-cyan-400/40">
              <Workflow className="w-4 h-4 mr-2" />
              Visual Workflows • Real-time Coordination
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
              Watch Agents Collaborate
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Real-time visualization of agent-to-agent communication and task orchestration in our advanced workflow engine.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm p-8">
                <h3 className="text-3xl font-bold text-white mb-6">Interactive Workflow Editor</h3>
                <div className="space-y-4 mb-6">
                  {[
                    "Drag-and-drop workflow creation",
                    "Real-time agent status tracking",
                    "Visual task delegation flows",
                    "Error handling and recovery paths",
                    "Performance metrics and optimization"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center text-gray-300">
                      <CheckCircle2 className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
                <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
                  <Workflow className="mr-2 h-4 w-4" />
                  Try Workflow Editor
                </Button>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
            >
              <div className="text-center mb-4">
                <h4 className="text-lg font-semibold text-white">Live Agent Activity</h4>
                <p className="text-sm text-gray-400">Real-time A2A communication</p>
              </div>
              <div className="space-y-3">
                {[
                  { agent: "Planner", action: "Analyzed repository structure", time: "2s ago", status: "complete" },
                  { agent: "Builder", action: "Compiling assets...", time: "Now", status: "active" },
                  { agent: "Tester", action: "Running security scan", time: "5s ago", status: "active" },
                  { agent: "Monitor", action: "Health check passed", time: "10s ago", status: "complete" }
                ].map((activity, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-3 ${
                        activity.status === 'active' ? 'bg-blue-400 animate-pulse' : 'bg-green-400'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-white">{activity.agent}</p>
                        <p className="text-xs text-gray-400">{activity.action}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Advanced Features Section */}
      <section id="features" className="py-32 px-6 relative bg-gradient-to-br from-slate-950/90 to-purple-950/90 backdrop-blur-sm">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <Badge className="mb-6 bg-gradient-to-r from-yellow-500/30 to-orange-500/30 text-yellow-200 border-yellow-400/40">
              <Star className="w-4 h-4 mr-2" />
              Advanced Features • Production-Ready
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-yellow-300 bg-clip-text text-transparent">
              Enterprise-Grade DevOps
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Built for scale with enterprise security, compliance, and performance features that adapt to your team's needs.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-6 mb-16">
            {[
              {
                icon: Shield,
                title: "Security First",
                description: "End-to-end encryption, SOC2 compliance, and zero-trust architecture",
                highlights: ["Zero-trust security", "SOC2 Type II", "End-to-end encryption", "Audit logs"]
              },
              {
                icon: TrendingUp,
                title: "Auto-Scaling",
                description: "Intelligent resource management that scales with your traffic patterns", 
                highlights: ["Predictive scaling", "Cost optimization", "Load balancing", "Multi-region"]
              },
              {
                icon: Globe,
                title: "Global CDN",
                description: "Edge deployment across 200+ locations for sub-50ms response times",
                highlights: ["200+ edge locations", "Smart routing", "Edge caching", "DDoS protection"]
              },
              {
                icon: Users,
                title: "Team Management",
                description: "Advanced collaboration tools with role-based access control",
                highlights: ["RBAC permissions", "Team workflows", "Audit trails", "SSO integration"]
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-full hover:bg-white/10 transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">{feature.description}</p>
                    <ul className="space-y-1">
                      {feature.highlights.map((highlight, i) => (
                        <li key={i} className="flex items-center text-xs text-gray-400">
                          <div className="w-1 h-1 rounded-full bg-yellow-400 mr-2" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Performance Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid lg:grid-cols-4 gap-8 text-center"
          >
            {[
              { metric: "99.99%", label: "Uptime SLA", sublabel: "Enterprise guarantee" },
              { metric: "<50ms", label: "Response Time", sublabel: "Global average" },
              { metric: "200+", label: "Edge Locations", sublabel: "Worldwide coverage" },
              { metric: "24/7", label: "Expert Support", sublabel: "Always available" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm"
              >
                <div className="text-4xl font-bold text-yellow-400 mb-2">{stat.metric}</div>
                <div className="text-white font-semibold mb-1">{stat.label}</div>
                <div className="text-xs text-gray-400">{stat.sublabel}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Competition Comparison Section with Horizon Line */}
      <section id="competition" className="py-32 px-6 relative bg-gradient-to-br from-slate-950/90 to-indigo-950/90 backdrop-blur-sm">
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
                          <Star className="w-3 h-3 mr-1" />
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

      {/* Features Section with Horizon Elements */}
      <section id="features" className="py-32 px-6 relative bg-gradient-to-br from-slate-950/80 to-indigo-950/80 backdrop-blur-sm">
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
                icon: <Layers className="h-8 w-8" />,
                title: "Builder Agent", 
                description: "Compiles, optimizes, and containerizes your applications. Handles multi-stage builds, dependency resolution, and performance optimization automatically.",
                status: "Zero Configuration",
                color: "purple"
              },
              {
                icon: <Shield className="h-8 w-8" />,
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
                icon: <MessageSquare className="h-8 w-8" />,
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

      {/* A2A Protocol Deep Dive */}
      <section id="agents" className="py-32 px-6 bg-gradient-to-br from-indigo-950/70 to-purple-950/70 backdrop-blur-sm">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <Badge className="mb-6 bg-gradient-to-r from-pink-500/30 to-purple-500/30 text-pink-200 border-pink-400/40">
              <Workflow className="w-4 h-4 mr-2" />
              A2A Communication Protocol
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
              Multi-Agent <br/>
              <span className="text-purple-400">Orchestration</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Our revolutionary A2A (Agent-to-Agent) protocol enables true autonomous coordination between AI agents, 
              creating an intelligent ecosystem that thinks and acts collectively.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GitBranch className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Intelligent Task Distribution</h3>
                    <p className="text-gray-300 leading-relaxed">Agents autonomously delegate tasks based on capabilities, current workload, and optimal resource utilization. No human orchestration required.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Collaborative Problem Solving</h3>
                    <p className="text-gray-300 leading-relaxed">When issues arise, agents collaborate in real-time, sharing context and developing solutions collectively through advanced reasoning protocols.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Multi-Cloud Intelligence</h3>
                    <p className="text-gray-300 leading-relaxed">Agents coordinate across AWS, GCP, and Azure, optimizing costs, performance, and reliability through intelligent cloud orchestration.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Continuous Learning</h3>
                    <p className="text-gray-300 leading-relaxed">The agent ecosystem learns from every deployment, building organizational knowledge that improves decision-making over time.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-2xl p-8 border border-white/10 backdrop-blur-sm">
                <h4 className="text-lg font-semibold mb-6 text-center text-blue-300">Live Agent Status</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                    <div className="flex items-center space-x-3">
                      <Bot className="h-5 w-5 text-blue-400" />
                      <span className="text-blue-300 font-medium">Planner Agent</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm">Analyzing Repository</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-purple-500/20 rounded-lg border border-purple-500/30">
                    <div className="flex items-center space-x-3">
                      <Layers className="h-5 w-5 text-purple-400" />
                      <span className="text-purple-300 font-medium">Builder Agent</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      <span className="text-yellow-400 text-sm">Building Containers</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                    <div className="flex items-center space-x-3">
                      <Cloud className="h-5 w-5 text-green-400" />
                      <span className="text-green-300 font-medium">Deployer Agent</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-blue-400 text-sm">Awaiting Tasks</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-orange-500/20 rounded-lg border border-orange-500/30">
                    <div className="flex items-center space-x-3">
                      <Activity className="h-5 w-5 text-orange-400" />
                      <span className="text-orange-300 font-medium">Monitor Agent</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm">Monitoring Systems</span>
                    </div>
                  </div>
                </div>
                
                {/* A2A Communication Indicator */}
                <div className="mt-6 p-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-lg border border-pink-400/20">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-pink-400" />
                    <span className="text-pink-300 font-medium text-sm">A2A Protocol Active</span>
                  </div>
                  <div className="text-xs text-gray-400 text-center">
                    Agents exchanging 47 messages/sec
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section with Horizon Effect */}
      <section className="py-32 px-6 relative bg-gradient-to-br from-slate-950 to-indigo-950">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-6 bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-blue-200 border-blue-400/40">
              <Rocket className="w-4 h-4 mr-2" />
              Join the Autonomous Revolution
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
              Ready for True <br/>
              <span className="text-blue-400">Autonomy</span>?
            </h2>
            <p className="text-xl text-gray-300 mb-12 leading-relaxed">
              Join the future of DevOps with AI agents that think, communicate, and act independently. 
              Experience vibe coding meets autonomous infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 text-lg group">
                <Rocket className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 px-10 py-4 text-lg backdrop-blur-sm">
                <Brain className="mr-2 h-5 w-5" />
                Book Live Demo
              </Button>
            </div>

            {/* Performance Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16"
            >
              {[
                { value: "99.9%", label: "Uptime" },
                { value: "10x", label: "Faster Deployments" },
                { value: "85%", label: "Cost Reduction" },
                { value: "0", label: "Manual Intervention" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer with Horizon Elements */}
      <footer className="border-t border-white/10 py-12 px-6 bg-gradient-to-br from-slate-950 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <img src={careerateLogo} alt="CAREERATE" className="w-8 h-8 rounded-lg" />
              <div>
                <span className="text-xl font-bold">CAREERATE</span>
                <p className="text-xs text-blue-300">interacting vibe hosting</p>
              </div>
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