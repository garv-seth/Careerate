import { useQuery } from "@tanstack/react-query";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Bot, Loader2 } from "lucide-react";
import type { DashboardStats } from "@/lib/types";

export function AgentRegistry() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <GlassPanel>
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel>
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Bot className="mr-2 text-violet-400 h-5 w-5" />
        Agent Registry
      </h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span>Active Agents</span>
          <span className="text-emerald-400 font-medium">
            {stats?.agents.active}/{stats?.agents.total}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>Queue Depth</span>
          <span className="text-amber-400 font-medium">
            {stats?.agents.queueDepth} tasks
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>Success Rate</span>
          <span className="text-emerald-400 font-medium">
            {stats?.agents.successRate}%
          </span>
        </div>
      </div>
    </GlassPanel>
  );
}
