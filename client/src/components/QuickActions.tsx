import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export function QuickActions() {
  const [, setLocation] = useLocation();

  const actions = [
    {
      title: 'Deploy New App',
      description: 'Deploy your application to the cloud',
      icon: '🚀',
      action: () => setLocation('/deploy'),
      variant: 'default' as const,
    },
    {
      title: 'Connect Cloud',
      description: 'Add AWS, Azure, or GCP account',
      icon: '☁️',
      action: () => setLocation('/integrations'),
      variant: 'outline' as const,
    },
    {
      title: 'View Docs',
      description: 'Learn how to use Careerate',
      icon: '📚',
      action: () => window.open('/docs', '_blank'),
      variant: 'outline' as const,
    },
    {
      title: 'Settings',
      description: 'Manage your account settings',
      icon: '⚙️',
      action: () => setLocation('/account-settings'),
      variant: 'outline' as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Common tasks and shortcuts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant}
            className="w-full justify-start h-auto p-4"
            onClick={action.action}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{action.icon}</span>
              <div className="text-left">
                <div className="font-medium">{action.title}</div>
                <div className="text-xs text-muted-foreground">
                  {action.description}
                </div>
              </div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
