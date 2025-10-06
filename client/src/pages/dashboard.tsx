import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Plus, Play, Code, Settings, User, Search, FileCode, Globe, Database,
  Smartphone, Bot, Send, Sparkles, Zap, GitBranch, Cloud, Shield,
  Activity, BarChart3, Terminal, MessageSquare, Rocket, Star,
  ChevronRight, Clock, TrendingUp, Users, Brain, Cpu, Server, Trash2,
  AlertTriangle, Archive, Copy, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Select as UiSelect, SelectContent as UiSelectContent, SelectItem as UiSelectItem, SelectTrigger as UiSelectTrigger, SelectValue as UiSelectValue } from "@/components/ui/select";
import { AppShell } from "@/components/AppShell";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageTransition, FadeIn, SlideUp } from "@/components/PageTransition";
import { AnimatePresence } from "framer-motion";

const appTemplates = [
  {
    id: 'react-app',
    name: 'React App',
    description: 'Deploy to Vercel or Azure Static Web Apps',
    icon: Globe,
    framework: 'react',
    tags: ['Vercel', 'Azure']
  },
  {
    id: 'node-api',
    name: 'Node.js API',
    description: 'Deploy to Azure Container Apps or Railway',
    icon: Database,
    framework: 'node',
    tags: ['Azure', 'Railway']
  },
  {
    id: 'full-stack',
    name: 'Full Stack App',
    description: 'Deploy frontend + backend + database',
    icon: FileCode,
    framework: 'fullstack',
    tags: ['Multi-Cloud', 'Full Stack']
  },
  {
    id: 'mobile-app',
    name: 'Mobile App',
    description: 'Deploy backend API to AWS or Azure',
    icon: Smartphone,
    framework: 'react-native',
    tags: ['AWS', 'Azure']
  }
];

