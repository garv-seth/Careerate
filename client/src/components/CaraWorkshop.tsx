import React, { useState, useRef, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import {
  Play, Save, Download, Upload, Bot, MessageSquare, Terminal, FileText,
  GitBranch, Settings, Zap, Brain, Code, Database, Server, Sparkles,
  Maximize2, Minimize2, X, ArrowLeft, Cloud, Shield, Activity,
  Users, Cpu, Layers, Network, Workflow, ChevronDown, ChevronRight,
  FolderOpen, File, Plus, Search, Globe, Package, ExternalLink,
  Monitor, Folder, Coffee, Rocket, Bug, Eye, Trash2, Copy, RefreshCw
} from 'lucide-react';

// Enhanced Agent System - Cara as Master Orchestrator
interface CaraAgent {
  id: string;
  name: string;
  role: 'orchestrator' | 'specialist';
  type: 'cara' | 'codesmith' | 'debugger' | 'architect' | 'deployer' | 'guardian' | 'researcher';
  status: 'idle' | 'thinking' | 'working' | 'completed' | 'error';
  description: string;
  capabilities: string[];
  avatar: string;
  level: number;
  parent?: string;
  children?: string[];
  isActive: boolean;
}

// File System Interface
interface ProjectFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  content?: string;
  language?: string;
  isOpen: boolean;
  isDirty: boolean;
  children?: ProjectFile[];
  size?: number;
  lastModified?: Date;
}

// Integration System
interface Integration {
  id: string;
  name: string;
  type: 'api' | 'database' | 'service' | 'deployment';
  status: 'connected' | 'disconnected' | 'error';
  icon: string;
  config: any;
  capabilities: string[];
}

// Chat Message System
interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'cara' | string; // agent id
  timestamp: Date;
  type: 'message' | 'task_assignment' | 'code_generated' | 'error';
  metadata?: {
    files?: string[];
    agents?: string[];
    tools?: string[];
    results?: any[];
    nextSteps?: string[];
  };
}

// Advanced Agent Hierarchy - Cara Delegates Automatically
const caraAgents: CaraAgent[] = [
  {
    id: 'cara',
    name: 'Cara',
    role: 'orchestrator',
    type: 'cara',
    status: 'idle',
    description: 'Your AI orchestrator who intelligently delegates tasks to specialist agents',
    capabilities: ['Task Analysis', 'Agent Delegation', 'Project Coordination', 'Resource Management'],
    avatar: '🧠',
    level: 1,
    children: ['codesmith', 'architect', 'guardian', 'deployer', 'researcher'],
    isActive: true
  },
  {
    id: 'codesmith',
    name: 'CodeSmith',
    role: 'specialist',
    type: 'codesmith',
    status: 'idle',
    description: 'Expert coder specializing in implementation and optimization',
    capabilities: ['Code Generation', 'Refactoring', 'Performance Optimization', 'API Integration'],
    avatar: '⚒️',
    level: 2,
    parent: 'cara',
    isActive: false
  },
  {
    id: 'architect',
    name: 'Architect',
    role: 'specialist',
    type: 'architect',
    status: 'idle',
    description: 'System architect designing scalable solutions and database schemas',
    capabilities: ['System Design', 'Database Design', 'Scalability Planning', 'Architecture Review'],
    avatar: '🏗️',
    level: 2,
    parent: 'cara',
    isActive: false
  },
  {
    id: 'guardian',
    name: 'Guardian',
    role: 'specialist',
    type: 'guardian',
    status: 'idle',
    description: 'Security and quality specialist ensuring robust, secure code',
    capabilities: ['Security Audit', 'Code Review', 'Testing', 'Vulnerability Assessment'],
    avatar: '🛡️',
    level: 2,
    parent: 'cara',
    isActive: false
  },
  {
    id: 'deployer',
    name: 'Deployer',
    role: 'specialist',
    type: 'deployer',
    status: 'idle',
    description: 'DevOps specialist handling deployments and infrastructure',
    capabilities: ['Natural Language Deployment', 'Cloud Setup', 'CI/CD', 'Monitoring'],
    avatar: '🚀',
    level: 2,
    parent: 'cara',
    isActive: false
  },
  {
    id: 'researcher',
    name: 'Researcher',
    role: 'specialist',
    type: 'researcher',
    status: 'idle',
    description: 'Research specialist with internet access and documentation expertise',
    capabilities: ['Internet Search', 'Documentation Research', 'API Discovery', 'Best Practices'],
    avatar: '🔍',
    level: 2,
    parent: 'cara',
    isActive: false
  }
];

