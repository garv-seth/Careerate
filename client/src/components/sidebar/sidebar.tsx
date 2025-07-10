import { useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Boxes, 
  Bot, 
  Cloud, 
  TrendingUp, 
  DollarSign,
  ChevronDown,
  User
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const menuItems = [
    { id: "workflows", label: "Workflows", icon: Boxes, color: "text-indigo-400" },
    { id: "agents", label: "Agents", icon: Bot, color: "text-violet-400" },
    { id: "infrastructure", label: "Infrastructure", icon: Cloud, color: "text-blue-400" },
    { id: "monitoring", label: "Monitoring", icon: TrendingUp, color: "text-emerald-400" },
    { id: "cost", label: "Cost Optimization", icon: DollarSign, color: "text-amber-400" },
  ];

  return (
    <div className="w-64 h-full flex flex-col">
      <GlassPanel className="flex-1 flex flex-col">
        {/* Logo and Branding */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center">
            <Boxes className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Careerate</h1>
            <p className="text-xs text-gray-300">DevOps Platform</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start glass-button p-3 rounded-lg",
                    isActive ? "glass-panel-medium" : "glass-panel"
                  )}
                  onClick={() => onTabChange(item.id)}
                >
                  <Icon className={cn("mr-3 h-5 w-5", item.color)} />
                  <span className="font-medium">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </nav>

        {/* User Profile */}
        <div className="relative">
          <Button
            variant="ghost"
            className="w-full glass-panel p-3 rounded-lg flex items-center space-x-3"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <User className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-2" />
            <div className="flex-1 text-left">
              <p className="font-medium text-sm">John DevOps</p>
              <p className="text-xs text-gray-400">Senior Engineer</p>
            </div>
            <ChevronDown className="text-gray-400 h-4 w-4" />
          </Button>
        </div>
      </GlassPanel>
    </div>
  );
}
