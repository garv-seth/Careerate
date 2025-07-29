import { useCallback, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
} from "reactflow";
import "reactflow/dist/style.css";
import { AgentNode } from "./agent-node";
import { LiquidGlassPanel } from "@/components/ui/liquid-glass";
import { Button } from "@/components/ui/button";
import { Plus, Save } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Agent } from "@shared/schema";

const nodeTypes = {
  agentNode: AgentNode,
};

const initialNodes: Node[] = [
  {
    id: "1",
    type: "agentNode",
    position: { x: 50, y: 50 },
    data: {
      name: "Planner Agent",
      status: "active",
      capabilities: ["analyze-repo", "generate-plan"],
      taskId: "101",
      color: "indigo",
    },
  },
  {
    id: "2",
    type: "agentNode",
    position: { x: 350, y: 50 },
    data: {
      name: "Builder Agent",
      status: "building",
      capabilities: ["render-templates", "compile-assets"],
      taskId: "101",
      color: "violet",
    },
  },
  {
    id: "3",
    type: "agentNode",
    position: { x: 200, y: 200 },
    data: {
      name: "Tester Agent",
      status: "queued",
      capabilities: ["run-tests", "validate-security"],
      taskId: "102",
      color: "emerald",
    },
  },
  {
    id: "4",
    type: "agentNode",
    position: { x: 650, y: 50 },
    data: {
      name: "Deployer Agent",
      status: "waiting",
      capabilities: ["k8s-deploy", "serverless-deploy"],
      taskId: "101",
      color: "blue",
    },
  },
  {
    id: "5",
    type: "agentNode",
    position: { x: 950, y: 50 },
    data: {
      name: "Monitor Agent",
      status: "standby",
      capabilities: ["health-check", "auto-heal"],
      color: "orange",
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    animated: true,
    style: { stroke: "#6366f1", strokeWidth: 2 },
  },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    animated: true,
    style: { stroke: "#8b5cf6", strokeWidth: 2 },
  },
  {
    id: "e3-4",
    source: "3",
    target: "4",
    animated: true,
    style: { stroke: "#06b6d4", strokeWidth: 2 },
  },
  {
    id: "e4-5",
    source: "4",
    target: "5",
    animated: true,
    style: { stroke: "#f59e0b", strokeWidth: 2 },
  },
];

export function WorkflowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const { data: agents } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds: Edge[]) => addEdge(params, eds)),
    [setEdges]
  );

  const addNewAgent = () => {
    const newId = (nodes.length + 1).toString();
    const newNode: Node = {
      id: newId,
      type: "agentNode",
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      data: {
        name: "New Agent",
        status: "standby",
        capabilities: ["custom-task"],
        color: "gray",
      },
    };
    setNodes((nds: Node[]) => nds.concat(newNode));
  };

  const saveWorkflow = () => {
    console.log("Saving workflow...", { nodes, edges });
    // TODO: Implement workflow saving
  };

  return (
    <div className="w-full h-full relative">
      <LiquidGlassPanel className="w-full h-full relative overflow-hidden min-h-[600px]">
        <div className="absolute top-4 right-4 flex space-x-2 z-10">
          <Button
            size="sm"
            variant="secondary"
            className="glass-button"
            onClick={addNewAgent}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Agent
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="glass-button"
            onClick={saveWorkflow}
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>

        <div style={{ width: '100%', height: '500px' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="bg-transparent"
            >
            <Background 
              color="rgba(255, 255, 255, 0.1)" 
              gap={20} 
              size={1}
            />
            <Controls className="glass-panel" />
            <MiniMap 
              className="glass-panel" 
              nodeColor="#6366f1"
              maskColor="rgba(0, 0, 0, 0.2)"
            />
          </ReactFlow>
        </div>
      </LiquidGlassPanel>
    </div>
  );
}
