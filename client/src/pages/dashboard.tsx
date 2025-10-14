import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { AppShell } from '@/components/AppShell';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: projects = [] } = useQuery({
    queryKey: ['/api/projects'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const res = await fetch('/api/projects', { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    }
  });

  const { data: cloudAccounts = [] } = useQuery({
    queryKey: ['/api/integrations/cloud-providers'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const res = await fetch('/api/integrations/cloud-providers', { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    }
  });

  const totalProjects = Array.isArray(projects) ? projects.length : 0;
  const activeDeployments = 0; // TODO: wire to deployments endpoint
  const totalCost = 0; // TODO: wire to cost endpoint per provider
  const uptime = '99.9%';

  // Mock data for now - will be replaced with real API calls
  const mockActivity = [
    {
      id: '1',
      type: 'deployment' as const,
      description: 'Successfully deployed Next.js app to AWS',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'success' as const,
      link: '/deploy/1'
    },
    {
      id: '2',
      type: 'alert' as const,
      description: 'High CPU usage detected on production server',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      status: 'failed' as const,
      link: '/monitor/alerts'
    },
    {
      id: '3',
      type: 'update' as const,
      description: 'GitHub integration updated successfully',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      status: 'success' as const
    }
  ];

  // Show sign-in prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <AppShell>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔐</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Authentication Required</h1>
              <p className="text-muted-foreground">
                Please sign in to access your dashboard and manage your deployments.
              </p>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => setLocation('/')}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Go to Sign In
              </button>
              <button
                onClick={() => setLocation('/')}
                className="w-full px-6 py-3 border border-border text-foreground rounded-lg hover:bg-background/50 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {user?.name || user?.preferred_username || 'User'}!
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your deployments and infrastructure.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-background/50 border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                  <p className="text-2xl font-bold">{totalProjects}</p>
                </div>
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary text-sm">📁</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                +2 from last month
              </p>
            </div>

            <div className="bg-background/50 border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Deployments</p>
                  <p className="text-2xl font-bold">{activeDeployments}</p>
                </div>
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary text-sm">⚡</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                All systems operational
              </p>
            </div>

            <div className="bg-background/50 border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Cost</p>
                  <p className="text-2xl font-bold">${totalCost || '–'}</p>
                </div>
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary text-sm">💰</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                -12% from last month
              </p>
            </div>

            <div className="bg-background/50 border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                  <p className="text-2xl font-bold">{uptime}</p>
                </div>
                <div className="h-8 w-8 bg-green-500/10 rounded-full flex items-center justify-center">
                  <span className="text-green-500 text-sm">✓</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Last 30 days
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <div className="bg-background/50 border border-border rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-lg">⚡</span>
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <button
                    onClick={() => setLocation('/agent')}
                    className="w-full p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-left font-medium"
                  >
                    <div className="text-sm font-semibold mb-1">🤖 Talk to AI Agent</div>
                    <div className="text-xs opacity-90">Get intelligent deployment help</div>
                  </button>

                  <button
                    onClick={() => setLocation('/deploy')}
                    className="w-full p-3 bg-background border border-border rounded-lg hover:bg-background/80 transition-colors text-left"
                  >
                    <div className="text-sm font-semibold mb-1">🚀 Deploy New Project</div>
                    <div className="text-xs text-muted-foreground">Start a new deployment</div>
                  </button>

                  <button
                    onClick={() => setLocation('/integrations')}
                    className="w-full p-3 bg-background border border-border rounded-lg hover:bg-background/80 transition-colors text-left"
                  >
                    <div className="text-sm font-semibold mb-1">🔗 Manage Integrations</div>
                    <div className="text-xs text-muted-foreground">Connect cloud providers</div>
                  </button>

                  <button
                    onClick={() => setLocation('/account')}
                    className="w-full p-3 bg-background border border-border rounded-lg hover:bg-background/80 transition-colors text-left"
                  >
                    <div className="text-sm font-semibold mb-1">💰 View Costs</div>
                    <div className="text-xs text-muted-foreground">Monitor spending</div>
                  </button>

                  <button
                    onClick={() => setLocation('/settings')}
                    className="w-full p-3 bg-background border border-border rounded-lg hover:bg-background/80 transition-colors text-left"
                  >
                    <div className="text-sm font-semibold mb-1">⚙️ Account Settings</div>
                    <div className="text-xs text-muted-foreground">Manage your account</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <div className="bg-background/50 border border-border rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-lg">📋</span>
                  Recent Activity
                </h2>
                <div className="space-y-4">
                  {mockActivity.map((activity) => (
                    <div key={activity.id} className={`flex items-start space-x-3 p-3 bg-background/30 rounded-lg`}>
                      <div
                        className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                          activity.status === 'success' ? 'bg-emerald-500' :
                          activity.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                        }`}
                      />
                      <div className="flex-grow">
                        <p className="text-sm font-medium text-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cloud Accounts & Projects */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Cloud Accounts */}
            <div className="bg-background/50 border border-border rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-lg">☁️</span>
                Cloud Accounts
              </h2>
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🔗</div>
                <h3 className="text-lg font-semibold mb-2">Connect Your Clouds</h3>
                <p className="text-muted-foreground mb-4">
                  Connect AWS, Azure, GCP, and more for seamless deployments
                </p>
                <button
                  onClick={() => setLocation('/integrations')}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Connect Accounts
                </button>
              </div>
            </div>

            {/* Projects Overview */}
            <div className="bg-background/50 border border-border rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-lg">📦</span>
                Your Projects
              </h2>
              {totalProjects === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🚀</div>
                  <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Deploy your first application to get started
                  </p>
                  <button
                    onClick={() => setLocation('/deploy')}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  >
                    Deploy New Project
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Project list would go here */}
                  <p className="text-muted-foreground">Project management coming soon...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}