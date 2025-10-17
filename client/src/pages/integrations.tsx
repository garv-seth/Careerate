import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CloudAccountsManager } from "@/components/CloudAccountsManager";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import React, { useEffect } from "react";
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

  // In unified grid, hide items we surface via dedicated panels (Azure resources, GitHub repos) and remove OCI
  const hiddenIds = new Set(['github','oracle']);
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

        {/* Unified Integrations Grid */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">Integrations</h2>
          <p className="text-foreground/70 mb-6">Connect providers and tools. Agents will use these to deploy and manage your stack.</p>
        </div>

        {/* Azure Resources Panel */}
        <AzureResourcesPanel />

        {/* GitHub Repo Selector when connected */}
        <GitHubRepoSelector />

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

function AzureResourcesPanel() {
  const [subs, setSubs] = React.useState<any[] | null>(null);
  const [rg, setRg] = React.useState<any[] | null>(null);
  const [apps, setApps] = React.useState<any[] | null>(null);
  const [registries, setRegistries] = React.useState<any[] | null>(null);
  const [selectedSub, setSelectedSub] = React.useState<string | null>(null);
  const [selectedRg, setSelectedRg] = React.useState<string | null>(null);

  useEffect(() => {
    fetch('/api/azure/subscriptions', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(j => setSubs(j?.subscriptions || null))
      .catch(() => setSubs(null));
  }, []);

  useEffect(() => {
    if (!selectedSub) return;
    fetch(`/api/azure/resource-groups?subscriptionId=${encodeURIComponent(selectedSub)}`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(j => setRg(j?.resourceGroups || null))
      .catch(() => setRg(null));
  }, [selectedSub]);

  useEffect(() => {
    if (!selectedSub) return;
    const rgParam = selectedRg ? `&resourceGroup=${encodeURIComponent(selectedRg)}` : '';
    fetch(`/api/azure/container-apps?subscriptionId=${encodeURIComponent(selectedSub)}${rgParam}`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(j => setApps(j?.containerApps || null))
      .catch(() => setApps(null));
    fetch(`/api/azure/registries?subscriptionId=${encodeURIComponent(selectedSub)}${rgParam}`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(j => setRegistries(j?.registries || null))
      .catch(() => setRegistries(null));
  }, [selectedSub, selectedRg]);

  if (!subs) return null;

  return (
    <div className="glass-pane rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Azure Resources</h3>
      </div>
      <div className="flex gap-3 flex-wrap">
        <select aria-label="Azure Subscription" className="bg-background border border-border rounded px-2 py-1" value={selectedSub || ''} onChange={e => setSelectedSub(e.target.value)}>
          <option value="">Select Subscription</option>
          {(subs || []).map((s: any) => (
            <option key={s.subscriptionId} value={s.subscriptionId}>{s.displayName || s.subscriptionId}</option>
          ))}
        </select>
        {selectedSub && (
          <select aria-label="Azure Resource Group" className="bg-background border border-border rounded px-2 py-1" value={selectedRg || ''} onChange={e => setSelectedRg(e.target.value)}>
            <option value="">All Resource Groups</option>
            {(rg || []).map((g: any) => (
              <option key={g.name} value={g.name}>{g.name}</option>
            ))}
          </select>
        )}
      </div>

      {selectedSub && (
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <div className="text-sm font-medium mb-1">Container Apps</div>
            <div className="space-y-2">
              {(apps || []).map((a: any) => (
                <div key={a.id} className="p-2 rounded border border-border">
                  <div className="text-sm">{a.name}</div>
                  <div className="text-xs text-foreground/60">{a.resourceGroup} • {a.location}</div>
                </div>
              ))}
              {!apps && <div className="text-foreground/60 text-sm">No data</div>}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium mb-1">Container Registries</div>
            <div className="space-y-2">
              {(registries || []).map((r: any) => (
                <div key={r.id} className="p-2 rounded border border-border">
                  <div className="text-sm">{r.name}</div>
                  <div className="text-xs text-foreground/60">{r.resourceGroup} • {r.location}</div>
                </div>
              ))}
              {!registries && <div className="text-foreground/60 text-sm">No data</div>}
            </div>
          </div>
        </div>
      )}
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
    // Check if GitHub is actually connected by trying to fetch repos
    setLoading(true);
    // Load user first for header
    fetch('/api/github/user', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(u => setUser(u))
      .catch(() => {});

    fetch('/api/integrations/github/repositories', { credentials: 'include' })
      .then(async r => {
        if (!r.ok) {
          if (r.status === 404) {
            // Not connected - don't show anything
            setRepos(null);
            return;
          }
          throw new Error((await r.json()).message || 'Failed to load repos');
        }
        return r.json();
      })
      .then(data => {
        if (data) {
          setRepos(Array.isArray(data) ? data : (data.repositories || []));
        }
      })
      .catch(e => {
        setError(e.message);
        setRepos(null); // Don't show error UI if just not connected
      })
      .finally(() => setLoading(false));
  }, []);

  if (repos === null && !loading && !error) return null;

  return (
    <div className="glass-pane rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-foreground">GitHub Repositories {user ? `• @${user.login}` : ''}</h3>
        <Badge variant={repos && repos.length > 0 ? 'default' : 'secondary'}>
          {repos && repos.length > 0 ? 'Connected' : 'Authorize to load repos'}
        </Badge>
      </div>
      {loading && <div className="text-foreground/60">Loading repositories…</div>}
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {repos && repos.length > 0 && (
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