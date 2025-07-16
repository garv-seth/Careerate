import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
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
import careerateLogo from "@assets/CareerateLogo.png";

export default function Dashboard() {
  const { user, logout } = useAuth();

  const agents = [
    { id: 1, name: "Planner Agent", status: "active", type: "planner", tasks: 3 },
    { id: 2, name: "Builder Agent", status: "building", type: "builder", tasks: 1 },
    { id: 3, name: "Tester Agent", status: "queued", type: "tester", tasks: 2 },
    { id: 4, name: "Deployer Agent", status: "active", type: "deployer", tasks: 0 },
    { id: 5, name: "Monitor Agent", status: "active", type: "monitor", tasks: 5 }
  ];

  const infrastructure = [
    { provider: "AWS", status: "healthy", resources: 12, cost: 245.50 },
    { provider: "Azure", status: "healthy", resources: 8, cost: 189.20 },
    { provider: "GCP", status: "degraded", resources: 5, cost: 156.80 }
  ];

  const systemMetrics = [
    { label: "CPU Usage", value: "67%", status: "good" },
    { label: "Memory", value: "4.2GB / 8GB", status: "good" },
    { label: "Storage", value: "156GB / 500GB", status: "good" },
    { label: "Network", value: "2.3GB/s", status: "excellent" }
  ];

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
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src={careerateLogo} alt="CAREERATE" className="w-10 h-10 rounded-lg" />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
                  CAREERATE Dashboard
                </h1>
                <p className="text-sm text-gray-400">Welcome back, {user?.name || user?.username || 'Developer'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button onClick={logout} variant="outline" size="sm" className="border-red-400/40 text-red-300 hover:bg-red-500/20">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

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
                {agents.map((agent) => (
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
                        <p className="text-sm text-gray-400">{agent.tasks} active tasks</p>
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
                {infrastructure.map((infra, index) => (
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
                        <p className="text-sm text-gray-400">{infra.resources} resources • ${infra.cost}/mo</p>
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