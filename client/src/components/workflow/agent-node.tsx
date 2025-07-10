import { Handle, Position } from "reactflow";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Badge } from "@/components/ui/badge";
import { Brain, Hammer, TestTube, Rocket, Eye } from "lucide-react";

interface AgentNodeProps {
  data: {
    name: string;
    status: string;
    capabilities: string[];
    taskId?: string;
    color: string;
  };
}

const statusColors = {
  active: "bg-emerald-500/20 text-emerald-400",
  building: "bg-amber-500/20 text-amber-400",
  queued: "bg-gray-500/20 text-gray-400",
  waiting: "bg-gray-500/20 text-gray-400",
  standby: "bg-gray-500/20 text-gray-400",
};

const agentIcons = {
  indigo: Brain,
  violet: Hammer,
  emerald: TestTube,
  blue: Rocket,
  orange: Eye,
};

export function AgentNode({ data }: AgentNodeProps) {
  const Icon = agentIcons[data.color as keyof typeof agentIcons] || Brain;
  const statusColor = statusColors[data.status as keyof typeof statusColors];

  return (
    <div className="workflow-node">
      <Handle type="target" position={Position.Left} className="opacity-0" />
      
      <GlassPanel className={`w-48 border border-${data.color}-500/30 bg-${data.color}-500/20`}>
        <div className="flex items-center space-x-3 mb-3">
          <div className={`w-8 h-8 bg-${data.color}-500 rounded-lg flex items-center justify-center`}>
            <Icon className="text-white h-4 w-4" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">{data.name}</h4>
            <p className="text-xs text-gray-300">
              {data.capabilities.join(", ")}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <Badge className={statusColor}>
            {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
          </Badge>
          <span className="text-gray-400">
            {data.taskId ? `Task ID: ${data.taskId}` : "Standby"}
          </span>
        </div>
      </GlassPanel>
      
      <Handle type="source" position={Position.Right} className="opacity-0" />
    </div>
  );
}
