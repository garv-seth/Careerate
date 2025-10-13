import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/LoadingSkeleton';
import { CloudAccountsManager } from '@/components/CloudAccountsManager';
import { DeploymentHistory } from '@/components/DeploymentHistory';
import { QuickActions } from '@/components/QuickActions';
import { AppShell } from '@/components/AppShell';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface DashboardData {
  user: User;
  deployments: any[];
  cloudAccounts: any[];
  recentActivity: any[];
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication and load user data
    const checkAuth = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/user', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            // User not authenticated, redirect to login
            setLocation('/');
            return;
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        console.error('Authentication check failed:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        // Redirect to login on error
        setLocation('/');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [setLocation]);

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-destructive">Authentication Error</CardTitle>
              <CardDescription>
                {error}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setLocation('/')} 
                className="w-full"
              >
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You need to be logged in to access the dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setLocation('/')} 
                className="w-full"
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Welcome back, {user.name}!
                </h1>
                <p className="text-muted-foreground mt-2">
                  Manage your deployments and cloud accounts
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-sm">
                  {user.email}
                </Badge>
                <Button 
                  variant="outline" 
                  onClick={() => setLocation('/deploy')}
                >
                  New Deployment
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Deployments
                </CardTitle>
                <div className="h-4 w-4 text-muted-foreground">
                  🚀
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  No deployments yet
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Cloud Accounts
                </CardTitle>
                <div className="h-4 w-4 text-muted-foreground">
                  ☁️
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Connect your clouds
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Cost
                </CardTitle>
                <div className="h-4 w-4 text-muted-foreground">
                  💰
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$0.00</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Uptime
                </CardTitle>
                <div className="h-4 w-4 text-muted-foreground">
                  📊
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">100%</div>
                <p className="text-xs text-muted-foreground">
                  All systems operational
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cloud Accounts */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <CloudAccountsManager />
            </motion.div>

            {/* Quick Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <QuickActions />
            </motion.div>
          </div>

          {/* Deployment History */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8"
          >
            <DeploymentHistory />
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
