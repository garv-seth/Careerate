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

  // Scroll-based content transitions for 5 sections
  const section1Progress = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const section2Progress = useTransform(scrollYProgress, [0.2, 0.4], [0, 1]);
  const section3Progress = useTransform(scrollYProgress, [0.4, 0.6], [0, 1]);
  const section4Progress = useTransform(scrollYProgress, [0.6, 0.8], [0, 1]);
  const section5Progress = useTransform(scrollYProgress, [0.8, 1], [0, 1]);

  // Dynamic text and content based on scroll position
  const [currentSection, setCurrentSection] = useState(0);
  
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      if (latest < 0.2) setCurrentSection(0);
      else if (latest < 0.4) setCurrentSection(1);
      else if (latest < 0.6) setCurrentSection(2);
      else if (latest < 0.8) setCurrentSection(3);
      else setCurrentSection(4);
    });
    return unsubscribe;
  }, [scrollYProgress]);

  const handleDemoClick = () => {
    // Open YouTube demo video in picture-in-picture or modal
    window.open('https://www.youtube.com/watch?v=demo-video', '_blank');
  };

  const handleAuthLogin = () => {
    // Navigate to Azure B2C authentication
    window.location.href = '/api/auth/azure';
  };

  // Close mobile menu when scrolling
  useEffect(() => {
    const handleScroll = () => setMobileMenuOpen(false);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Section content configuration following vibe hosting principles
  const sections = [
    {
      title: "CAREERATE",
      subtitle: "Agentic DevOps Platform",
      description: "Where AI agents think, communicate, and deploy with vibe hosting principles",
      badge: "Introducing Vibe Hosting",
      color: "white"
    },
    {
      title: "5 AI Agents",
      subtitle: "Working in Harmony",
      description: "Planner • Builder • Tester • Deployer • Monitor agents collaborate through A2A protocols",
      badge: "Agent Coordination",
      color: "blue"
    },
    {
      title: "Vibe Hosting",
      subtitle: "Beyond Traditional DevOps",
      description: "Embrace the vibes, accept exponentials, forget infrastructure complexity",
      badge: "Revolutionary Approach",
      color: "purple"
    },
    {
      title: "Real-Time Workflow",
      subtitle: "Visual Agent Communication",
      description: "Watch agents collaborate, delegate tasks, and heal issues autonomously",
      badge: "Live Coordination",
      color: "cyan"
    },
    {
      title: "Ready to Deploy?",
      subtitle: "Start Your Agentic Journey",
      description: "Experience the future of DevOps with intelligent agents and vibe hosting",
      badge: "Get Started",
      color: "green"
    }
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white overflow-hidden">
      
      {/* Fixed Hamburger Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4 lg:p-6">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <img src={careerateLogo} alt="CAREERATE" className="w-10 h-10 rounded-lg" />
            <div>
              <span className="text-xl font-bold">CAREERATE</span>
            </div>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            <a href="#vibe-hosting" className="hover:text-blue-300 transition-colors">Vibe Hosting</a>
            <a href="#agents" className="hover:text-blue-300 transition-colors">AI Agents</a>
            <a href="#workflow" className="hover:text-blue-300 transition-colors">Workflow</a>
            <Button variant="outline" onClick={handleDemoClick} className="border-gray-400/40 text-gray-300 hover:bg-gray-800/40">
              <GitBranch className="mr-2 h-4 w-4" />
              Connect GitHub
            </Button>
            <Button onClick={handleAuthLogin} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              Launch Platform
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
              <a href="#vibe-hosting" className="hover:text-blue-300 transition-colors py-2">Vibe Hosting</a>
              <a href="#agents" className="hover:text-blue-300 transition-colors py-2">AI Agents</a>
              <a href="#workflow" className="hover:text-blue-300 transition-colors py-2">Workflow</a>
              <Button variant="outline" onClick={handleDemoClick} className="border-gray-400/40 text-gray-300 hover:bg-gray-800/40 mt-4">
                <GitBranch className="mr-2 h-4 w-4" />
                Connect GitHub
              </Button>
              <Button onClick={handleAuthLogin} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Launch Platform
              </Button>
            </div>
          </motion.div>
        )}
      </header>

      {/* Full-Screen Hero with Scroll-Based Content Changes */}
      <div className="relative" style={{ height: '500vh' }}>
        {/* Fixed ThreeHero Background */}
        <div className="fixed inset-0 z-0">
          <ThreeHero />
        </div>

        {/* Scroll-Based Content Overlay */}
        <div className="relative z-10">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              className="h-screen flex items-center justify-center px-6"
              style={{
                opacity: 
                  index === 0 ? section1Progress :
                  index === 1 ? section2Progress :
                  index === 2 ? section3Progress :
                  index === 3 ? section4Progress :
                  section5Progress
              }}
            >
              <div className="max-w-4xl text-center">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ 
                    opacity: currentSection === index ? 1 : 0.3,
                    y: currentSection === index ? 0 : 30
                  }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <Badge 
                    className={`mb-6 ${
                      section.color === 'white' ? 'bg-white/20 text-white border-white/30' :
                      section.color === 'blue' ? 'bg-blue-500/20 text-blue-300 border-blue-400/40' :
                      section.color === 'purple' ? 'bg-purple-500/20 text-purple-300 border-purple-400/40' :
                      section.color === 'cyan' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40' :
                      'bg-green-500/20 text-green-300 border-green-400/40'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {section.badge}
                  </Badge>
                  
                  <h1 className={`text-6xl md:text-8xl font-bold mb-6 ${
                    section.color === 'white' ? 'text-white' :
                    section.color === 'blue' ? 'bg-gradient-to-r from-blue-300 to-blue-500 bg-clip-text text-transparent' :
                    section.color === 'purple' ? 'bg-gradient-to-r from-purple-300 to-purple-500 bg-clip-text text-transparent' :
                    section.color === 'cyan' ? 'bg-gradient-to-r from-cyan-300 to-cyan-500 bg-clip-text text-transparent' :
                    'bg-gradient-to-r from-green-300 to-green-500 bg-clip-text text-transparent'
                  }`}>
                    {section.title}
                  </h1>
                  
                  <h2 className="text-2xl md:text-3xl text-gray-300 mb-6 font-light">
                    {section.subtitle}
                  </h2>
                  
                  <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                    {section.description}
                  </p>

                  {/* Action Buttons for Final Section */}
                  {index === 4 && (
                    <motion.div 
                      className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Button 
                        size="lg" 
                        onClick={handleAuthLogin}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-4 text-lg group backdrop-blur-sm"
                      >
                        <Rocket className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                        Launch Platform
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="lg" 
                        onClick={handleDemoClick}
                        className="border-gray-400/40 text-gray-300 hover:bg-gray-800/40 px-10 py-4 text-lg backdrop-blur-sm group"
                      >
                        <GitBranch className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                        Connect GitHub
                      </Button>
                    </motion.div>
                  )}

                  {/* Feature Grid for Specific Sections */}
                  {index === 1 && (
                    <motion.div 
                      className="grid md:grid-cols-5 gap-4 mt-12"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {['Planner', 'Builder', 'Tester', 'Deployer', 'Monitor'].map((agent, i) => (
                        <div key={i} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-lg mb-2 mx-auto flex items-center justify-center">
                            <Bot className="w-4 h-4 text-blue-400" />
                          </div>
                          <p className="text-sm text-gray-300">{agent}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* Vibe Hosting Principles for Section 3 */}
                  {index === 2 && (
                    <motion.div 
                      className="grid md:grid-cols-3 gap-6 mt-12"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {[
                        { icon: Zap, title: "Embrace the Vibes", desc: "Focus on deployment outcomes, not infrastructure complexity" },
                        { icon: TrendingUp, title: "Accept Exponentials", desc: "Scale infinitely with AI-driven resource management" },
                        { icon: Cloud, title: "Forget Complexity", desc: "Let agents handle the technical details automatically" }
                      ].map((principle, i) => (
                        <div key={i} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
                          <principle.icon className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                          <h3 className="text-lg font-semibold text-white mb-2">{principle.title}</h3>
                          <p className="text-sm text-gray-400">{principle.desc}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-black/50 backdrop-blur-sm border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img src={careerateLogo} alt="CAREERATE" className="w-8 h-8 rounded-lg" />
            <span className="text-xl font-bold text-white">CAREERATE</span>
          </div>
          <p className="text-gray-400 text-sm">
            Made with 💙 in Seattle in 2025
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Powered by Agentic DevOps • Built with Vibe Hosting Principles
          </p>
        </div>
      </footer>

    </div>
  );
}
