import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CloudAccountsManager } from "@/components/CloudAccountsManager";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { Cloud, Github, GitBranch, Database, Activity, Bell, MessageSquare, Mail, Monitor } from "lucide-react";

export default function IntegrationsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/integrations/catalog"],
    retry: false,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    queryFn: async () => {
      try {
        const res = await fetch("/api/integrations/catalog", { credentials: "include" });
        if (res.status === 401) {
          return { integrations: [], status: [] };
        }
        if (!res.ok) {
          console.error("Failed to load integrations catalog:", res.status, res.statusText);
          return { integrations: [], status: [] };
        }
        return res.json();
      } catch (error) {
        console.error("Integrations catalog query error:", error);
        return { integrations: [], status: [] };
      }
    },
  });

  const { data: connectedData } = useQuery({
    queryKey: ["/api/integrations/connected-services"],
    retry: false,
    queryFn: async () => {
      try {
        const res = await fetch('/api/integrations/connected-services', { credentials: 'include' });
        if (!res.ok) return { connected: [] };
        return res.json();
      } catch {
        return { connected: [] };
      }
    }
  });

  // Handle oauth callback query params and refresh cloud accounts
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('azure') === 'connected' || params.get('gcp') === 'connected') {
      toast({ title: 'Integration Connected', description: 'Your cloud account is now connected.' });
      queryClient.invalidateQueries({ queryKey: ['/api/integrations/cloud-providers'] });
      const url = window.location.pathname; // drop params
      window.history.replaceState({}, '', url);
    }
    if (params.get('github') === 'connected') {
      toast({ title: 'GitHub Connected', description: 'Your GitHub account is now connected.' });
      const url = window.location.pathname;
      window.history.replaceState({}, '', url);
    }
    if (params.get('gitlab') === 'connected') {
      toast({ title: 'GitLab Connected', description: 'Your GitLab account is now connected.' });
      const url = window.location.pathname;
      window.history.replaceState({}, '', url);
    }
    if (params.get('error')) {
      toast({ title: 'Integration Error', description: params.get('error')!, variant: 'destructive' });
      const url = window.location.pathname;
      window.history.replaceState({}, '', url);
    }
  }, [queryClient, toast]);

  const mapStatus = new Map<string, { ready: boolean; missing: string[] }>();
  (data?.status || []).forEach((s: any) => mapStatus.set(s.id, s));
  // Force mark connected providers as ready if backend reports them linked
  (connectedData?.connected || []).forEach((id: string) => {
    const existing = mapStatus.get(id);
    if (existing) {
      mapStatus.set(id, { ready: true, missing: [] });
    }
  });

  // Filter out providers already represented in CloudAccountsManager cards
  const hiddenIds = new Set(['aws','azure','gcp']);
  const grouped = (data?.integrations || []).filter((i: any) => !hiddenIds.has(i.id)).reduce((acc: any, i: any) => {
    acc[i.category] = acc[i.category] || [];
    acc[i.category].push(i);
    return acc;
  }, {} as Record<string, any[]>);

  const handleConnectGitHub = () => {
    window.location.href = "/api/integrations/github/oauth/initiate";
  };

  const handleConnectGitLab = async () => {
    try {
      const res = await fetch('/api/integrations/gitlab/oauth/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({})
      });
      const j = await res.json();
      if (j.authUrl) {
        window.location.href = j.authUrl;
      } else {
        toast({ title: 'GitLab', description: j.message || 'Failed to start GitLab OAuth', variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'GitLab', description: e.message || 'Failed to start GitLab OAuth', variant: 'destructive' });
    }
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Integrations</h1>
          <p className="text-foreground/70">Connect your accounts to enable AI agents to deploy and manage your infrastructure.</p>
        </div>

        {/* Cloud Accounts Section */}
        <CloudAccountsManager />

        {/* GCP project selection when connected */}
        <GcpProjectSelector />

        <Separator className="my-8" />

        {/* Other Integrations */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">Other Integrations</h2>
          <p className="text-foreground/70 mb-6">Additional services and tools for monitoring, notifications, and more.</p>
        </div>

        {/* GitHub Repo Selector when connected */}
        <GitHubRepoSelector />

        {isLoading ? (
          <div className="text-foreground/60">Loading…</div>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="space-y-3">
              <h2 className="text-xl font-semibold capitalize text-foreground">{category.replace('_',' ')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(items as any[]).map((i) => {
                  const st = mapStatus.get(i.id);
                  const ready = st?.ready;
                  const isGitHub = i.id === 'github';

                  const getIntegrationIcon = (id: string) => {
                    const iconMap: Record<string, React.ElementType> = {
                      // Cloud providers
                      'aws': Cloud,
                      'azure': Cloud,
                      'gcp': Cloud,
                      'oracle': Cloud,
                      'vercel': Cloud,
                      // Source control
                      'github': Github,
                      'gitlab': GitBranch,
                      // Databases
                      'mongodb': Database,
                      'neon': Database,
                      'railway': Database,
                      // Monitoring
                      'datadog': Activity,
                      'pagerduty': Bell,
                      'newrelic': Monitor,
                      'opentelemetry': Activity,
                      // Notifications
                      'slack': MessageSquare,
                      'discord': MessageSquare,
                      'teams': MessageSquare,
                      'sendgrid': Mail,
                    };
                    return iconMap[id] || Cloud;
                  };

                  const IconComponent = getIntegrationIcon(i.id);

                  // Prefer local assets, fall back to brand SVGs via simple-icons CDN
                  const logoSrcById: Record<string, string> = {
                    aws: '/aws-logo.svg',
                    azure: '/azure-logo.svg',
                    gcp: '/gcp-logo.svg',
                    github: '/github-logo.svg',
                    datadog: '/datadog-logo.svg',
                    pagerduty: '/pagerduty-logo.svg',
                    vercel: '/vercel-logo.svg',
                    oracle: '/oracle-logo.svg',
                    gitlab: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/gitlab.svg',
                    slack: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/slack.svg',
                    discord: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/discord.svg',
                    mongodb: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/mongodb.svg',
                    newrelic: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/newrelic.svg',
                    grafana: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/grafana.svg',
                    prometheus: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/prometheus.svg',
                    stripe: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/stripe.svg',
                    sendgrid: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/sendgrid.svg',
                    twilio: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/twilio.svg',
                    jira: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/jirasoftware.svg',
                    notion: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/notion.svg',
                    trello: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/trello.svg',
                    docker: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/docker.svg',
                    kubernetes: 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/kubernetes.svg',
                  };
                  const logoSrc = logoSrcById[i.id];

                  return (
                    <Card key={i.id} className="glass-pane rounded-2xl hover:border-primary/50 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            {logoSrc ? (
                              <img src={logoSrc} alt={i.name} className="w-6 h-6" />
                            ) : IconComponent ? (
                              <IconComponent className="w-6 h-6 text-foreground" />
                            ) : (
                              <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center">
                                <span className="text-xs font-bold text-primary">{i.name.charAt(0)}</span>
                              </div>
                            )}
                            <span className="text-foreground">{i.name}</span>
                          </div>
                          <Badge className={ready ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-foreground/10 text-foreground/60 border-foreground/20"}>
                            {ready ? "Connected" : "Disconnected"}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {ready ? (
                          <p className="text-xs text-foreground/60">All required credentials configured. Agents can access this integration.</p>
                        ) : (
                          <div className="text-xs text-foreground/60">
                            {isGitHub ? (
                              "Connect your GitHub account to let agents access your repositories."
                            ) : (
                              `Missing: ${(st?.missing || []).join(', ') || 'Configuration required'}`
                            )}
                          </div>
                        )}
                        <div className="flex gap-2">
                          {isGitHub && !ready && (
                            <Button
                              onClick={handleConnectGitHub}
                              size="sm"
                              className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                            >
                              Connect GitHub
                            </Button>
                          )}
                          {i.id === 'gitlab' && !ready && (
                            <Button
                              onClick={handleConnectGitLab}
                              size="sm"
                              className="rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
                            >
                              Connect GitLab
                            </Button>
                          )}
                          {i.docsUrl && (
                            <Button asChild size="sm" variant="outline" className="rounded-full border-border hover:bg-primary/10">
                              <a href={i.docsUrl} target="_blank" rel="noreferrer">Docs</a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  ArrowLeft,
  Plus,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  Shield,
  Cloud,
  Database,
  Activity,
  Server,
  GitBranch,
  Container,
  Monitor,
  Zap,
  Globe
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface DevOpsIntegration {
  id: string;
  name: string;
  description: string;
  category: 'container' | 'cloud' | 'monitoring' | 'database' | 'security' | 'deployment' | 'source-control';
  icon: React.ElementType;
  status: 'connected' | 'disconnected' | 'configuring' | 'error';
  provider: string;
  authType: 'oauth' | 'api-key' | 'service-account';
  setupUrl?: string;
  documentation?: string;
}

const devopsIntegrations: DevOpsIntegration[] = [
  // Container & Orchestration
  {
    id: 'docker',
    name: 'Docker',
    description: 'Container platform for building, sharing, and running applications',
    category: 'container',
    icon: Container,
    status: 'disconnected',
    provider: 'docker',
    authType: 'api-key'
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes',
    description: 'Container orchestration platform for automated deployment and scaling',
    category: 'container',
    icon: Server,
    status: 'disconnected',
    provider: 'kubernetes',
    authType: 'service-account'
  },

  // Cloud Platforms
  {
    id: 'aws',
    name: 'Amazon Web Services',
    description: 'Cloud computing platform with comprehensive services',
    category: 'cloud',
    icon: Cloud,
    status: 'disconnected',
    provider: 'aws',
    authType: 'api-key'
  },
  {
    id: 'azure',
    name: 'Microsoft Azure',
    description: 'Cloud computing service for building, testing, deploying applications',
    category: 'cloud',
    icon: Cloud,
    status: 'connected',
    provider: 'azure',
    authType: 'service-account'
  },
  {
    id: 'gcp',
    name: 'Google Cloud Platform',
    description: 'Suite of cloud computing services running on Google infrastructure',
    category: 'cloud',
    icon: Cloud,
    status: 'disconnected',
    provider: 'gcp',
    authType: 'service-account'
  },

  // Monitoring & Observability
  {
    id: 'datadog',
    name: 'Datadog',
    description: 'Monitoring and analytics platform for cloud-scale applications',
    category: 'monitoring',
    icon: Activity,
    status: 'disconnected',
    provider: 'datadog',
    authType: 'api-key'
  },
  // Additional stubs (Coming soon)
  {
    id: 'oci',
    name: 'Oracle Cloud Infrastructure',
    description: 'Compute, networking, and databases on OCI',
    category: 'cloud',
    icon: Cloud,
    status: 'disconnected',
    provider: 'oci',
    authType: 'api-key',
    logo: '/oracle-logo.svg'
  },
  {
    id: 'pagerduty',
    name: 'PagerDuty',
    description: 'On-call management and incident response',
    category: 'monitoring',
    icon: Activity,
    status: 'disconnected',
    provider: 'pagerduty',
    authType: 'api-key'
  },
  {
    id: 'vercel',
    name: 'Vercel',
    description: 'Frontend hosting and serverless functions',
    category: 'deployment',
    icon: Globe,
    status: 'disconnected',
    provider: 'vercel',
    authType: 'oauth'
  },
  {
    id: 'newrelic',
    name: 'New Relic',
    description: 'Full-stack observability platform for monitoring applications',
    category: 'monitoring',
    icon: Monitor,
    status: 'disconnected',
    provider: 'newrelic',
    authType: 'api-key'
  },
  {
    id: 'grafana',
    name: 'Grafana',
    description: 'Open source analytics and interactive visualization platform',
    category: 'monitoring',
    icon: Activity,
    status: 'disconnected',
    provider: 'grafana',
    authType: 'api-key'
  },

  // Databases
  {
    id: 'mongodb',
    name: 'MongoDB Atlas',
    description: 'Multi-cloud database service built for modern applications',
    category: 'database',
    icon: Database,
    status: 'disconnected',
    provider: 'mongodb',
    authType: 'api-key'
  },
  {
    id: 'snowflake',
    name: 'Snowflake',
    description: 'Cloud data platform for data warehousing and analytics',
    category: 'database',
    icon: Database,
    status: 'disconnected',
    provider: 'snowflake',
    authType: 'api-key'
  },

  // Security
  {
    id: 'vault',
    name: 'HashiCorp Vault',
    description: 'Secrets management and data protection platform',
    category: 'security',
    icon: Shield,
    status: 'disconnected',
    provider: 'vault',
    authType: 'api-key'
  },

  // Deployment & CI/CD
  {
    id: 'vercel',
    name: 'Vercel',
    description: 'Platform for frontend frameworks and static sites',
    category: 'deployment',
    icon: Zap,
    status: 'disconnected',
    provider: 'vercel',
    authType: 'oauth'
  },
  {
    id: 'netlify',
    name: 'Netlify',
    description: 'Platform for deploying and hosting modern web projects',
    category: 'deployment',
    icon: Globe,
    status: 'disconnected',
    provider: 'netlify',
    authType: 'oauth'
  }
];

const categoryNames = {
  container: 'Container & Orchestration',
  cloud: 'Cloud Platforms',
  monitoring: 'Monitoring & Observability',
  database: 'Databases',
  security: 'Security',
  deployment: 'Deployment',
  'source-control': 'Source Control'
};

export function DevOpsIntegrations() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [configureIntegration, setConfigureIntegration] = useState<DevOpsIntegration | null>(null);
  const [credentials, setCredentials] = useState({ apiKey: '', endpoint: '' });
  const { toast } = useToast();

  const filteredIntegrations = devopsIntegrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Object.keys(categoryNames) as Array<keyof typeof categoryNames>;
  const connectedCount = devopsIntegrations.filter(i => i.status === 'connected').length;

  const handleConfigure = (integration: DevOpsIntegration) => {
    setConfigureIntegration(integration);
    setCredentials({ apiKey: '', endpoint: '' });
  };

  const handleSaveConfiguration = () => {
    if (!configureIntegration) return;

    // Here you would save to your backend
    toast({
      title: `${configureIntegration.name} configured`,
      description: 'Integration has been successfully connected',
    });

    setConfigureIntegration(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'configuring':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'configuring':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">DevOps Integrations</h1>
                <p className="text-sm text-gray-600">{connectedCount} connected</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All Integrations
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {categoryNames[category]}
              </Button>
            ))}
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map((integration) => (
            <Card key={integration.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <integration.icon className="h-6 w-6 text-gray-700" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {categoryNames[integration.category]}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(integration.status)}
                  <Badge className={getStatusColor(integration.status)} variant="outline">
                    {integration.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {integration.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Auth: {integration.authType.replace('-', ' ')}
                  </div>
                  <Button
                    size="sm"
                    variant={integration.status === 'connected' ? 'outline' : 'default'}
                    onClick={() => handleConfigure(integration)}
                  >
                    {integration.status === 'connected' ? (
                      <>
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </>
                    ) : (
                      <>
                        <Plus className="h-3 w-3 mr-1" />
                        Connect
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredIntegrations.length === 0 && (
          <div className="text-center py-12">
            <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations found</h3>
            <p className="text-gray-600">
              Try adjusting your search or category filter
            </p>
          </div>
        )}
      </div>

      {/* Configuration Dialog */}
      <Dialog open={!!configureIntegration} onOpenChange={() => setConfigureIntegration(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {configureIntegration && (
                <>
                  <configureIntegration.icon className="h-5 w-5" />
                  <span>Configure {configureIntegration.name}</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Enter your credentials to connect {configureIntegration?.name} to your deployment pipeline.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {configureIntegration?.authType === 'api-key' && (
              <div>
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={credentials.apiKey}
                  onChange={(e) => setCredentials({...credentials, apiKey: e.target.value})}
                  placeholder="Enter your API key"
                />
              </div>
            )}

            {(configureIntegration?.authType === 'api-key' || configureIntegration?.authType === 'service-account') && (
              <div>
                <Label htmlFor="endpoint">Endpoint URL (optional)</Label>
                <Input
                  id="endpoint"
                  value={credentials.endpoint}
                  onChange={(e) => setCredentials({...credentials, endpoint: e.target.value})}
                  placeholder="https://api.example.com"
                />
              </div>
            )}

            {configureIntegration?.authType === 'oauth' && (
              <div className="text-center py-4">
                <Button className="w-full">
                  Connect with {configureIntegration.name}
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  You'll be redirected to {configureIntegration.name} to authorize access
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigureIntegration(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveConfiguration}
              disabled={configureIntegration?.authType === 'api-key' && !credentials.apiKey}
            >
              Connect Integration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GitHubRepoSelector() {
  const { toast } = useToast();
  const [repos, setRepos] = React.useState<any[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<{ login: string } | null>(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('github') === 'connected';
    if (!connected) return;
    setLoading(true);
    // Load user first for header
    fetch('/api/github/user', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(u => setUser(u))
      .catch(() => {})
      .finally(() => {});
    fetch('/api/integrations/github/repositories', { credentials: 'include' })
      .then(async r => {
        if (!r.ok) throw new Error((await r.json()).message || 'Failed to load repos');
        return r.json();
      })
      .then(data => setRepos(Array.isArray(data) ? data : (data.repositories || [])))
      .catch(e => { setError(e.message); toast({ title: 'GitHub', description: e.message, variant: 'destructive' }); })
      .finally(() => setLoading(false));
  }, []);

  if (repos === null && !loading && !error) return null;

  return (
    <div className="glass-pane rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-foreground">GitHub Repositories {user ? `• @${user.login}` : ''}</h3>
        <Badge>Connected</Badge>
      </div>
      {loading && <div className="text-foreground/60">Loading repositories…</div>}
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {repos && (
        <div className="grid md:grid-cols-2 gap-3">
          {repos.map(r => (
            <div key={r.id} className="p-3 rounded-lg border border-border flex items-center justify-between">
              <div>
                <div className="font-medium text-foreground">{r.name}</div>
                <div className="text-xs text-foreground/60">{r.private ? 'Private' : 'Public'} • {r.default_branch}</div>
              </div>
              <Button size="sm" onClick={() => window.location.href = `/deploy?repo=${encodeURIComponent(r.name)}`}>Select</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GcpProjectSelector() {
  const { toast } = useToast();
  const [projects, setProjects] = React.useState<any[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const params = new URLSearchParams(window.location.search);
  const connected = params.get('gcp') === 'connected';

  React.useEffect(() => {
    if (!connected) return;
    setLoading(true);
    fetch('/api/gcp/projects', { credentials: 'include' })
      .then(async r => { if (!r.ok) throw new Error((await r.json()).message); return r.json(); })
      .then(setProjects)
      .catch(e => { setError(e.message); toast({ title: 'GCP', description: e.message, variant: 'destructive' }); })
      .finally(() => setLoading(false));
  }, [connected]);

  if (!connected) return null;

  return (
    <div className="glass-pane rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-foreground">GCP Projects</h3>
        <Badge>Connected</Badge>
      </div>
      {loading && <div className="text-foreground/60">Loading projects…</div>}
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {projects && (
        <div className="grid md:grid-cols-2 gap-3">
          {projects.map((p) => (
            <div key={p.projectId} className="p-3 rounded-lg border border-border flex items-center justify-between">
              <div>
                <div className="font-medium text-foreground">{p.name}</div>
                <div className="text-xs text-foreground/60">{p.projectId}</div>
              </div>
              <Button size="sm" onClick={async () => {
                const res = await fetch('/api/gcp/select-project', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) });
                if (res.ok) { toast({ title: 'GCP', description: 'Project selected.' }); } else { const j = await res.json(); toast({ title: 'GCP', description: j.message || 'Failed', variant: 'destructive' }); }
              }}>Select</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}