export default function Dashboard() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [framework, setFramework] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [agentPrompt, setAgentPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [readiness, setReadiness] = useState<any | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>(() => (typeof window !== 'undefined' ? (window.location.hash?.replace('#', '') || 'agent') : 'agent'));
  const [settingsProjectId, setSettingsProjectId] = useState<string | null>(null);
  const [settingsName, setSettingsName] = useState("");
  const [settingsDescription, setSettingsDescription] = useState("");
  const [settingsFramework, setSettingsFramework] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const promptRef = useRef<HTMLTextAreaElement>(null);

  // Typing placeholder animation
  const basePlaceholder = "Deploy my";
  const suggestionsRef = useRef<string[]>([
    " Next.js app to Vercel",
    " Express API to Azure",
    " React app with PostgreSQL",
    " full-stack app to AWS",
    " mobile app backend",
    " e-commerce site to production",
    " SaaS app for under $50/month",
  ]);
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState<string>(basePlaceholder);
  const typingStateRef = useRef({
    suggestionIndex: 0,
    charIndex: 0,
    deleting: false,
    running: true,
  });
  const timersRef = useRef<number[]>([]);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["/api/projects"],
  });

  // Load readiness status
  const { data: readinessData } = useQuery({
    queryKey: ["/api/hosting/readiness"],
    queryFn: async () => {
      const res = await fetch("/api/hosting/readiness", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load readiness");
      return res.json();
    },
  });

  useEffect(() => { if (readinessData) setReadiness(readinessData); }, [readinessData]);

  // Load repos from connected providers
  const { data: reposData, error: reposError } = useQuery({
    queryKey: ["/api/integrations/repos"],
    retry: false,
    queryFn: async () => {
      try {
        const res = await fetch("/api/integrations/repos", { credentials: "include" });
        if (res.status === 401) {
          // Return empty data instead of redirecting automatically
          return { providers: [], needsAuth: true };
        }
        if (!res.ok) {
          console.error("Failed to load repositories:", res.status, res.statusText);
          return { providers: [] };
        }
        return res.json();
      } catch (error) {
        console.error("Repos query error:", error);
        return { providers: [] };
      }
    },
  });

  const { data: recentActivity = [], isLoading: isActivityLoading } = useQuery({
    queryKey: ["/api/recent-activity"],
  });

  const createProjectMutation = useMutation({
    mutationFn: async (projectData: { name: string; description: string; framework: string }) => {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to create project: ${response.statusText}`);
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsCreateDialogOpen(false);
      setProjectName("");
      setProjectDescription("");
      setFramework("");
      toast({
        title: "Project created!",
        description: `${data.name} is ready to code`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: { name?: string; description?: string; framework?: string } }) => {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update project");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setSettingsProjectId(null);
      toast({
        title: "Project updated!",
        description: `${data.name} has been updated successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to delete project" }));
        throw new Error(errorData.message || "Failed to delete project");
      }
      return projectId;
    },
    onSuccess: (projectId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setSettingsProjectId(null);
      setShowDeleteConfirm(false);
      toast({
        title: "Project deleted",
        description: "The project has been permanently deleted",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const filteredProjects = projects.filter((project: any) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Typing placeholder animation effect
  useEffect(() => {
    typingStateRef.current.running = true;
    const typeSpeed = 70;
    const deleteSpeed = 40;
    const pauseAtEnd = 1200;
    const pauseBetween = 500;

    function schedule(fn: () => void, delay: number) {
      const id = window.setTimeout(fn, delay);
      timersRef.current.push(id);
    }

    function clearTimers() {
      for (const id of timersRef.current) window.clearTimeout(id);
      timersRef.current = [];
    }

    function step() {
      if (!typingStateRef.current.running) return;
      if (agentPrompt !== "") {
        setAnimatedPlaceholder(basePlaceholder);
        schedule(step, 300);
        return;
      }

      const state = typingStateRef.current;
      const suggestions = suggestionsRef.current;
      const current = suggestions[state.suggestionIndex % suggestions.length] || "";

      if (!state.deleting) {
        const nextIndex = state.charIndex + 1;
        const next = current.slice(0, nextIndex);
        setAnimatedPlaceholder(basePlaceholder + next);
        state.charIndex = nextIndex;
        if (nextIndex >= current.length) {
          schedule(() => {
            state.deleting = true;
            step();
          }, pauseAtEnd);
        } else {
          schedule(step, typeSpeed);
        }
      } else {
        const nextIndex = Math.max(0, state.charIndex - 1);
        const next = current.slice(0, nextIndex);
        setAnimatedPlaceholder(basePlaceholder + next);
        state.charIndex = nextIndex;
        if (nextIndex <= 0) {
          state.deleting = false;
          state.suggestionIndex = (state.suggestionIndex + 1) % suggestions.length;
          schedule(step, pauseBetween);
        } else {
          schedule(step, deleteSpeed);
        }
      }
    }

    clearTimers();
    schedule(step, 400);
    return () => {
      typingStateRef.current.running = false;
      clearTimers();
    };
  }, [agentPrompt]);

  // Keep tab state in sync with URL hash so navbar links work
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash?.replace('#', '') || 'agent';
      setActiveTab(hash);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    const nextHash = `#${activeTab}`;
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, '', `${window.location.pathname}${nextHash}`);
    }
  }, [activeTab]);

  const handleCreateProject = (template: any) => {
    setFramework(template.framework);
    setProjectName('');
    setProjectDescription('');
    setIsCreateDialogOpen(true);
  };

  const handleAgentPrompt = async () => {
    if (!agentPrompt.trim()) return;

    setIsGenerating(true);
    try {
      // Call autonomous deployment API
      const response = await fetch('/api/autonomous/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          naturalLanguageInput: agentPrompt,
          repositoryUrl: selectedRepo,
          projectId: `project-${Date.now()}`
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Deployment failed');
      }

      const result = await response.json();

      if (result.success && result.planId) {
        // Show deployment plan
        const plan = result.plan;
        const approved = confirm(
          `🚀 Deployment Plan\n\n` +
          `Provider: ${plan.provider.toUpperCase()}\n` +
          `Region: ${plan.region}\n` +
          `Architecture: ${plan.architecture.compute}\n` +
          `Cost: $${plan.costEstimate.monthly}/month\n\n` +
          `${plan.reasoning}\n\n` +
          `Approve deployment?`
        );

        if (approved) {
          // Approve plan
          await fetch(`/api/autonomous/plans/${result.planId}/approve`, {
            method: 'POST',
            credentials: 'include'
          });

          toast({
            title: "Deploying...",
            description: "Watch real-time progress below",
          });

          // Execute with Server-Sent Events
          const eventSource = new EventSource(`/api/autonomous/plans/${result.planId}/execute`);

          eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'progress') {
              toast({
                title: `${Math.round(data.progress)}% Complete`,
                description: data.step,
              });
            } else if (data.type === 'completed') {
              eventSource.close();
              setIsGenerating(false);
              toast({
                title: "🎉 Deployment Complete!",
                description: data.url ? `Live at: ${data.url}` : 'Deployment successful!',
                duration: 10000,
              });
              setAgentPrompt('');
              queryClient.invalidateQueries();
            } else if (data.type === 'failed') {
              eventSource.close();
              setIsGenerating(false);
              toast({
                title: "Deployment Failed",
                description: data.error,
                variant: "destructive",
              });
            }
          };

          eventSource.onerror = () => {
            eventSource.close();
            setIsGenerating(false);
          };
        } else {
          setIsGenerating(false);
        }
      }
    } catch (error: any) {
      toast({
        title: "Deployment Failed",
        description: error.message || "Unknown error",
        variant: "destructive"
      });
      setIsGenerating(false);
    }
  };

  const extractProjectName = (prompt: string): string => {
    const matches = prompt.match(/(?:build|create|make)\s+(?:a|an)?\s*([^.!?]+)/i);
    return matches ? matches[1].trim() : "";
  };

  const detectFramework = (prompt: string): string => {
    const lower = prompt.toLowerCase();
    if (lower.includes('react') || lower.includes('frontend')) return 'react';
    if (lower.includes('api') || lower.includes('backend')) return 'node';
    if (lower.includes('mobile')) return 'react-native';
    if (lower.includes('full stack') || lower.includes('fullstack')) return 'fullstack';
    return 'react';
  };

  const getActivityColor = (type: string): string => {
    switch (type) {
      case 'project_created': return 'bg-blue-400';
      case 'code_generated': return 'bg-green-400';
      case 'integration_connected': return 'bg-purple-400';
      case 'repository_connected': return 'bg-orange-400';
      case 'agent_task_completed': return 'bg-pink-400';
      default: return 'bg-gray-400';
    }
  };

  const formatTimeAgo = (date: string | Date): string => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour${Math.floor(diffInSeconds / 3600) > 1 ? 's' : ''} ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} day${Math.floor(diffInSeconds / 86400) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffInSeconds / 604800)} week${Math.floor(diffInSeconds / 604800) > 1 ? 's' : ''} ago`;
  };

  const handleGetStarted = () => {
    // Focus on the prompt textarea
    promptRef.current?.focus();
  };

  const handleWatchDemo = () => {
    // Scroll to projects or features section
    setActiveTab('projects');
  };

  const handleOpenSettings = (project: any) => {
    setSettingsProjectId(project.id);
    setSettingsName(project.name);
    setSettingsDescription(project.description || "");
    setSettingsFramework(project.framework || project.metadata?.framework || "react");
  };

  const handleSaveSettings = () => {
    if (!settingsProjectId) return;
    updateProjectMutation.mutate({
      id: settingsProjectId,
      updates: {
        name: settingsName,
        description: settingsDescription,
        framework: settingsFramework,
      },
    });
  };

  const handleDeleteProject = () => {
    if (!settingsProjectId) return;
    deleteProjectMutation.mutate(settingsProjectId);
  };

  return (
    <ErrorBoundary>
      <AppShell>
        {/* Dynamic Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-32 left-1/4 w-96 h-96 bg-orange-500/4 rounded-full blur-3xl animate-pulse-subtle"></div>
          <div className="absolute top-60 right-1/3 w-80 h-80 bg-amber-500/3 rounded-full blur-3xl animate-pulse-subtle" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-32 left-1/3 w-72 h-72 bg-orange-600/2 rounded-full blur-3xl animate-pulse-subtle" style={{animationDelay: '4s'}}></div>
          <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-amber-400/3 rounded-full blur-3xl animate-pulse-subtle" style={{animationDelay: '6s'}}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">

            {/* Cara Tab - Main Interface */}
            <TabsContent value="agent" className="space-y-6" forceMount={activeTab === 'agent'}>
              <AnimatePresence mode="wait">
                {activeTab === 'agent' && (
                  <PageTransition>

              {/* Header Section */}
              <div className="text-center mb-8">
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 bg-clip-text text-transparent mb-4">
                  What will you deploy today? 🚀
                </h1>
                <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
                  Built it with Cursor? Ship it with Careerate. Describe your app and our AI agent deploys to the best cloud—AWS, Azure, GCP, Vercel, or Railway.
                </p>
              </div>

            {/* Main Agent Prompt Interface */}
            <Card className="glass-pane rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="relative rounded-2xl p-[2px] shadow-[0_1px_2px_0_rgba(0,0,0,0.06)] bg-gradient-to-br from-orange-500/20 via-amber-500/10 to-black/20">
                    <Textarea
                      ref={promptRef}
                      placeholder={animatedPlaceholder}
                      value={agentPrompt}
                      onChange={(e) => setAgentPrompt(e.target.value)}
                      className="min-h-[120px] resize-none rounded-2xl bg-[rgba(15,15,20,0.55)] border border-white/10 text-foreground placeholder:text-foreground/40 outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/40 backdrop-blur-md px-4 py-4 pr-16 text-lg"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          e.preventDefault();
                          handleAgentPrompt();
                        }
                      }}
                    />
                    <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-foreground/10 text-foreground/70 border-none">
                        ⌘ + Enter to submit
                      </Badge>
                    </div>
                  </div>

                  {/* Readiness banner */}
                  {readiness && (
                    <div className="rounded-xl p-3 border border-foreground/10 bg-foreground/5 flex flex-wrap items-center gap-3">
                      <span className="text-sm text-foreground/80 flex items-center"><Shield className="h-4 w-4 mr-2" /> Readiness:</span>
                      {readiness.providers.map((p: any) => (
                        <Badge key={p.id} className={`${p.ready ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-foreground/10 text-foreground/60 border-foreground/20'}`}>
                          {p.label}: {p.ready ? 'Ready' : 'Missing'}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto pb-2">
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 flex-shrink-0">
                        <Cpu className="h-3 w-3 mr-1" />
                        Vibe Hosting™
                      </Badge>
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 flex-shrink-0">
                        <Cloud className="h-3 w-3 mr-1" />
                        Multi-Cloud
                      </Badge>
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 flex-shrink-0">
                        <Shield className="h-3 w-3 mr-1" />
                        Zero Lock-In
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {/* Provider select */}
                      <UiSelect value={selectedProvider} onValueChange={setSelectedProvider}>
                        <UiSelectTrigger className="w-[160px] rounded-full bg-[rgba(15,15,20,0.7)] border-white/10 backdrop-blur-md">
                          <UiSelectValue placeholder="Cloud" />
                        </UiSelectTrigger>
                        <UiSelectContent className="bg-[rgba(15,15,20,0.95)] border-white/10 backdrop-blur-xl">
                          {(readiness?.providers || []).map((p: any) => (
                            <UiSelectItem key={p.id} value={p.id} disabled={!p.ready}>{p.label}{!p.ready ? " (setup)" : ""}</UiSelectItem>
                          ))}
                        </UiSelectContent>
                      </UiSelect>

                      {/* Repo select (optional) */}
                      <UiSelect value={selectedRepo} onValueChange={setSelectedRepo}>
                        <UiSelectTrigger className="w-[220px] rounded-full bg-[rgba(15,15,20,0.7)] border-white/10 backdrop-blur-md">
                          <UiSelectValue placeholder="Repository (optional)" />
                        </UiSelectTrigger>
                        <UiSelectContent className="bg-[rgba(15,15,20,0.95)] border-white/10 backdrop-blur-xl">
                          {(reposData?.providers || []).flatMap((prov: any) => (
                            prov.repos.map((r: any) => (
                              <UiSelectItem key={`${prov.provider}:${r.id}`} value={`${prov.provider}:${r.id}`}>{r.name}</UiSelectItem>
                            ))
                          ))}
                        </UiSelectContent>
                      </UiSelect>

                      <Button
                      onClick={handleAgentPrompt}
                      disabled={!agentPrompt.trim() || isGenerating || (readiness && !readiness.providers?.some((p:any)=>p.ready))}
                      className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white transition-all duration-300 hover:scale-105 shadow-lg shadow-orange-500/25 px-8 w-full sm:w-auto font-semibold"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                          Deploying...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Deploy Now
                        </>
                      )}
                      </Button>
                      <Button asChild variant="outline" className="rounded-full">
                        <a href="/launch-wizard">Open Wizard</a>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {appTemplates.map((template) => (
                <Card 
                  key={template.id}
                  className="glass-pane rounded-2xl hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
                  onClick={() => handleCreateProject(template)}
                >
                  <CardContent className="p-4 text-center">
                    <template.icon className="h-8 w-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-medium text-foreground text-sm">{template.name}</h3>
                    <p className="text-xs text-foreground/60 mt-1">{template.tags.join(', ')}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Activity */}
            <Card className="glass-pane rounded-3xl">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isActivityLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-3 p-3 rounded-lg bg-foreground/5 animate-pulse">
                        <div className="w-2 h-2 bg-foreground/20 rounded-full"></div>
                        <div className="h-3 bg-foreground/20 rounded flex-1"></div>
                        <div className="h-3 w-16 bg-foreground/20 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.slice(0, 5).map((activity: any) => {
                      const isClickable = activity.projectId || activity.type === 'code_generated' || activity.type === 'integration_connected';
                      const handleActivityClick = () => {
                        if (activity.projectId) {
                          if (activity.type === 'code_generated') {
                            window.location.href = `/projects/${activity.projectId}/coding`;
                          } else if (activity.type === 'project_created') {
                            setActiveTab('projects');
                          } else {
                            window.location.href = `/projects/${activity.projectId}/coding`;
                          }
                        } else if (activity.type === 'integration_connected') {
                          window.location.href = '/integrations';
                        }
                      };

                      return (
                        <div
                          key={activity.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                            isClickable
                              ? "bg-foreground/5 hover:bg-foreground/10 cursor-pointer group"
                              : "bg-foreground/5"
                          }`}
                          onClick={isClickable ? handleActivityClick : undefined}
                        >
                          <div className={`w-2 h-2 ${getActivityColor(activity.type)} rounded-full ${isClickable ? 'group-hover:scale-125 transition-transform' : ''}`}></div>
                          <div className="flex-1">
                            <span className={`text-foreground/80 text-sm ${isClickable ? 'group-hover:text-foreground' : ''}`}>
                              {activity.title}
                            </span>
                            {activity.description && (
                              <div className="text-foreground/60 text-xs mt-1">{activity.description}</div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 ml-auto">
                            <span className="text-foreground/50 text-xs">{formatTimeAgo(activity.createdAt)}</span>
                            {isClickable && (
                              <ChevronRight className="h-3 w-3 text-foreground/40 group-hover:text-foreground/70 transition-colors" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {recentActivity.length > 5 && (
                      <div className="pt-3 border-t border-foreground/10">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-foreground/70 hover:text-foreground hover:bg-foreground/5 rounded-lg"
                          onClick={() => {
                            // Navigate to a future activity page or show more in a modal
                            toast({
                              title: "Coming Soon",
                              description: "Full activity history will be available soon.",
                            });
                          }}
                        >
                          View All Activity ({recentActivity.length} total)
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-foreground/60">
                    <p className="text-sm">No recent activity yet</p>
                    <p className="text-xs mt-1">Create a project or generate code to see your activity here</p>
                  </div>
                )}
              </CardContent>
            </Card>
                  </PageTransition>
                )}
              </AnimatePresence>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6" forceMount={activeTab === 'projects'}>
            <AnimatePresence mode="wait">
              {activeTab === 'projects' && (
                <PageTransition>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Your Projects</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/50 h-4 w-4" />
                  <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64 glass-pane rounded-full text-foreground placeholder:text-foreground/50"
                  />
                </div>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white transition-all duration-300 hover:scale-105 shadow-lg shadow-orange-500/25 font-semibold"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="glass-pane rounded-2xl animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-foreground/10 rounded mb-2"></div>
                      <div className="h-3 bg-foreground/10 rounded mb-4"></div>
                      <div className="flex space-x-2">
                        <div className="h-6 w-16 bg-foreground/10 rounded"></div>
                        <div className="h-6 w-16 bg-foreground/10 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project: any) => (
                  <Card key={project.id} className="glass-pane rounded-2xl hover:-translate-y-1 transition-all duration-200 group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">{project.name}</h3>
                          <p className="text-sm text-foreground/60">{project.description}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Link href={`/projects/${project.id}/coding`}>
                            <Button size="sm" variant="ghost" className="text-foreground/70 hover:text-foreground hover:bg-foreground/10 rounded-full" title="Code & Deploy">
                              <Code className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-foreground/70 hover:text-foreground hover:bg-foreground/10 rounded-full"
                            title="Settings"
                            onClick={(e) => {
                              e.preventDefault();
                              handleOpenSettings(project);
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {project.metadata?.framework && (
                            <Badge className="bg-primary/20 text-primary-foreground border-primary/30">
                              {project.metadata.framework}
                            </Badge>
                          )}
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                            {project.metadata?.status || 'draft'}
                          </Badge>
                        </div>
                        <span className="text-xs text-foreground/50">
                          {new Date(project.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bot className="h-12 w-12 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">No projects yet</h3>
                <p className="text-foreground/60 mb-8 max-w-md mx-auto">
                  {searchQuery ? "No projects match your search" : "Start building with AI assistance. Describe your idea and we'll handle the rest."}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => setActiveTab("agent")}
                    className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white transition-all duration-300 hover:scale-105 shadow-lg shadow-orange-500/25 px-8 font-semibold"
                    size="lg"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Start Building with AI
                  </Button>
                )}
              </div>
            )}
                </PageTransition>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6" forceMount={activeTab === 'overview'}>
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <PageTransition>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="glass-pane rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-foreground flex items-center text-sm">
                    <GitBranch className="h-4 w-4 mr-2" />
                    Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{projects.length}</div>
                  <p className="text-foreground/60 text-sm">Active projects</p>
                </CardContent>
              </Card>

              <Card className="glass-pane rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-foreground flex items-center text-sm">
                    <Cloud className="h-4 w-4 mr-2" />
                    Deployments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">0</div>
                  <p className="text-foreground/60 text-sm">Live deployments</p>
                </CardContent>
              </Card>

              <Card className="glass-pane rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-foreground flex items-center text-sm">
                    <Activity className="h-4 w-4 mr-2" />
                    Uptime
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">99.9%</div>
                  <p className="text-foreground/60 text-sm">Last 30 days</p>
                </CardContent>
              </Card>

              <Card className="glass-pane rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-foreground flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">180ms</div>
                  <p className="text-foreground/60 text-sm">Avg response time</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="glass-pane rounded-3xl">
              <CardHeader>
                <CardTitle className="text-foreground">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col border-border text-foreground hover:bg-primary/10 rounded-2xl"
                    onClick={() => setActiveTab("agent")}
                  >
                    <Brain className="h-6 w-6 mb-2" />
                    AI Build
                  </Button>
                  <Link href="/integrations">
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col border-border text-foreground hover:bg-primary/10 w-full rounded-2xl"
                    >
                      <Shield className="h-6 w-6 mb-2" />
                      Integrations
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col border-border text-foreground hover:bg-primary/10 rounded-2xl"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <Plus className="h-6 w-6 mb-2" />
                    New Project
                  </Button>
                  <Link href="/account">
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col border-border text-foreground hover:bg-primary/10 w-full rounded-2xl"
                    >
                      <User className="h-6 w-6 mb-2" />
                      Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
                </PageTransition>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Project Dialog - Modern Theme */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="glass-pane rounded-3xl border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground flex items-center text-display">
              <Sparkles className="h-5 w-5 mr-2 text-primary" />
              Create New Project
            </DialogTitle>
            <DialogDescription className="text-foreground/70">
              Give your project a name and our AI agents will help you build it from the ground up.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground font-medium">Project Name</Label>
              <Input
                id="name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My Netflix Clone"
                className="glass-pane rounded-lg text-foreground placeholder:text-foreground/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground font-medium">Description (Optional)</Label>
              <Textarea
                id="description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="A video streaming platform with user authentication, content management, and personalized recommendations..."
                rows={3}
                className="glass-pane rounded-lg text-foreground placeholder:text-foreground/50 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="framework" className="text-foreground font-medium">Framework</Label>
              <Select value={framework} onValueChange={setFramework}>
                <SelectTrigger className="glass-pane rounded-lg text-foreground">
                  <SelectValue placeholder="Choose a framework" />
                </SelectTrigger>
                <SelectContent className="glass-pane rounded-xl border-border">
                  <SelectItem value="react" className="text-foreground hover:bg-primary/10">
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      React - Modern Web App
                    </div>
                  </SelectItem>
                  <SelectItem value="node" className="text-foreground hover:bg-primary/10">
                    <div className="flex items-center">
                      <Server className="h-4 w-4 mr-2" />
                      Node.js - Backend API
                    </div>
                  </SelectItem>
                  <SelectItem value="fullstack" className="text-foreground hover:bg-primary/10">
                    <div className="flex items-center">
                      <Code className="h-4 w-4 mr-2" />
                      Full Stack - Complete App
                    </div>
                  </SelectItem>
                  <SelectItem value="react-native" className="text-foreground hover:bg-primary/10">
                    <div className="flex items-center">
                      <Smartphone className="h-4 w-4 mr-2" />
                      React Native - Mobile App
                    </div>
                  </SelectItem>
                  <SelectItem value="nextjs" className="text-foreground hover:bg-primary/10">
                    <div className="flex items-center">
                      <Rocket className="h-4 w-4 mr-2" />
                      Next.js - Production Ready
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              className="border-border text-foreground hover:bg-primary/10 rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={() => createProjectMutation.mutate({
                name: projectName,
                description: projectDescription,
                framework
              })}
              disabled={!projectName || !framework || createProjectMutation.isPending}
              className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg shadow-orange-500/25"
            >
              {createProjectMutation.isPending ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Project Settings Dialog */}
      <Dialog open={settingsProjectId !== null} onOpenChange={(open) => !open && setSettingsProjectId(null)}>
        <DialogContent className="glass-pane rounded-3xl border-border text-foreground max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground flex items-center">
              <Settings className="h-5 w-5 mr-2 text-primary" />
              Project Settings
            </DialogTitle>
            <DialogDescription className="text-foreground/70">
              Update your project details, framework, or manage advanced settings.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-2 glass-pane">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="settings-name" className="text-foreground font-medium">Project Name</Label>
                <Input
                  id="settings-name"
                  value={settingsName}
                  onChange={(e) => setSettingsName(e.target.value)}
                  placeholder="My Awesome Project"
                  className="glass-pane rounded-lg text-foreground placeholder:text-foreground/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="settings-description" className="text-foreground font-medium">Description</Label>
                <Textarea
                  id="settings-description"
                  value={settingsDescription}
                  onChange={(e) => setSettingsDescription(e.target.value)}
                  placeholder="Describe your project..."
                  rows={4}
                  className="glass-pane rounded-lg text-foreground placeholder:text-foreground/50 resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="settings-framework" className="text-foreground font-medium">Framework</Label>
                <Select value={settingsFramework} onValueChange={setSettingsFramework}>
                  <SelectTrigger className="glass-pane rounded-lg text-foreground bg-[rgba(15,15,20,0.6)] border-white/10 backdrop-blur-md">
                    <SelectValue placeholder="Choose a framework" />
                  </SelectTrigger>
                  <SelectContent className="glass-pane rounded-xl border-white/10 bg-[rgba(15,15,20,0.95)] backdrop-blur-xl">
                    <SelectItem value="react" className="text-foreground hover:bg-primary/10 rounded-lg my-1">
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2" />
                        React - Modern Web App
                      </div>
                    </SelectItem>
                    <SelectItem value="node" className="text-foreground hover:bg-primary/10 rounded-lg my-1">
                      <div className="flex items-center">
                        <Server className="h-4 w-4 mr-2" />
                        Node.js - Backend API
                      </div>
                    </SelectItem>
                    <SelectItem value="fullstack" className="text-foreground hover:bg-primary/10 rounded-lg my-1">
                      <div className="flex items-center">
                        <Code className="h-4 w-4 mr-2" />
                        Full Stack - Complete App
                      </div>
                    </SelectItem>
                    <SelectItem value="react-native" className="text-foreground hover:bg-primary/10 rounded-lg my-1">
                      <div className="flex items-center">
                        <Smartphone className="h-4 w-4 mr-2" />
                        React Native - Mobile App
                      </div>
                    </SelectItem>
                    <SelectItem value="nextjs" className="text-foreground hover:bg-primary/10 rounded-lg my-1">
                      <div className="flex items-center">
                        <Rocket className="h-4 w-4 mr-2" />
                        Next.js - Production Ready
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6 mt-6">
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-red-500 mb-1">Danger Zone</h4>
                    <p className="text-xs text-foreground/60 mb-4">
                      Deleting a project is permanent and cannot be undone. All associated data, code, and deployments will be removed.
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/30"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Project
                    </Button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-4">
                <h4 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" size="sm" className="justify-start glass-pane rounded-lg" disabled>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive Project
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start glass-pane rounded-lg" disabled>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate Project
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start glass-pane rounded-lg" disabled>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start glass-pane rounded-lg" disabled>
                    <GitBranch className="h-4 w-4 mr-2" />
                    View History
                  </Button>
                </div>
                <p className="text-xs text-foreground/50 mt-3">
                  These features are coming soon.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setSettingsProjectId(null)}
              className="border-border text-foreground hover:bg-primary/10 rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSettings}
              disabled={!settingsName || !settingsFramework || updateProjectMutation.isPending}
              className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg shadow-orange-500/25"
            >
              {updateProjectMutation.isPending ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="glass-pane rounded-3xl border-red-500/20 bg-[rgba(15,15,20,0.98)] backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-foreground flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-foreground/70">
              This action cannot be undone. This will permanently delete the project{" "}
              <span className="font-semibold text-foreground">{settingsName}</span> and remove all associated data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 my-2">
            <p className="text-sm text-foreground/80">
              <strong>What will be deleted:</strong>
            </p>
            <ul className="text-sm text-foreground/60 mt-2 space-y-1 ml-4 list-disc">
              <li>All project files and code</li>
              <li>Deployment history and configurations</li>
              <li>Related integrations and connections</li>
              <li>Activity logs and analytics</li>
            </ul>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full border-border hover:bg-foreground/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={deleteProjectMutation.isPending}
              className="rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold shadow-lg shadow-red-500/25"
            >
              {deleteProjectMutation.isPending ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Forever
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </AppShell>
    </ErrorBoundary>
  );
}