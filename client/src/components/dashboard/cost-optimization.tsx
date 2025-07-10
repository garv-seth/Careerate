import { useQuery } from "@tanstack/react-query";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { DollarSign, Loader2, Sparkles, TrendingDown } from "lucide-react";
import type { DashboardStats } from "@/lib/types";

export function CostOptimization() {
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

  const formatCost = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <GlassPanel>
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <DollarSign className="mr-2 text-amber-400 h-5 w-5" />
        Cost Optimization
      </h3>
      
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-400">
            {formatCost(stats?.cost.total || 0)}
          </div>
          <div className="text-sm text-gray-400">Current Month</div>
          <div className="text-xs text-emerald-400 flex items-center justify-center mt-1">
            <TrendingDown className="h-3 w-3 mr-1" />
            {Math.abs(stats?.cost.monthlyChange || 0)}% vs last month
          </div>
        </div>
        
        <div className="space-y-2">
          {stats?.cost.byType && Object.entries(stats.cost.byType).map(([type, cost]) => (
            <div key={type} className="flex justify-between text-sm">
              <span className="capitalize">{type}</span>
              <span>{formatCost(cost)}</span>
            </div>
          ))}
        </div>
        
        <Button 
          className="w-full glass-button bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
          size="sm"
        >
          <Sparkles className="h-4 w-4 mr-1" />
          Auto-Optimize
        </Button>
      </div>
    </GlassPanel>
  );
}
