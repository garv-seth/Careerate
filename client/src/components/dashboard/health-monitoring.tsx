import { useQuery } from "@tanstack/react-query";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Heart, Loader2, RotateCcw } from "lucide-react";
import type { DashboardStats } from "@/lib/types";

export function HealthMonitoring() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <GlassPanel>
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel>
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Heart className="mr-2 text-red-400 h-5 w-5" />
        Health Monitoring
      </h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">System Health</span>
          <div className="flex items-center space-x-2">
            <Progress 
              value={stats?.health.score || 0} 
              className="w-16 h-2"
            />
            <span className="text-emerald-400 text-sm font-medium">
              {stats?.health.score}%
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm">Response Time</span>
          <span className="text-emerald-400 text-sm font-medium">
            {stats?.health.responseTime}ms
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm">Active Endpoints</span>
          <span className="text-emerald-400 text-sm font-medium">
            {stats?.health.activeEndpoints}/{stats?.health.totalEndpoints}
          </span>
        </div>
        
        <Button 
          className="w-full glass-button bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
          size="sm"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Auto-Heal
        </Button>
      </div>
    </GlassPanel>
  );
}
