import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar/sidebar";
import { WorkflowEditor } from "@/components/workflow/workflow-editor";
import { CloudStatus } from "@/components/dashboard/cloud-status";
import { AgentRegistry } from "@/components/dashboard/agent-registry";
import { CostOptimization } from "@/components/dashboard/cost-optimization";
import { HealthMonitoring } from "@/components/dashboard/health-monitoring";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Save, 
  Share, 
  Plus,
  MessageSquare
} from "lucide-react";
import type { DashboardStats } from "@/lib/types";

export default function Home() {
  const [activeTab, setActiveTab] = useState("workflows");

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Bar */}
        <div className="glass-panel p-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold">Autonomous Workflow Editor</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <span>Project:</span>
              <Badge variant="outline" className="text-indigo-400 border-indigo-400/50">
                e-commerce-platform
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              className="glass-button bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
              size="sm"
            >
              <Play className="h-4 w-4 mr-1" />
              Deploy
            </Button>
            <Button variant="ghost" size="sm" className="glass-button">
              <Save className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="glass-button">
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          
          {/* Workflow Editor */}
          <div className="flex-1 p-6 relative overflow-auto">
            <div className="h-full relative">
              <WorkflowEditor />
              
              {/* Agent Communication Panel */}
              <div className="absolute bottom-6 left-6 right-6 z-10">
                <GlassPanel variant="medium" className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <MessageSquare className="mr-2 text-indigo-400 h-4 w-4" />
                    Agent Communication Log
                  </h4>
                  <div className="space-y-2 text-sm max-h-20 overflow-y-auto">
                    {stats?.recentLogs?.map((log) => (
                      <div key={log.id} className="flex items-center space-x-3">
                        <span className="text-indigo-400">{log.fromAgent} →</span>
                        <span className="text-violet-400">{log.toAgent}:</span>
                        <span className="text-gray-300 flex-1">{log.message}</span>
                        <span className="text-xs text-gray-500">
                          {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </GlassPanel>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-80 p-6 space-y-6 overflow-y-auto">
            <CloudStatus />
            <AgentRegistry />
            <CostOptimization />
            <HealthMonitoring />
          </div>

        </div>
      </div>

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 shadow-2xl animate-float"
        size="icon"
      >
        <Plus className="h-6 w-6 text-white" />
      </Button>
    </div>
  );
}
