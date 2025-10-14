import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { AppShell } from '@/components/AppShell';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <AppShell>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
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

          {/* Simple Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-background/50 border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary text-sm">📁</span>
                </div>
              </div>
            </div>

            <div className="bg-background/50 border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Deployments</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary text-sm">⚡</span>
                </div>
              </div>
            </div>

            <div className="bg-background/50 border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Cost</p>
                  <p className="text-2xl font-bold">$0</p>
                </div>
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary text-sm">💰</span>
                </div>
              </div>
            </div>

            <div className="bg-background/50 border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                  <p className="text-2xl font-bold">99.9%</p>
                </div>
                <div className="h-8 w-8 bg-green-500/10 rounded-full flex items-center justify-center">
                  <span className="text-green-500 text-sm">✓</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={() => setLocation('/deploy')}
                className="p-4 bg-background/50 border border-border rounded-lg hover:bg-background/80 transition-colors text-left"
              >
                <div className="text-lg font-medium mb-1">Deploy New Project</div>
                <div className="text-sm text-muted-foreground">Start a new deployment</div>
              </button>
              
              <button 
                onClick={() => setLocation('/integrations')}
                className="p-4 bg-background/50 border border-border rounded-lg hover:bg-background/80 transition-colors text-left"
              >
                <div className="text-lg font-medium mb-1">Manage Integrations</div>
                <div className="text-sm text-muted-foreground">Connect cloud providers</div>
              </button>
              
              <button 
                onClick={() => setLocation('/account')}
                className="p-4 bg-background/50 border border-border rounded-lg hover:bg-background/80 transition-colors text-left"
              >
                <div className="text-lg font-medium mb-1">View Costs</div>
                <div className="text-sm text-muted-foreground">Monitor spending</div>
              </button>
              
              <button 
                onClick={() => setLocation('/settings')}
                className="p-4 bg-background/50 border border-border rounded-lg hover:bg-background/80 transition-colors text-left"
              >
                <div className="text-lg font-medium mb-1">Account Settings</div>
                <div className="text-sm text-muted-foreground">Manage your account</div>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="bg-background/50 border border-border rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Successfully deployed Next.js app to AWS</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">High CPU usage detected on production server</p>
                    <p className="text-xs text-muted-foreground">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">GitHub integration updated successfully</p>
                    <p className="text-xs text-muted-foreground">6 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cloud Accounts */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Cloud Accounts</h2>
            <div className="bg-background/50 border border-border rounded-lg p-6">
              <div className="text-center py-8">
                <div className="text-4xl mb-4">☁️</div>
                <h3 className="text-lg font-semibold mb-2">No cloud accounts connected</h3>
                <p className="text-muted-foreground mb-4">
                  Connect your cloud providers to start deploying
                </p>
                <button 
                  onClick={() => setLocation('/integrations')}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Connect Cloud Account
                </button>
              </div>
            </div>
          </div>

          {/* Projects Overview */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Projects</h2>
            <div className="bg-background/50 border border-border rounded-lg p-6">
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-4">
                  Deploy your first application to get started
                </p>
                <button 
                  onClick={() => setLocation('/deploy')}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Deploy New Project
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
