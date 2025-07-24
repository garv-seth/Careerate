import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Bot, Zap, Shield, Layers, Cloud, GitBranch, Activity, Users, Globe, Menu, X, Sparkles, Rocket, Brain, Cpu, Star, Target, TrendingUp, CheckCircle2, MessageSquare, Workflow } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import careerateLogo from "@assets/CareerateLogo.png";

export default function Landing() {
  const { login } = useAuth();

  const handleStartTrial = () => {
    login();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white overflow-x-hidden pt-20">

      {/* Hero Section with CAREERATE branding */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-slate-900/30"></div>
        
        <div className="relative z-20 text-center max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <Badge className="mb-6 bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-blue-200 border-blue-400/40 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              2025 • Next-Generation Agentic DevOps • A2A Protocol
            </Badge>
            
            <motion.h1 
              className="text-5xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              CAREERATE
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-3xl text-blue-200 mb-8 font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              Introducing Vibe Hosting
              <br />
              <span className="text-lg md:text-xl text-blue-300">with DevOps and SRE Agents</span>
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <Button 
                size="lg" 
                onClick={handleStartTrial}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg backdrop-blur-sm"
              >
                Start Free Trial
                <Rocket className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-blue-400/40 text-blue-200 hover:bg-blue-500/10 backdrop-blur-sm px-8 py-3 text-lg"
              >
                Watch Demo
                <Activity className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </section>

      {/* Platform Overview Section */}
      <section id="platform" className="py-20 px-6 bg-slate-950/50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
              Autonomous DevOps Platform
            </h2>
            <p className="text-xl text-blue-200 max-w-4xl mx-auto">
              Experience the future of infrastructure management with AI agents that think, communicate, and act independently through advanced Agent-to-Agent protocols.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Brain className="w-12 h-12 text-blue-400" />,
                title: "Intelligent Orchestration",
                description: "AI agents analyze your infrastructure needs and autonomously deploy optimized solutions across cloud platforms."
              },
              {
                icon: <MessageSquare className="w-12 h-12 text-purple-400" />,
                title: "Agent-to-Agent Communication",
                description: "Revolutionary A2A protocol enables seamless coordination between specialized agents for complex DevOps workflows."
              },
              {
                icon: <Zap className="w-12 h-12 text-yellow-400" />,
                title: "Real-time Adaptation",
                description: "Continuous monitoring and auto-healing capabilities ensure your applications maintain peak performance 24/7."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Card className="bg-slate-900/50 border-blue-500/20 backdrop-blur-sm h-full">
                  <CardContent className="p-8 text-center">
                    <div className="mb-6 flex justify-center">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                    <p className="text-blue-200 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent Showcase Section */}
      <section id="agents" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
              Meet Your AI Agents
            </h2>
            <p className="text-xl text-blue-200 max-w-4xl mx-auto">
              Five specialized agents working in perfect harmony to manage your entire DevOps lifecycle.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Planner Agent",
                role: "Strategic Analysis",
                status: "Active",
                description: "Analyzes repositories and creates deployment strategies",
                icon: <Target className="w-8 h-8 text-blue-400" />,
                metrics: { accuracy: "98.2%", speed: "2.1s" }
              },
              {
                name: "Builder Agent", 
                role: "Asset Compilation",
                status: "Building",
                description: "Renders templates and compiles deployment assets",
                icon: <Layers className="w-8 h-8 text-green-400" />,
                metrics: { efficiency: "94.7%", builds: "1,247" }
              },
              {
                name: "Tester Agent",
                role: "Quality Assurance", 
                status: "Testing",
                description: "Automated testing and validation across environments",
                icon: <CheckCircle2 className="w-8 h-8 text-yellow-400" />,
                metrics: { coverage: "96.8%", tests: "847" }
              },
              {
                name: "Deployer Agent",
                role: "Infrastructure",
                status: "Deploying",
                description: "Orchestrates deployments across cloud platforms",
                icon: <Cloud className="w-8 h-8 text-purple-400" />,
                metrics: { uptime: "99.9%", deploys: "342" }
              },
              {
                name: "Monitor Agent",
                role: "Observability",
                status: "Monitoring", 
                description: "Real-time monitoring and alerting across systems",
                icon: <Activity className="w-8 h-8 text-red-400" />,
                metrics: { alerts: "24", uptime: "99.8%" }
              }
            ].map((agent, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Card className="bg-slate-900/50 border-blue-500/20 backdrop-blur-sm h-full hover:border-blue-400/40 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                          {agent.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-white">{agent.name}</h3>
                          <p className="text-sm text-blue-300">{agent.role}</p>
                        </div>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/40">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {agent.status}
                      </Badge>
                    </div>
                    <p className="text-blue-200 text-sm mb-4">{agent.description}</p>
                    <div className="flex justify-between text-xs text-gray-400">
                      {Object.entries(agent.metrics).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <p className="text-white font-medium">{value}</p>
                          <p className="capitalize">{key}</p>
                        </div>
                      ))}
                    </div>
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

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </section>

      {/* Platform Overview Section */}
      <section id="platform" className="py-20 px-6 bg-slate-950/50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
              Autonomous DevOps Platform
            </h2>
            <p className="text-xl text-blue-200 max-w-4xl mx-auto">
              Experience the future of infrastructure management with AI agents that think, communicate, and act independently through advanced Agent-to-Agent protocols.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Brain className="w-12 h-12 text-blue-400" />,
                title: "Intelligent Orchestration",
                description: "AI agents analyze your infrastructure needs and autonomously deploy optimized solutions across cloud platforms."
              },
              {
                icon: <MessageSquare className="w-12 h-12 text-purple-400" />,
                title: "Agent-to-Agent Communication",
                description: "Revolutionary A2A protocol enables seamless coordination between specialized agents for complex DevOps workflows."
              },
              {
                icon: <Zap className="w-12 h-12 text-yellow-400" />,
                title: "Real-time Adaptation",
                description: "Continuous monitoring and auto-healing capabilities ensure your applications maintain peak performance 24/7."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Card className="bg-slate-900/50 border-blue-500/20 backdrop-blur-sm h-full">
                  <CardContent className="p-8 text-center">
                    <div className="mb-6 flex justify-center">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                    <p className="text-blue-200 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent Showcase Section */}
      <section id="agents" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
              Meet Your AI Agents
            </h2>
            <p className="text-xl text-blue-200 max-w-4xl mx-auto">
              Five specialized agents working in perfect harmony to manage your entire DevOps lifecycle.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Planner Agent",
                role: "Strategic Analysis",
                status: "Active",
                description: "Analyzes repositories and creates deployment strategies",
                icon: <Target className="w-8 h-8 text-blue-400" />,
                metrics: { accuracy: "98.2%", speed: "2.1s" }
              },
              {
                name: "Builder Agent", 
                role: "Asset Compilation",
                status: "Building",
                description: "Renders templates and compiles deployment assets",
                icon: <Layers className="w-8 h-8 text-green-400" />,
                metrics: { efficiency: "94.7%", builds: "1,247" }
              },
              {
                name: "Tester Agent",
                role: "Quality Assurance", 
                status: "Testing",
                description: "Automated testing and validation across environments",
                icon: <CheckCircle2 className="w-8 h-8 text-yellow-400" />,
                metrics: { coverage: "96.8%", tests: "847" }
              },
              {
                name: "Deployer Agent",
                role: "Infrastructure",
                status: "Deploying",
                description: "Orchestrates deployments across cloud platforms",
                icon: <Cloud className="w-8 h-8 text-purple-400" />,
                metrics: { uptime: "99.9%", deploys: "342" }
              },
              {
                name: "Monitor Agent",
                role: "Health & Performance",
                status: "Monitoring",
                description: "Continuous monitoring and auto-healing capabilities", 
                icon: <Activity className="w-8 h-8 text-red-400" />,
                metrics: { response: "12ms", alerts: "0" }
              }
            ].map((agent, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="bg-slate-900/50 border-blue-500/20 backdrop-blur-sm h-full hover:border-blue-400/40 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {agent.icon}
                        <div>
                          <h3 className="text-lg font-bold text-white">{agent.name}</h3>
                          <p className="text-sm text-blue-300">{agent.role}</p>
                        </div>
                      </div>
                      <Badge className={`${
                        agent.status === 'Active' ? 'bg-green-500/20 text-green-300' :
                        agent.status === 'Building' ? 'bg-blue-500/20 text-blue-300' :
                        agent.status === 'Testing' ? 'bg-yellow-500/20 text-yellow-300' :
                        agent.status === 'Deploying' ? 'bg-purple-500/20 text-purple-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {agent.status}
                      </Badge>
                    </div>
                    <p className="text-blue-200 mb-4 text-sm">{agent.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(agent.metrics).map(([key, value]) => (
                        <div key={key} className="bg-slate-800/50 rounded p-2">
                          <div className="text-blue-300 capitalize">{key}</div>
                          <div className="text-white font-mono">{value}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Visualization Section */}
      <section id="workflow" className="py-20 px-6 bg-slate-950/50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-green-300 bg-clip-text text-transparent">
              Visual Workflow Editor
            </h2>
            <p className="text-xl text-blue-200 max-w-4xl mx-auto">
              Design complex DevOps workflows with our intuitive visual editor and watch agents collaborate in real-time.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="bg-slate-900/50 border-blue-500/20 backdrop-blur-sm">
                <CardContent className="p-8">
                  <Workflow className="w-12 h-12 text-blue-400 mb-6" />
                  <h3 className="text-2xl font-bold mb-4 text-white">Interactive Editor</h3>
                  <p className="text-blue-200 mb-6">
                    Drag-and-drop interface for creating sophisticated deployment pipelines with real-time agent coordination.
                  </p>
                  <div className="space-y-3">
                    {[
                      "Node-based workflow creation",
                      "Real-time agent communication",
                      "Visual debugging and monitoring",
                      "Template library integration"
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="text-blue-200">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="bg-slate-900/50 border-purple-500/20 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h4 className="text-lg font-bold mb-4 text-white">Live A2A Communication</h4>
                  <div className="space-y-3 text-sm">
                    {[
                      { agent: "Planner", message: "Repository analysis complete. Deployment strategy ready.", time: "12:34:21" },
                      { agent: "Builder", message: "Assets compiled successfully. Ready for testing.", time: "12:34:23" },
                      { agent: "Tester", message: "All tests passed. Deployment approved.", time: "12:34:28" },
                      { agent: "Deployer", message: "Infrastructure provisioned. Application deployed.", time: "12:34:35" }
                    ].map((log, index) => (
                      <motion.div 
                        key={index}
                        className="bg-slate-800/50 rounded p-3 border-l-2 border-blue-400/30"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                        viewport={{ once: true }}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-blue-300 font-medium">{log.agent} Agent</span>
                          <span className="text-gray-400 text-xs">{log.time}</span>
                        </div>
                        <p className="text-blue-200">{log.message}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Advanced Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-yellow-300 bg-clip-text text-transparent">
              Enterprise-Grade Capabilities
            </h2>
            <p className="text-xl text-blue-200 max-w-4xl mx-auto">
              Built for scale with enterprise security, performance, and reliability at its core.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Shield className="w-8 h-8 text-green-400" />, title: "Security First", metric: "SOC 2 Type II" },
              { icon: <TrendingUp className="w-8 h-8 text-blue-400" />, title: "99.9% Uptime", metric: "SLA Guarantee" },
              { icon: <Globe className="w-8 h-8 text-purple-400" />, title: "Multi-Cloud", metric: "AWS, GCP, Azure" },
              { icon: <Users className="w-8 h-8 text-yellow-400" />, title: "Team Collaboration", metric: "Unlimited Users" }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="bg-slate-900/50 border-blue-500/20 backdrop-blur-sm text-center h-full">
                  <CardContent className="p-6">
                    <div className="mb-4 flex justify-center">{feature.icon}</div>
                    <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-blue-300 text-sm">{feature.metric}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Evolution Comparison Section */}
      <section id="compare" className="py-20 px-6 bg-slate-950/50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-red-300 bg-clip-text text-transparent">
              DevOps Evolution
            </h2>
            <p className="text-xl text-blue-200 max-w-4xl mx-auto">
              From manual processes to autonomous intelligence - see how CAREERATE transforms DevOps workflows.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="bg-red-900/20 border-red-500/20 backdrop-blur-sm h-full">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6 text-red-300">Traditional DevOps</h3>
                  <div className="space-y-4">
                    {[
                      "Manual deployment processes",
                      "Reactive monitoring and alerts",
                      "Siloed team responsibilities", 
                      "Time-consuming troubleshooting",
                      "Limited scalability"
                    ].map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <X className="w-5 h-5 text-red-400" />
                        <span className="text-red-200">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="bg-green-900/20 border-green-500/20 backdrop-blur-sm h-full">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6 text-green-300">CAREERATE Autonomous</h3>
                  <div className="space-y-4">
                    {[
                      "Fully autonomous deployments",
                      "Predictive monitoring with auto-healing",
                      "Coordinated AI agent collaboration",
                      "Instant issue resolution",
                      "Infinite scalability"
                    ].map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="text-green-200">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
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