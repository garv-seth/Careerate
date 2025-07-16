
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, 
  Bot, 
  Zap, 
  Shield, 
  Layers, 
  Cloud, 
  GitBranch, 
  Activity, 
  Users, 
  Globe, 
  Menu, 
  X, 
  Sparkles, 
  Rocket, 
  Brain, 
  Cpu, 
  Star, 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  MessageSquare, 
  Workflow,
  Monitor,
  Code,
  Server,
  Database,
  Lock,
  BarChart3,
  Clock,
  ChevronDown,
  Github
} from "lucide-react";
import careerateLogo from "@assets/CareerateLogo.png";
import { useAuth } from "@/hooks/useAuth";

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const { user, isAuthenticated, isLoading } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Parallax transforms
  const heroY = useTransform(scrollYProgress, [0, 0.3], ["0%", "-50%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.2], ["0%", "10%"]);

  const handleOAuthLogin = (provider: string) => {
    window.location.href = `/api/auth/${provider}`;
  };

  const handleStartTrial = () => {
    if (isAuthenticated) {
      window.location.href = '/dashboard';
    } else {
      // For demo purposes, simulate authentication by setting localStorage
      localStorage.setItem('demo_auth', 'true');
      localStorage.setItem('demo_user', JSON.stringify({
        id: 'demo-user-123',
        username: 'demo-user',
        name: 'Demo Developer',
        email: 'demo@careerate.dev'
      }));
      window.location.href = '/dashboard';
    }
  };

  const handleWatchDemo = () => {
    // Open YouTube demo in picture-in-picture mode
    const videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Placeholder - replace with actual demo video
    window.open(videoUrl, '_blank', 'width=800,height=600');
  };

  // Close mobile menu when scrolling
  useEffect(() => {
    const handleScroll = () => {
      setMobileMenuOpen(false);
      
      // Update active section based on scroll position
      const sections = ["hero", "competitive", "agents", "features", "integrations", "pricing"];
      const scrollPosition = window.scrollY + 100;
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && scrollPosition >= element.offsetTop && scrollPosition < element.offsetTop + element.offsetHeight) {
          setActiveSection(section);
          break;
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = [
    { value: "99.9%", label: "Uptime SLA", icon: <Activity className="w-4 h-4" /> },
    { value: "5", label: "AI Agents", icon: <Bot className="w-4 h-4" /> },
    { value: "3", label: "Cloud Providers", icon: <Cloud className="w-4 h-4" /> },
    { value: "85%", label: "Cost Reduction", icon: <TrendingUp className="w-4 h-4" /> }
  ];

  const testimonials = [
    {
      quote: "CAREERATE's vibe hosting approach completely transformed our deployment workflow. The agent coordination is seamless.",
      author: "Sarah Chen",
      role: "CTO, TechFlow Inc",
      avatar: "🚀"
    },
    {
      quote: "The autonomous DevOps agents work incredibly well together. Our deployments are faster and more reliable than ever.",
      author: "Marcus Rodriguez", 
      role: "DevOps Lead, CloudScale",
      avatar: "⚡"
    },
    {
      quote: "Reduced our infrastructure costs by 78% while improving reliability. The SRE agents are game-changing.",
      author: "Emily Watson",
      role: "Engineering Director, DataCorp",
      avatar: "🎯"
    }
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white overflow-hidden">
      
      {/* Fixed Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4 lg:p-6">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <img src={careerateLogo} alt="CAREERATE" className="w-10 h-10 rounded-lg" />
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">CAREERATE</span>
              <p className="text-xs text-blue-300">autonomous devops platform</p>
            </div>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            <a href="#competitive" className={`transition-colors ${activeSection === 'competitive' ? 'text-blue-300' : 'text-gray-300 hover:text-white'}`}>
              Why CAREERATE
            </a>
            <a href="#agents" className={`transition-colors ${activeSection === 'agents' ? 'text-blue-300' : 'text-gray-300 hover:text-white'}`}>
              AI Agents
            </a>
            <a href="#features" className={`transition-colors ${activeSection === 'features' ? 'text-blue-300' : 'text-gray-300 hover:text-white'}`}>
              Features
            </a>
            <a href="#integrations" className={`transition-colors ${activeSection === 'integrations' ? 'text-blue-300' : 'text-gray-300 hover:text-white'}`}>
              Integrations
            </a>
            <a href="#pricing" className={`transition-colors ${activeSection === 'pricing' ? 'text-blue-300' : 'text-gray-300 hover:text-white'}`}>
              Pricing
            </a>
            <Button 
              onClick={handleStartTrial}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white border-0"
            >
              {isLoading ? 'Loading...' : isAuthenticated ? 'Dashboard' : 'Start Free Trial'}
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
              <a href="#competitive" className="hover:text-blue-300 transition-colors py-2">Why CAREERATE</a>
              <a href="#agents" className="hover:text-blue-300 transition-colors py-2">AI Agents</a>
              <a href="#features" className="hover:text-blue-300 transition-colors py-2">Features</a>
              <a href="#integrations" className="hover:text-blue-300 transition-colors py-2">Integrations</a>
              <a href="#pricing" className="hover:text-blue-300 transition-colors py-2">Pricing</a>
              <Button 
                onClick={handleStartTrial}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white mt-4"
              >
                {isLoading ? 'Loading...' : isAuthenticated ? 'Dashboard' : 'Start Free Trial'}
              </Button>
            </div>
          </motion.div>
        )}
      </header>

      {/* Hero Section */}
      <motion.section 
        id="hero"
        className="relative min-h-screen flex items-center justify-center pt-20"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
        
        <motion.div 
          className="relative z-20 text-center max-w-6xl mx-auto px-6"
          style={{ y: contentY }}
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <Badge className="mb-6 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 text-blue-200 border-blue-400/40 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Introducing Vibe Hosting • 2025
            </Badge>
            
            <motion.h1 
              className="text-5xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-cyan-300 bg-clip-text text-transparent"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              INTRODUCING
              <br />
              <span className="text-4xl md:text-6xl bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                VIBE HOSTING
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              with DevOps and SRE Agents
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Button 
                onClick={handleStartTrial}
                disabled={isLoading}
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 text-lg group"
              >
                <Rocket className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                {isLoading ? 'Loading...' : isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial'}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button onClick={handleWatchDemo} variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg backdrop-blur-sm">
                <Brain className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                  <div className="flex items-center justify-center mb-2">
                    <div className="text-blue-400">{stat.icon}</div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Cloud Provider OAuth Integrations */}
            <motion.div 
              className="flex flex-wrap justify-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.8 }}
            >
              <Button
                onClick={() => handleOAuthLogin('azure')}
                variant="outline"
                className="flex items-center gap-2 border-blue-400/40 text-blue-300 hover:bg-blue-500/20 backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                <Cloud className="h-4 w-4" />
                Azure
              </Button>
              <Button
                onClick={() => handleOAuthLogin('aws')}
                variant="outline"
                className="flex items-center gap-2 border-orange-400/40 text-orange-300 hover:bg-orange-500/20 backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                <Cloud className="h-4 w-4" />
                AWS
              </Button>
              <Button
                onClick={() => handleOAuthLogin('gcp')}
                variant="outline"
                className="flex items-center gap-2 border-green-400/40 text-green-300 hover:bg-green-500/20 backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                <Cloud className="h-4 w-4" />
                GCP
              </Button>
              <Button
                onClick={() => handleOAuthLogin('github')}
                variant="outline"
                className="flex items-center gap-2 border-purple-400/40 text-purple-300 hover:bg-purple-500/20 backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                <Github className="h-4 w-4" />
                GitHub
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
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
        </motion.div>
      </motion.section>

      {/* Competitive Advantage Section */}
      <section id="competitive" className="py-32 px-6 relative bg-gradient-to-br from-slate-950/90 to-indigo-950/90">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-400 to-transparent"></div>
        
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
              Competitive Analysis • Why We Lead
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-red-300 bg-clip-text text-transparent">
              Beyond StarSling & Monk.io
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              While others offer basic automation, CAREERATE delivers true autonomous intelligence with multi-agent A2A communication.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                name: "StarSling (YC W25)",
                description: "AI-powered Internal Developer Portal",
                features: ["Unified dashboard", "One-click autofix", "Tool integration", "Basic AI assistance"],
                limitations: ["Single-agent approach", "Manual oversight required", "Limited automation", "Human intervention needed"],
                score: "6/10",
                color: "gray"
              },
              {
                name: "Monk.io", 
                description: "Autonomous AI DevOps platform",
                features: ["VS Code integration", "Multi-cloud support", "Token-based pricing", "Basic automation"],
                limitations: ["Basic AI reasoning", "Human intervention needed", "Limited agent collaboration", "No true autonomy"],
                score: "7/10",
                color: "blue"
              },
              {
                name: "CAREERATE",
                description: "Truly Autonomous Multi-Agent DevOps",
                features: ["5 specialized AI agents", "A2A communication protocol", "Complete autonomy", "Self-healing infrastructure", "Predictive optimization"],
                limitations: ["None - Revolutionary technology"],
                score: "10/10",
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
                    
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Overall Score</span>
                        <span className={`font-bold ${index === 2 ? 'text-green-400' : 'text-yellow-400'}`}>
                          {platform.score}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-green-400 font-semibold mb-2">✓ Features</h4>
                        <ul className="space-y-1">
                          {platform.features.map((feature, i) => (
                            <li key={i} className="text-sm text-gray-300 flex items-center">
                              <CheckCircle2 className="w-3 h-3 mr-2 text-green-400 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
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
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Agents Section */}
      <section id="agents" className="py-32 px-6 bg-gradient-to-br from-indigo-950/70 to-purple-950/70">
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
              5 Specialized <br/>
              <span className="text-purple-400">AI Agents</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Our revolutionary A2A protocol enables true autonomous coordination between AI agents, 
              creating an intelligent ecosystem that thinks and acts collectively.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: <Bot className="h-8 w-8" />,
                title: "Planner Agent",
                description: "Analyzes codebases with advanced AI reasoning. Creates optimal deployment strategies accounting for dependencies, performance, and scaling patterns.",
                status: "Analyzing Repository",
                color: "blue",
                metrics: "47 repos analyzed today"
              },
              {
                icon: <Layers className="h-8 w-8" />,
                title: "Builder Agent", 
                description: "Compiles, optimizes, and containerizes applications. Handles multi-stage builds, dependency resolution, and performance optimization automatically.",
                status: "Building Containers",
                color: "purple",
                metrics: "23 builds completed"
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Tester Agent",
                description: "Runs comprehensive testing suites including unit, integration, and security tests. Validates deployments with chaos engineering principles.",
                status: "Running Security Scans",
                color: "green",
                metrics: "156 tests passed"
              },
              {
                icon: <Cloud className="h-8 w-8" />,
                title: "Deployer Agent",
                description: "Orchestrates multi-cloud deployments with intelligent resource allocation. Manages blue-green deployments and rollback strategies.",
                status: "Deploying to AWS",
                color: "orange",
                metrics: "12 environments live"
              },
              {
                icon: <Activity className="h-8 w-8" />,
                title: "Monitor Agent", 
                description: "Provides real-time observability with predictive analytics. Implements auto-healing, anomaly detection, and proactive incident response.",
                status: "Monitoring Systems",
                color: "red",
                metrics: "99.9% uptime achieved"
              },
              {
                icon: <MessageSquare className="h-8 w-8" />,
                title: "A2A Protocol Hub",
                description: "Advanced Agent-to-Agent communication enabling seamless coordination, task delegation, and collaborative problem-solving between all agents.",
                status: "Coordinating Agents",
                color: "yellow",
                metrics: "347 messages/sec"
              }
            ].map((agent, index) => (
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
                    <div className={`text-${agent.color}-400 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      {agent.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">{agent.title}</h3>
                    <p className="text-gray-300 leading-relaxed mb-4">{agent.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Status</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-green-400 text-sm">{agent.status}</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">{agent.metrics}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Live Agent Communication */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-2xl border border-pink-400/20 p-8"
          >
            <h3 className="text-2xl font-bold mb-6 text-center">Live A2A Communication</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-blue-500/20 rounded-lg">
                  <Bot className="h-5 w-5 text-blue-400" />
                  <span className="text-sm">Planner → Builder: "Repository analysis complete, begin containerization"</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-purple-500/20 rounded-lg">
                  <Layers className="h-5 w-5 text-purple-400" />
                  <span className="text-sm">Builder → Tester: "Container ready for validation pipeline"</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-500/20 rounded-lg">
                  <Shield className="h-5 w-5 text-green-400" />
                  <span className="text-sm">Tester → Deployer: "All tests passed, ready for deployment"</span>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-400 mb-2">347</div>
                  <div className="text-sm text-gray-400">Messages/Second</div>
                  <div className="text-xs text-gray-500 mt-1">Autonomous Coordination</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 bg-gradient-to-br from-slate-950/80 to-indigo-950/80">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <Badge className="mb-6 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 text-blue-200 border-blue-400/40">
              <Cpu className="w-4 h-4 mr-2" />
              Enterprise Features
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
              Production-Ready <br/>
              <span className="text-blue-400">Infrastructure</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Server className="h-6 w-6" />,
                title: "Multi-Cloud Orchestration",
                description: "Deploy seamlessly across AWS, GCP, and Azure with intelligent resource optimization and cost management."
              },
              {
                icon: <Database className="h-6 w-6" />,
                title: "Auto-Scaling Infrastructure",
                description: "Dynamic scaling based on traffic patterns and resource utilization with predictive analytics."
              },
              {
                icon: <Lock className="h-6 w-6" />,
                title: "Zero-Trust Security",
                description: "Built-in security scanning, compliance checks, and automated vulnerability remediation."
              },
              {
                icon: <BarChart3 className="h-6 w-6" />,
                title: "Real-Time Analytics",
                description: "Comprehensive observability with custom dashboards, alerting, and performance insights."
              },
              {
                icon: <Clock className="h-6 w-6" />,
                title: "Instant Rollbacks",
                description: "One-click rollbacks with automated health checks and traffic shifting for zero-downtime deployments."
              },
              {
                icon: <Code className="h-6 w-6" />,
                title: "GitOps Integration",
                description: "Native Git integration with automated CI/CD pipelines and branch-based environments."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="text-blue-400 mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="py-32 px-6 bg-gradient-to-br from-indigo-950/60 to-slate-950/60">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-green-300 bg-clip-text text-transparent">
              Native Integrations
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Connect with your existing tools and cloud providers through our secure OAuth integrations.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-16">
            {[
              { icon: <Cloud className="h-8 w-8" />, name: "AWS", color: "text-orange-400" },
              { icon: <Cloud className="h-8 w-8" />, name: "GCP", color: "text-blue-400" },
              { icon: <Cloud className="h-8 w-8" />, name: "Azure", color: "text-blue-300" },
              { icon: <Github className="h-8 w-8" />, name: "GitHub", color: "text-white" },
              { icon: <Layers className="h-8 w-8" />, name: "Kubernetes", color: "text-blue-500" },
              { icon: <Code className="h-8 w-8" />, name: "Terraform", color: "text-purple-400" },
              { icon: <Server className="h-8 w-8" />, name: "Docker", color: "text-blue-400" },
              { icon: <Monitor className="h-8 w-8" />, name: "Datadog", color: "text-purple-500" }
            ].map((integration, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.1 }}
                className="flex flex-col items-center p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className={integration.color}>{integration.icon}</div>
                <span className="mt-2 text-sm font-medium">{integration.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 px-6 bg-gradient-to-br from-slate-950/90 to-purple-950/90">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-yellow-300 bg-clip-text text-transparent">
              Trusted by Industry Leaders
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10"
              >
                <div className="text-4xl mb-4">{testimonial.avatar}</div>
                <p className="text-gray-300 mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 bg-gradient-to-br from-indigo-950/80 to-slate-950/80">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-green-300 bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Start free and scale as you grow. No hidden fees, no vendor lock-in.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "Free",
                description: "Perfect for small teams and side projects",
                features: ["5 deployments/month", "Basic monitoring", "Community support", "1 cloud provider"],
                cta: "Start Free",
                popular: false
              },
              {
                name: "Professional",
                price: "$99/month",
                description: "For growing teams and production workloads",
                features: ["Unlimited deployments", "Advanced monitoring", "Priority support", "All cloud providers", "A2A protocol access", "Custom integrations"],
                cta: "Start Trial",
                popular: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                description: "For large organizations with specific needs",
                features: ["Everything in Professional", "Dedicated support", "On-premise deployment", "Custom SLAs", "Advanced security", "White-label options"],
                cta: "Contact Sales",
                popular: false
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`relative p-8 rounded-2xl border ${plan.popular ? 'bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-blue-400/30 scale-105' : 'bg-white/5 border-white/10'} backdrop-blur-sm`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold mb-4">{plan.price}</div>
                <p className="text-gray-400 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-3 text-green-400" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full ${plan.popular ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500' : 'bg-white/10 hover:bg-white/20'} text-white`}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative bg-gradient-to-br from-slate-950 to-indigo-950">
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
              Join thousands of developers who have already experienced the future of DevOps. 
              Start your free trial today and see the power of autonomous infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                onClick={handleStartTrial}
                disabled={isLoading}
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-10 py-4 text-lg group"
              >
                <Rocket className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                {isLoading ? 'Loading...' : isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial'}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button onClick={handleWatchDemo} variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 px-10 py-4 text-lg backdrop-blur-sm">
                <Brain className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6 bg-gradient-to-br from-slate-950 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img src={careerateLogo} alt="CAREERATE" className="w-8 h-8 rounded-lg" />
                <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">CAREERATE</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                The world's first truly autonomous DevOps platform powered by AI agents.
              </p>
              <div className="text-gray-400 text-sm">
                Made with 💙 in Seattle in 2025
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#agents" className="hover:text-white transition-colors">AI Agents</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#integrations" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 text-sm">
                © 2025 CAREERATE. All rights reserved.
              </div>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Security</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
