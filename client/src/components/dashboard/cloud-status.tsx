import { useQuery } from "@tanstack/react-query";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Badge } from "@/components/ui/badge";
import { Cloud, Loader2 } from "lucide-react";
import type { CloudResource } from "@shared/schema";

const providerIcons = {
  aws: "🚀", // AWS
  gcp: "🔵", // GCP  
  azure: "🔷", // Azure
};

const statusColors = {
  active: "bg-emerald-500 text-white",
  provisioning: "bg-amber-500 text-white", 
  standby: "bg-gray-500 text-white",
  error: "bg-red-500 text-white",
};

export function CloudStatus() {
  const { data: cloudResources, isLoading } = useQuery<CloudResource[]>({
    queryKey: ["/api/cloud-resources"],
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
        <Cloud className="mr-2 text-blue-400 h-5 w-5" />
        Multi-Cloud Status
      </h3>
      
      <div className="space-y-3">
        {cloudResources?.map((resource) => (
          <div 
            key={resource.id}
            className="flex items-center justify-between p-3 glass-panel-medium rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">
                {providerIcons[resource.provider as keyof typeof providerIcons]}
              </span>
              <span className="font-medium capitalize">{resource.provider}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                resource.status === "active" ? "bg-emerald-500 animate-pulse" :
                resource.status === "provisioning" ? "bg-amber-500" :
                "bg-gray-500"
              }`} />
              <Badge className={statusColors[resource.status as keyof typeof statusColors]}>
                {resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