// Mock project structure - In real app, this comes from backend
const mockProjectFiles: ProjectFile[] = [
  {
    id: 'root',
    name: 'project-root',
    type: 'folder',
    path: '/',
    isOpen: true,
    isDirty: false,
    children: [
      {
        id: 'src',
        name: 'src',
        type: 'folder',
        path: '/src',
        isOpen: true,
        isDirty: false,
        children: [
          {
            id: 'app-tsx',
            name: 'App.tsx',
            type: 'file',
            path: '/src/App.tsx',
            content: `import React from 'react';\n\nfunction App() {\n  return (\n    <div className="App">\n      <h1>Hello World</h1>\n    </div>\n  );\n}\n\nexport default App;`,
            language: 'typescript',
            isOpen: true,
            isDirty: false,
            size: 156,
            lastModified: new Date()
          },
          {
            id: 'index-tsx',
            name: 'index.tsx',
            type: 'file',
            path: '/src/index.tsx',
            content: `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\n\nconst root = ReactDOM.createRoot(document.getElementById('root'));\nroot.render(<App />);`,
            language: 'typescript',
            isOpen: false,
            isDirty: false,
            size: 189,
            lastModified: new Date()
          }
        ]
      },
      {
        id: 'package-json',
        name: 'package.json',
        type: 'file',
        path: '/package.json',
        content: `{\n  "name": "careerate-project",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.0.0",\n    "react-dom": "^18.0.0"\n  }\n}`,
        language: 'json',
        isOpen: false,
        isDirty: false,
        size: 134,
        lastModified: new Date()
      }
    ]
  }
];

// Available integrations
const mockIntegrations: Integration[] = [
  {
    id: 'github',
    name: 'GitHub',
    type: 'service',
    status: 'connected',
    icon: '🐙',
    config: { repo: 'user/repo' },
    capabilities: ['Version Control', 'Code Hosting', 'Issue Tracking']
  },
  {
    id: 'openai',
    name: 'OpenAI',
    type: 'api',
    status: 'connected',
    icon: '🤖',
    config: { model: 'gpt-4' },
    capabilities: ['AI Code Generation', 'Chat Completion', 'Code Analysis']
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    type: 'database',
    status: 'disconnected',
    icon: '🐘',
    config: {},
    capabilities: ['Relational Database', 'SQL Queries', 'Data Storage']
  }
];

