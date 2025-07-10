import { Button } from "@/components/ui/button";
import { LiquidGlassPanel } from "@/components/ui/liquid-glass";
import { 
  Boxes, 
  Github, 
  Users, 
  Zap, 
  Shield,
  Cloud,
  Bot
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center">
              <Boxes className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Careerate</h1>
              <p className="text-xs text-gray-300">Autonomous DevOps Platform</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              onClick={() => window.location.href = "/api/auth/azure"}
              className="glass-button bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
            >
              <Users className="h-4 w-4 mr-2" />
              Sign in with Azure
            </Button>
            <Button 
              onClick={() => window.location.href = "/api/auth/github"}
              className="glass-button bg-gray-500/20 text-gray-300 hover:bg-gray-500/30"
            >
              <Github className="h-4 w-4 mr-2" />
              Sign in with GitHub
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-6xl mx-auto text-center">
          <LiquidGlassPanel className="p-12 mb-8">
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
              Autonomous DevOps
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              The first agentic DevOps platform with autonomous multi-agent orchestration. 
              Deploy, scale, and manage your infrastructure with AI-powered agents that work together seamlessly.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <Bot className="h-12 w-12 text-indigo-400 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Multi-Agent System</h3>
                <p className="text-sm text-gray-400">
                  5 specialized agents: Planner, Builder, Tester, Deployer, and Monitor
                </p>
              </div>
              <div className="text-center">
                <Cloud className="h-12 w-12 text-violet-400 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Multi-Cloud Ready</h3>
                <p className="text-sm text-gray-400">
                  AWS, GCP, and Azure integration with unified management
                </p>
              </div>
              <div className="text-center">
                <Zap className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Autonomous Workflows</h3>
                <p className="text-sm text-gray-400">
                  Self-healing infrastructure with intelligent automation
                </p>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Button 
                onClick={() => window.location.href = "/api/auth/azure"}
                size="lg"
                className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600"
              >
                <Users className="h-5 w-5 mr-2" />
                Get Started with Azure
              </Button>
              <Button 
                onClick={() => window.location.href = "/api/auth/github"}
                size="lg"
                variant="outline"
                className="glass-button border-gray-500/50"
              >
                <Github className="h-5 w-5 mr-2" />
                Connect GitHub
              </Button>
            </div>
          </LiquidGlassPanel>

          <div className="text-sm text-gray-500">
            <Shield className="h-4 w-4 inline mr-1" />
            Enterprise-grade security with OAuth2 and role-based access control
          </div>
        </div>
      </main>
    </div>
  );
}