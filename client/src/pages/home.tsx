import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GlassCard from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GradientText, AnimatedText } from "@/components/ui/animated-text";
import { useState, useEffect } from "react";
import careerateLogo from "@assets/CareerateLogo.png";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Cloud, 
  Bot, 
  GitBranch, 
  Activity, 
  Settings, 
  Users, 
  Zap, 
  Shield, 
  TrendingUp,
  Server,
  Database,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Clock,
  PlayCircle,
  LogOut,
  Menu,
  X
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const { toast } = useToast();
  
  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  // Fetch agents data
  const { data: agents = [], isLoading: agentsLoading } = useQuery({
    queryKey: ["/api/agents"],
    staleTime: 30000, // 30 seconds
  });

  // Fetch workflows data  
  const { data: workflows = [], isLoading: workflowsLoading } = useQuery({
    queryKey: ["/api/workflows"],
    staleTime: 30000,
  });

  // Fetch cloud resources
  const { data: cloudResources = [], isLoading: cloudLoading } = useQuery({
    queryKey: ["/api/cloud-resources"],
    staleTime: 30000,
  });

  // Fetch deployment plans
  const { data: deploymentPlans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["/api/deploy/plans"],
    staleTime: 30000,
  });

  // Repository analysis mutation
  const analyzeMutation = useMutation({
    mutationFn: async (repoUrl: string) => {
      return await apiRequest("/api/deploy/analyze", {
        method: "POST",
        body: { repositoryUrl: repoUrl }
      });
    },
    onSuccess: (analysis) => {
      toast({
        title: "Repository Analyzed",
        description: `Technology: ${analysis.technology}, Estimated cost: $${analysis.recommendedInfrastructure.estimatedCost}/month`,
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze repository",
        variant: "destructive",
      });
    }
  });

  // Deployment plan creation mutation
  const deployMutation = useMutation({
    mutationFn: async (repoUrl: string) => {
      return await apiRequest("/api/deploy/plan", {
        method: "POST",
        body: { repositoryUrl: repoUrl }
      });
    },
    onSuccess: (result) => {
      toast({
        title: "Deployment Plan Created",
        description: `Plan ID: ${result.planId}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/deploy/plans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
    },
    onError: (error) => {
      toast({
        title: "Deployment Failed",
        description: error instanceof Error ? error.message : "Failed to create deployment plan",
        variant: "destructive",
      });
    }
  });

  // Infrastructure optimization mutation
  const optimizeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/infrastructure/optimize", {
        method: "POST"
      });
    },
    onSuccess: (optimizations) => {
      toast({
        title: "Infrastructure Optimized",
        description: `Potential savings: $${optimizations.totalEstimatedSavings}/month`,
      });
    },
    onError: (error) => {
      toast({
        title: "Optimization Failed",
        description: error instanceof Error ? error.message : "Failed to optimize infrastructure",
        variant: "destructive",
      });
    }
  });

  const handleAnalyzeRepository = () => {
    if (!repositoryUrl) {
      toast({
        title: "Repository URL Required",
        description: "Please enter a GitHub repository URL",
        variant: "destructive",
      });
      return;
    }
    analyzeMutation.mutate(repositoryUrl);
  };

  const handleDeployRepository = () => {
    if (!repositoryUrl) {
      toast({
        title: "Repository URL Required", 
        description: "Please enter a GitHub repository URL",
        variant: "destructive",
      });
      return;
    }
    deployMutation.mutate(repositoryUrl);
  };

  const handleOptimizeInfrastructure = () => {
    optimizeMutation.mutate();
  };

  // Agent status colors
  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'building': return 'bg-blue-500';
      case 'queued': return 'bg-yellow-500';
      case 'waiting': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'planner': return <Bot className="h-4 w-4" />;
      case 'builder': return <Settings className="h-4 w-4" />;
      case 'tester': return <CheckCircle2 className="h-4 w-4" />;
      case 'deployer': return <Cloud className="h-4 w-4" />;
      case 'monitor': return <Activity className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-900 text-white">
      {/* Content with top padding for fixed navbar */}
      <div className="pt-20 pb-20"></div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-black/20 backdrop-blur-xl border-white/10 p-1 rounded-xl">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-300 data-[state=active]:shadow-lg transition-all duration-300 rounded-lg px-6 py-3"
            >
              <Bot className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="agents" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-300 data-[state=active]:shadow-lg transition-all duration-300 rounded-lg px-6 py-3"
            >
              <Users className="h-4 w-4 mr-2" />
              AI Agents
            </TabsTrigger>
            <TabsTrigger 
              value="cloud" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-300 data-[state=active]:shadow-lg transition-all duration-300 rounded-lg px-6 py-3"
            >
              <Cloud className="h-4 w-4 mr-2" />
              Cloud Resources
            </TabsTrigger>
            <TabsTrigger 
              value="workflows" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-300 data-[state=active]:shadow-lg transition-all duration-300 rounded-lg px-6 py-3"
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Workflows
            </TabsTrigger>
            <TabsTrigger 
              value="integrations" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-300 data-[state=active]:shadow-lg transition-all duration-300 rounded-lg px-6 py-3"
            >
              <GitBranch className="h-4 w-4 mr-2" />
              Integrations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-black/20 backdrop-blur-xl border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">Active Agents</p>
                      <p className="text-2xl font-bold">{agents.filter((a: any) => a.status === 'active').length}</p>
                    </div>
                    <Bot className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-xl border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">Cloud Resources</p>
                      <p className="text-2xl font-bold">{cloudResources.length}</p>
                    </div>
                    <Cloud className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-xl border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">Active Workflows</p>
                      <p className="text-2xl font-bold">{workflows.filter((w: any) => w.status === 'running').length}</p>
                    </div>
                    <Activity className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-xl border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm">System Health</p>
                      <p className="text-2xl font-bold text-green-400">98%</p>
                    </div>
                    <Shield className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-black/20 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-black/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <span>Deployment completed for Project Alpha</span>
                    </div>
                    <span className="text-gray-400 text-sm">2 minutes ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-black/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bot className="h-4 w-4 text-blue-400" />
                      <span>Builder Agent started processing new repository</span>
                    </div>
                    <span className="text-gray-400 text-sm">5 minutes ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-black/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Cloud className="h-4 w-4 text-cyan-400" />
                      <span>AWS resources scaled automatically</span>
                    </div>
                    <span className="text-gray-400 text-sm">10 minutes ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {agentsLoading ? (
                <div className="col-span-2 text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                </div>
              ) : (
                agents.map((agent: any) => (
                  <Card key={agent.id} className="bg-black/20 backdrop-blur-xl border-white/10">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          {getAgentIcon(agent.type)}
                          {agent.name}
                        </CardTitle>
                        <Badge className={`${getAgentStatusColor(agent.status)} text-white`}>
                          {agent.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 mb-4">{agent.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Performance</span>
                          <span>85%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button size="sm" variant="outline" className="text-xs">
                          View Logs
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs">
                          Configure
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="cloud" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* AWS */}
              <Card className="bg-black/20 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-orange-400" />
                    AWS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">EC2 Instances</span>
                      <span>3 Running</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Lambda Functions</span>
                      <span>12 Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Monthly Cost</span>
                      <span className="text-green-400">$124.50</span>
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <Button className="w-full" size="sm">
                      Manage Resources
                    </Button>
                    <Button 
                      className="w-full" 
                      size="sm" 
                      variant="outline"
                      onClick={handleOptimizeInfrastructure}
                      disabled={optimizeMutation.isPending}
                    >
                      {optimizeMutation.isPending ? "Optimizing..." : "Optimize Costs"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* GCP */}
              <Card className="bg-black/20 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-blue-400" />
                    Google Cloud
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Compute Engines</span>
                      <span>2 Running</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Cloud Functions</span>
                      <span>8 Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Monthly Cost</span>
                      <span className="text-green-400">$89.20</span>
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <Button className="w-full" size="sm">
                      Manage Resources
                    </Button>
                    <Button 
                      className="w-full" 
                      size="sm" 
                      variant="outline"
                      onClick={handleOptimizeInfrastructure}
                      disabled={optimizeMutation.isPending}
                    >
                      {optimizeMutation.isPending ? "Optimizing..." : "Optimize Costs"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Azure */}
              <Card className="bg-black/20 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-cyan-400" />
                    Azure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Virtual Machines</span>
                      <span>1 Running</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">App Services</span>
                      <span>5 Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Monthly Cost</span>
                      <span className="text-green-400">$67.80</span>
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <Button className="w-full" size="sm">
                      Manage Resources
                    </Button>
                    <Button 
                      className="w-full" 
                      size="sm" 
                      variant="outline"
                      onClick={handleOptimizeInfrastructure}
                      disabled={optimizeMutation.isPending}
                    >
                      {optimizeMutation.isPending ? "Optimizing..." : "Optimize Costs"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="workflows" className="space-y-6">
            <div className="space-y-4">
              {workflowsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                </div>
              ) : workflows.length === 0 ? (
                <Card className="bg-black/20 backdrop-blur-xl border-white/10">
                  <CardContent className="p-8 text-center">
                    <PlayCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Active Workflows</h3>
                    <p className="text-gray-300 mb-4">Deploy a repository to create your first automated workflow</p>
                    <Button onClick={() => setRepositoryUrl("https://github.com/example/repo")}>
                      Start Deployment
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                workflows.map((workflow: any) => (
                  <Card key={workflow.id} className="bg-black/20 backdrop-blur-xl border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <PlayCircle className="h-8 w-8 text-blue-400" />
                          <div>
                            <h3 className="font-semibold">{workflow.name}</h3>
                            <p className="text-gray-300 text-sm">{workflow.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-400">
                                Created: {new Date(workflow.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant={workflow.status === 'running' ? 'default' : workflow.status === 'completed' ? 'outline' : 'secondary'}>
                            {workflow.status}
                          </Badge>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            {/* Hero Glass Card for Repository */}
            <div className="flex justify-center mb-8">
              <GlassCard 
                title="Vibe Repository"
                description="Analyze and deploy GitHub repositories with AI-powered automation. Experience next-generation hosting with intelligent infrastructure management."
                icon={GitBranch}
                className="w-full max-w-md"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* GitHub Integration */}
              <Card className="bg-black/20 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-cyan-400" />
                    <AnimatedText text="GitHub" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">Deploy repositories with AI-powered automation</p>
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="https://github.com/user/repo"
                      value={repositoryUrl}
                      onChange={(e) => setRepositoryUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <GlassButton 
                        onClick={handleAnalyzeRepository}
                        disabled={analyzeMutation.isPending}
                        size="sm"
                        variant="outline"
                      >
                        {analyzeMutation.isPending ? "Analyzing..." : "Analyze"}
                      </GlassButton>
                      <GlassButton 
                        onClick={handleDeployRepository}
                        disabled={deployMutation.isPending}
                        size="sm"
                      >
                        {deployMutation.isPending ? "Deploying..." : "Deploy"}
                      </GlassButton>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* OpenAI Integration */}
              <Card className="bg-black/20 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-blue-400" />
                    <AnimatedText text="OpenAI" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">AI-powered code analysis and optimization</p>
                  <Badge className="bg-green-500 text-white mb-4">Connected</Badge>
                  <GlassButton className="w-full" variant="outline">
                    Configure
                  </GlassButton>
                </CardContent>
              </Card>

              {/* AWS Integration */}
              <Card className="bg-black/20 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-orange-400" />
                    <AnimatedText text="AWS" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">Amazon Web Services cloud infrastructure</p>
                  <Badge className="bg-green-500 text-white mb-4">Connected</Badge>
                  <GlassButton className="w-full" variant="outline">
                    Configure AWS
                  </GlassButton>
                </CardContent>
              </Card>

              {/* Azure Integration */}
              <Card className="bg-black/20 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-400" />
                    <AnimatedText text="Azure" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">Microsoft Azure cloud platform</p>
                  <Badge className="bg-green-500 text-white mb-4">Connected</Badge>
                  <GlassButton className="w-full" variant="outline">
                    Configure Azure
                  </GlassButton>
                </CardContent>
              </Card>

              {/* GCP Integration */}
              <Card className="bg-black/20 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-yellow-400" />
                    <AnimatedText text="Google Cloud" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">Google Cloud Platform services</p>
                  <Badge className="bg-green-500 text-white mb-4">Connected</Badge>
                  <GlassButton className="w-full" variant="outline">
                    Configure GCP
                  </GlassButton>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}