// Main Workshop Component - Revolutionary IDE Experience
export const CaraWorkshop: React.FC = () => {
  const [agents, setAgents] = useState<CaraAgent[]>(caraAgents);
  const [files, setFiles] = useState<ProjectFile[]>(mockProjectFiles);
  const [openTabs, setOpenTabs] = useState<ProjectFile[]>([]);
  const [activeTab, setActiveTab] = useState<string>('app-tsx');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Hello! I'm Cara, your AI orchestrator. I coordinate a team of specialist agents to help you build amazing software. What would you like to create today?",
      sender: 'cara',
      timestamp: new Date(),
      type: 'message'
    }
  ]);

  // Memory management: much more aggressive limits to prevent memory bloat
  const MAX_CHAT_MESSAGES = 20; // Reduced from 50
  const addChatMessage = useCallback((message: ChatMessage) => {
    setChatMessages(prev => {
      const newMessages = [...prev, message];
      // Keep only the last MAX_CHAT_MESSAGES
      return newMessages.length > MAX_CHAT_MESSAGES
        ? newMessages.slice(-MAX_CHAT_MESSAGES)
        : newMessages;
    });
  }, []);
  const [chatInput, setChatInput] = useState('');
  const [isCaraThinking, setIsCaraThinking] = useState(false);
  const [agentStatuses, setAgentStatuses] = useState<any>(null);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    'Welcome to Careerate Terminal',
    '$ npm run dev',
    'Starting development server...',
    'Server running on http://localhost:3000'
  ]);

  // Memory management: much more aggressive limits to prevent memory bloat
  const MAX_TERMINAL_LINES = 100; // Reduced from 1000
  const addTerminalLine = useCallback((line: string) => {
    setTerminalOutput(prev => {
      const newLines = [...prev, line];
      return newLines.length > MAX_TERMINAL_LINES
        ? newLines.slice(-MAX_TERMINAL_LINES)
        : newLines;
    });
  }, []);
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations);

  // Initialize open tabs with main file
  useEffect(() => {
    const mainFile = findFileById(files, 'app-tsx');
    if (mainFile && openTabs.length === 0) {
      setOpenTabs([mainFile]);
    }
  }, [files]);

  // Fetch real agent statuses periodically with memory management
  useEffect(() => {
    let mounted = true;
    let interval: NodeJS.Timeout;

    const fetchAgentStatuses = async () => {
      if (!mounted) return;

      try {
        const apiUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(`${apiUrl}/api/agents/status`, {
          credentials: 'include',
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!mounted) return;

        if (response.ok) {
          const data = await response.json();
          if (mounted) {
            setAgentStatuses(data);

            // Update local agent states based on backend
            if (data.agents) {
              setAgents(prev => prev.map(agent => {
                const backendAgent = data.agents.find((a: any) => a.id === agent.id);
                return backendAgent ? {
                  ...agent,
                  status: backendAgent.status,
                  isActive: backendAgent.status !== 'idle'
                } : agent;
              }));
            }
          }
        }
      } catch (error) {
        if (mounted && error.name !== 'AbortError') {
          console.error('Failed to fetch agent statuses:', error);
        }
      }
    };

    // Fetch immediately and then every 30 seconds (further reduced frequency to prevent memory bloat)
    fetchAgentStatuses();
    interval = setInterval(fetchAgentStatuses, 30000);

    return () => {
      mounted = false;
      if (interval) clearInterval(interval);
    };
  }, []);

  // Helper function to find file by ID
  const findFileById = (fileList: ProjectFile[], id: string): ProjectFile | null => {
    for (const file of fileList) {
      if (file.id === id) return file;
      if (file.children) {
        const found = findFileById(file.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Open file in new tab with aggressive memory management
  const MAX_OPEN_TABS = 5; // Reduced from 10
  const openFile = useCallback((file: ProjectFile) => {
    if (file.type === 'folder') return;

    if (!openTabs.find(tab => tab.id === file.id)) {
      setOpenTabs(prev => {
        const newTabs = [...prev, file];
        // If exceeding max tabs, close the oldest tab (first one)
        return newTabs.length > MAX_OPEN_TABS
          ? newTabs.slice(-MAX_OPEN_TABS)
          : newTabs;
      });
    }
    setActiveTab(file.id);
  }, [openTabs]);

  // Close tab
  const closeTab = (fileId: string) => {
    const newTabs = openTabs.filter(tab => tab.id !== fileId);
    setOpenTabs(newTabs);

    if (activeTab === fileId && newTabs.length > 0) {
      setActiveTab(newTabs[0].id);
    }
  };

  // Handle generated code files from agents
  const handleGeneratedCode = (generatedFiles: any[]) => {
    const newFiles: ProjectFile[] = [];

    generatedFiles.forEach((file: any) => {
      const fileId = `generated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const fileName = file.path.split('/').pop() || 'untitled';
      const language = getLanguageFromPath(file.path);

      const newFile: ProjectFile = {
        id: fileId,
        name: fileName,
        type: 'file',
        path: file.path,
        content: file.content,
        language,
        isOpen: false,
        isDirty: true, // Mark as dirty since it's new/generated
        size: file.content.length,
        lastModified: new Date()
      };

      newFiles.push(newFile);

      // Auto-open the first generated file
      if (newFiles.length === 1) {
        openFile(newFile);
      }
    });

    // Add to terminal output
    setTerminalOutput(prev => [
      ...prev,
      `🪄 Generated ${newFiles.length} file(s):`,
      ...newFiles.map(f => `   • ${f.path}`)
    ]);

    // TODO: Integrate with actual file system
    console.log('📁 Would add generated files to project:', newFiles);
  };

  // Get programming language from file path
  const getLanguageFromPath = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase();
    const langMap: { [key: string]: string } = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'go': 'go',
      'rs': 'rust',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'md': 'markdown',
      'yml': 'yaml',
      'yaml': 'yaml'
    };
    return langMap[ext || ''] || 'plaintext';
  };

  // Handle Cara chat - REAL agent system communication
  const handleCaraChat = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: chatInput,
      sender: 'user',
      timestamp: new Date(),
      type: 'message'
    };

    addChatMessage(userMessage);
    const currentInput = chatInput;
    setChatInput('');
    setIsCaraThinking(true);

    try {
      // Call the REAL backend API
      const apiUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';
      const response = await fetch(`${apiUrl}/api/agents/cara/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include session cookies
        body: JSON.stringify({
          message: currentInput,
          projectId: null, // TODO: Get from context when available
          context: {
            currentFiles: openTabs.map(tab => ({ path: tab.path, content: tab.content })),
            activeIntegrations: integrations.filter(i => i.status === 'connected').map(i => i.id)
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        const caraResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: result.response.message,
          sender: 'cara',
          timestamp: new Date(result.timestamp),
          type: 'task_assignment',
          metadata: {
            agents: result.response.agents_used,
            results: result.response.results,
            nextSteps: result.response.next_steps
          }
        };

        addChatMessage(caraResponse);

        // Update agents based on real backend response
        setAgents(prev => prev.map(agent => ({
          ...agent,
          isActive: agent.id === 'cara' || result.response.agents_used?.includes(agent.id) || false,
          status: agent.id === 'cara' ? 'completed' :
                  result.response.agents_used?.includes(agent.id) ? 'working' : 'idle'
        })));

        // Handle code generation results
        if (result.response.results) {
          result.response.results.forEach((agentResult: any) => {
            if (agentResult.type === 'code_generation' && agentResult.files) {
              console.log('📁 Generated files:', agentResult.files);
              handleGeneratedCode(agentResult.files);
            }
          });
        }

      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }

    } catch (error) {
      console.error('❌ Cara chat error:', error);

      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        content: `❌ Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or check the console for details.`,
        sender: 'cara',
        timestamp: new Date(),
        type: 'error'
      };

      addChatMessage(errorMessage);
    } finally {
      setIsCaraThinking(false);
    }
  };

  // File Explorer Component
  const FileExplorer = () => {
    const renderFileTree = (fileList: ProjectFile[], level = 0) => {
      return fileList.map(file => (
        <div key={file.id} style={{ paddingLeft: `${level * 16}px` }}>
          <div
            className={`flex items-center py-1 px-2 hover:bg-muted/50 cursor-pointer rounded text-sm ${
              activeTab === file.id ? 'bg-primary/10 text-primary' : 'text-foreground/80'
            }`}
            onClick={() => file.type === 'file' ? openFile(file) : null}
          >
            {file.type === 'folder' ? (
              <>
                <FolderOpen className="h-4 w-4 mr-2 text-blue-400" />
                <span className="font-medium">{file.name}</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {file.children?.length || 0}
                </Badge>
              </>
            ) : (
              <>
                <File className="h-4 w-4 mr-2 text-gray-400" />
                <span>{file.name}</span>
                {file.isDirty && <div className="w-2 h-2 bg-orange-400 rounded-full ml-auto" />}
              </>
            )}
          </div>
          {file.children && renderFileTree(file.children, level + 1)}
        </div>
      ));
    };

    return (
      <div className="h-full">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Project Files</h3>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <Plus className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <Search className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <Input
            placeholder="Search files..."
            className="h-8 text-xs"
          />
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2">
            {renderFileTree(files)}
          </div>
        </ScrollArea>
      </div>
    );
  };

  // Cara Chat Component
  const CaraChat = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10">🧠</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-sm">Cara's Command Center</h3>
            <p className="text-xs text-muted-foreground">AI Orchestrator - Delegates Automatically</p>
          </div>
          <Badge className="ml-auto" variant={isCaraThinking ? "secondary" : "default"}>
            {isCaraThinking ? "Thinking..." : agentStatuses?.agents?.find((a: any) => a.id === 'cara')?.status || "Ready"}
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {chatMessages.map(message => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}>
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                {message.metadata?.nextSteps && (
                  <div className="mt-2 text-xs opacity-80">
                    <strong>Next Steps:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {message.metadata.nextSteps.map((step: string, idx: number) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Describe what you want to build..."
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleCaraChat()}
          />
          <Button onClick={handleCaraChat} disabled={isCaraThinking}>
            <Sparkles className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  // Active Agents Panel
  const ActiveAgents = () => (
    <div className="p-4">
      <h3 className="font-semibold text-sm mb-3">Active Agents</h3>
      <div className="space-y-2">
        {agents.filter(agent => agent.isActive).map(agent => (
          <div key={agent.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
            <span className="text-lg">{agent.avatar}</span>
            <div className="flex-1">
              <div className="font-medium text-sm">{agent.name}</div>
              <div className="text-xs text-muted-foreground">{agent.description}</div>
            </div>
            <Badge variant={agent.status === 'working' ? 'default' : agent.status === 'completed' ? 'outline' : 'secondary'}>
              {agent.status === 'thinking' ? '🤔' : agent.status === 'working' ? '⚡' : agent.status === 'completed' ? '✅' : '💤'} {agent.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );

  // Terminal Component
  const Terminal = () => (
    <div className="flex flex-col h-full bg-black text-green-400 font-mono">
      <div className="p-2 border-b border-gray-700 bg-gray-900">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4" />
          <span className="text-sm font-medium">Terminal</span>
          <div className="flex gap-1 ml-auto">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-1">
          {terminalOutput.map((line, index) => (
            <div key={index} className="text-sm">{line}</div>
          ))}
          <div className="flex items-center">
            <span className="text-blue-400">$</span>
            <span className="ml-2 bg-green-400 w-2 h-4 animate-pulse"></span>
          </div>
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden relative">
      {/* WSL Background Pattern - PRESERVED AS REQUESTED */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, #00ff00 2px, transparent 2px),
            radial-gradient(circle at 75% 75%, #00ff00 1px, transparent 1px),
            linear-gradient(45deg, transparent 24%, rgba(0,255,0,0.05) 25%, rgba(0,255,0,0.05) 26%, transparent 27%, transparent 74%, rgba(0,255,0,0.05) 75%, rgba(0,255,0,0.05) 76%, transparent 77%)
          `,
          backgroundSize: '50px 50px, 25px 25px, 20px 20px',
          backgroundPosition: '0 0, 10px 10px, 0 0'
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0,255,0,0.03) 2px,
              rgba(0,255,0,0.03) 4px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(0,255,0,0.03) 2px,
              rgba(0,255,0,0.03) 4px
            )
          `
        }} />
      </div>
      {/* Top Action Bar */}
      <div className="h-12 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                Live
              </Badge>
              <span className="text-sm font-medium">Vibe Coding Session</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button size="sm" variant="outline" className="h-8">
              <Play className="h-4 w-4 mr-2" />
              Run
            </Button>
            <Button size="sm" className="h-8 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
              <Rocket className="h-4 w-4 mr-2" />
              Deploy
            </Button>
          </div>
        </div>
      </div>

      {/* Main IDE Layout */}
      <div className="flex-1 flex overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Sidebar - Cara Chat & Agents */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
            <div className="h-full border-r border-border">
              <Tabs defaultValue="cara" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
                  <TabsTrigger value="cara">Cara</TabsTrigger>
                  <TabsTrigger value="agents">Agents</TabsTrigger>
                </TabsList>
                <TabsContent value="cara" className="flex-1 mt-0">
                  <CaraChat />
                </TabsContent>
                <TabsContent value="agents" className="flex-1 mt-0">
                  <ActiveAgents />
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Center - Code Editor */}
          <ResizablePanel defaultSize={50}>
            <div className="h-full flex flex-col">
              {/* File Tabs */}
              <div className="border-b border-border bg-muted/20">
                <div className="flex items-center overflow-x-auto">
                  {openTabs.map(tab => (
                    <div
                      key={tab.id}
                      className={`flex items-center gap-2 px-4 py-2 border-r border-border cursor-pointer min-w-0 ${
                        activeTab === tab.id ? 'bg-background' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <File className="h-4 w-4 shrink-0" />
                      <span className="text-sm truncate">{tab.name}</span>
                      {tab.isDirty && <div className="w-2 h-2 bg-orange-400 rounded-full shrink-0" />}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          closeTab(tab.id);
                        }}
                        className="ml-1 p-1 hover:bg-muted rounded shrink-0"
                        aria-label={`Close ${tab.name} tab`}
                        title={`Close ${tab.name}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editor with memory optimization */}
              <div className="flex-1 relative">
                {openTabs.find(tab => tab.id === activeTab) ? (
                  <Editor
                    key={activeTab} // Force remount when tab changes to prevent memory leaks
                    height="100%"
                    defaultLanguage={openTabs.find(tab => tab.id === activeTab)?.language || 'typescript'}
                    value={openTabs.find(tab => tab.id === activeTab)?.content || ''}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      // Memory optimization options
                      wordWrap: 'bounded',
                      wordWrapColumn: 120,
                      maxTokenizationLineLength: 20000,
                      scrollbar: {
                        vertical: 'visible',
                        horizontal: 'visible',
                        verticalScrollbarSize: 8,
                        horizontalScrollbarSize: 8
                      }
                    }}
                    onMount={(editor, monaco) => {
                      // Configure Monaco for better memory management
                      monaco.editor.setModelLanguage(editor.getModel()!,
                        openTabs.find(tab => tab.id === activeTab)?.language || 'typescript');
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No file selected</p>
                      <p className="text-sm">Open a file from the explorer to start coding</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Right Sidebar - File Explorer */}
          <ResizablePanel defaultSize={25} minSize={15} maxSize={35}>
            <div className="h-full border-l border-border">
              <Tabs defaultValue="files" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
                  <TabsTrigger value="files">Files</TabsTrigger>
                  <TabsTrigger value="integrations">APIs</TabsTrigger>
                  <TabsTrigger value="deploy">Deploy</TabsTrigger>
                </TabsList>

                <TabsContent value="files" className="flex-1 mt-0">
                  <FileExplorer />
                </TabsContent>

                <TabsContent value="integrations" className="flex-1 mt-0 p-4">
                  <div>
                    <h3 className="font-semibold text-sm mb-3">Integrations</h3>
                    <div className="space-y-2">
                      {integrations.map(integration => (
                        <div key={integration.id} className="flex items-center gap-3 p-2 rounded-lg border">
                          <span className="text-lg">{integration.icon}</span>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{integration.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {integration.capabilities.join(', ')}
                            </div>
                          </div>
                          <Badge variant={integration.status === 'connected' ? 'default' : 'secondary'}>
                            {integration.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="deploy" className="flex-1 mt-0 p-4">
                  <div>
                    <h3 className="font-semibold text-sm mb-3">Natural Language Deployment</h3>
                    <div className="space-y-4">
                      <div className="p-3 rounded-lg border-dashed border-2 border-primary/30 bg-primary/5">
                        <div className="text-center">
                          <Rocket className="h-8 w-8 mx-auto text-primary mb-2" />
                          <p className="text-sm font-medium">Ready to Deploy</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Just describe how you want to deploy
                          </p>
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        size="sm"
                        onClick={() => setChatInput("Deploy this project to production with automatic scaling and monitoring")}
                      >
                        <Rocket className="h-4 w-4 mr-2" />
                        Deploy to Production
                      </Button>

                      <div className="text-xs text-muted-foreground">
                        <p>Previous deployments:</p>
                        <div className="mt-1 space-y-1">
                          <div className="flex justify-between">
                            <span>Production</span>
                            <Badge variant="outline" className="text-xs">Live</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Bottom Terminal */}
      <div className="h-48 border-t border-border">
        <Terminal />
      </div>
    </div>
  );
};

export default CaraWorkshop;