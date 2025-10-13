import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/LoadingSkeleton';

export function DeploymentHistory() {
  // Mock data for now - in real app this would come from API
  const deployments = [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Deployments</CardTitle>
        <CardDescription>
          Your latest deployment activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        {deployments.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-4">
              <div className="text-4xl mb-2">🚀</div>
              <p>No deployments yet</p>
              <p className="text-sm">Start by creating your first deployment</p>
            </div>
            <Button variant="outline">
              Create Deployment
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {deployments.map((deployment) => (
              <div key={deployment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">{deployment.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {deployment.provider} • {deployment.region}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{deployment.status}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {deployment.createdAt}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
