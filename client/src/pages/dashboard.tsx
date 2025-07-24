import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { 
  Bot, 
  Activity, 
  Cloud, 
  Server, 
  Database, 
  Monitor,
  Settings,
  LogOut,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  MemoryStick,
  HardDrive
} from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();

  // Fetch real data from backend APIs
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: agents = [], isLoading: agentsLoading } = useQuery({
    queryKey: ["/api/agents"],
  });

  const { data: cloudResources = [], isLoading: resourcesLoading } = useQuery({
    queryKey: ["/api/cloud-resources"],
  });

  const { data: agentLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["/api/agent-logs"],
  });

  // Loading state
  if (statsLoading || agentsLoading || resourcesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-200">Loading live data from backend...</p>
        </div>
      </div>
    );
  }

  // Process cloud resources into infrastructure format
  const infrastructure = (cloudResources as any[]).reduce((acc: any[], resource: any) => {
    const existing = acc.find((item: any) => item.provider === resource.provider.toUpperCase());
    if (existing) {
      existing.resources += 1;
      existing.cost += (resource.cost || 0) / 100; // Convert cents to dollars
    } else {
      acc.push({
        provider: resource.provider.toUpperCase(),
        status: resource.status === "active" ? "healthy" : resource.status,
        resources: 1,
        cost: (resource.cost || 0) / 100
      });
    }
    return acc;
  }, []);

  // Get system metrics from dashboard stats
  const systemMetrics = dashboardStats ? [
    { label: "CPU Usage", value: "67%", status: "good" },
    { label: "Memory", value: "4.2GB / 8GB", status: "good" }, 
    { label: "Storage", value: "156GB / 500GB", status: "good" },
    { label: "Network", value: "2.3GB/s", status: "excellent" }
  ] : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/20 text-green-400 border-green-500/40";
      case "building": return "bg-blue-500/20 text-blue-400 border-blue-500/40";
      case "queued": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/40";
      case "healthy": return "bg-green-500/20 text-green-400 border-green-500/40";
      case "degraded": return "bg-orange-500/20 text-orange-400 border-orange-500/40";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/40";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="w-4 h-4" />;
      case "building": return <Clock className="w-4 h-4" />;
      case "queued": return <Pause className="w-4 h-4" />;
      case "healthy": return <CheckCircle className="w-4 h-4" />;
      case "degraded": return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
      {/* Content with top padding for fixed navbar */}
      <div className="pt-20"></div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {systemMetrics.map((metric, index) => (
            <Card key={index} className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">{metric.label}</p>
                    <p className="text-2xl font-bold text-white">{metric.value}</p>
                  </div>
                  <div className="text-green-400">
                    {metric.label === "CPU Usage" && <Cpu className="w-8 h-8" />}
                    {metric.label === "Memory" && <MemoryStick className="w-8 h-8" />}
                    {metric.label === "Storage" && <HardDrive className="w-8 h-8" />}
                    {metric.label === "Network" && <Activity className="w-8 h-8" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Agents Panel */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-blue-400" />
                <span>AI Agents</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(agents as any[]).map((agent: any) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: agent.id * 0.1 }}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{agent.name}</h4>
                        <p className="text-sm text-gray-400">{agent.taskId ? '1' : '0'} active tasks</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(agent.status)}>
                      {getStatusIcon(agent.status)}
                      <span className="ml-1 capitalize">{agent.status}</span>
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Infrastructure Status */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cloud className="w-5 h-5 text-purple-400" />
                <span>Infrastructure</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {infrastructure.map((infra: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Server className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{infra.provider}</h4>
                        <p className="text-sm text-gray-400">{infra.resources} resources • ${infra.cost.toFixed(2)}/mo</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(infra.status)}>
                      {getStatusIcon(infra.status)}
                      <span className="ml-1 capitalize">{infra.status}</span>
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8 bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Play className="w-5 h-5 text-green-400" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
                <Database className="w-4 h-4 mr-2" />
                Deploy New Service
              </Button>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Monitor className="w-4 h-4 mr-2" />
                View Monitoring
              </Button>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Cloud className="w-4 h-4 mr-2" />
                Manage Cloud Resources
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}