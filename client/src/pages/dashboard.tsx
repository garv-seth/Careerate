import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { QuickActions } from '@/components/QuickActions';
import { DeploymentHistory } from '@/components/DeploymentHistory';
import { CloudAccountsManager } from '@/components/CloudAccountsManager';
import { 
  Activity, 
  BarChart3, 
  Cloud, 
  GitBranch, 
  PlusCircle, 
  Settings, 
  Zap,
  TrendingUp,
  Users,
  Server,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeDeployments: 0,
    totalCost: 0,
    uptime: '99.9%'
  });

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

  useEffect(() => {
    // Temporarily disable redirect to test dashboard functionality
    // if (!isLoading && !isAuthenticated) {
    //   setLocation('/');
    // }
  }, [isAuthenticated, isLoading, setLocation]);

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

  // Temporarily show dashboard even when not authenticated for testing
  // if (!isAuthenticated) {
  //   return (
  //     <AppShell>
  //       <div className="min-h-screen bg-background flex items-center justify-center">
  //         <div className="text-center">
  //           <h1 className="text-2xl font-bold mb-4">Please sign in to access your dashboard</h1>
  //           <Button onClick={() => setLocation('/')}>Go to Home</Button>
  //         </div>
  //       </div>
  //     </AppShell>
  //   );
  // }

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
            <Card className="bg-background/50 border-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <GitBranch className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProjects}</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last month
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background/50 border-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Deployments</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeDeployments}</div>
                <p className="text-xs text-muted-foreground">
                  All systems operational
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background/50 border-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalCost}</div>
                <p className="text-xs text-muted-foreground">
                  -12% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background/50 border-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.uptime}</div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <Card className="bg-background/50 border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlusCircle className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>
                    Get started with common tasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <QuickActions />
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <Card className="bg-background/50 border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Latest deployments and system updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DeploymentHistory activity={mockActivity} />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Cloud Accounts */}
          <div className="mt-8">
            <Card className="bg-background/50 border-border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="h-5 w-5" />
                  Cloud Accounts
                </CardTitle>
                <CardDescription>
                  Manage your connected cloud providers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CloudAccountsManager />
              </CardContent>
            </Card>
          </div>

          {/* Projects Overview */}
          <div className="mt-8">
            <Card className="bg-background/50 border-border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Your Projects
                </CardTitle>
                <CardDescription>
                  Manage and monitor your deployed applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.totalProjects === 0 ? (
                  <div className="text-center py-8">
                    <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Deploy your first application to get started
                    </p>
                    <Button onClick={() => setLocation('/deploy')}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Deploy New Project
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Project list would go here */}
                    <p className="text-muted-foreground">Project management coming soon...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
