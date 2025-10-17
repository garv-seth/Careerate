import { useState, useEffect, useRef } from 'react';
import { useAgentSession } from '@/hooks/useAgentSession';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { AppShell } from '@/components/AppShell';
import { useGitHubRepos } from '@/hooks/useGitHubRepos';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'planning' | 'deploying' | 'monitoring' | 'healing' | 'optimizing';
  metadata?: any;
}

interface AgentSession {
  sessionId: string;
  status: 'active' | 'completed' | 'error';
  agentType: string;
  startTime: Date;
}

export default function Agent() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<AgentSession | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<'planner' | 'deployer' | 'monitor' | 'healer' | 'optimizer'>('planner');
  const [autoChooseEnabled, setAutoChooseEnabled] = useState(true);
  const [repositories, setRepositories] = useState<Array<{ id: string; name: string; fullName?: string }>>([]);
  const [selectedRepositoryId, setSelectedRepositoryId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-select agent via query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const a = params.get('agent') as any;
    if (a && ['planner','deployer','monitor','healer','optimizer'].includes(a)) {
      setSelectedAgent(a);
    }
  }, []);

  // Auto-choose agent based on input
  const autoChooseAgent = (input: string) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('plan') || lowerInput.includes('design') || lowerInput.includes('architecture')) {
      return 'planner';
    } else if (lowerInput.includes('deploy') || lowerInput.includes('launch') || lowerInput.includes('publish')) {
      return 'deployer';
    } else if (lowerInput.includes('monitor') || lowerInput.includes('watch') || lowerInput.includes('track')) {
      return 'monitor';
    } else if (lowerInput.includes('fix') || lowerInput.includes('heal') || lowerInput.includes('repair') || lowerInput.includes('error')) {
      return 'healer';
    } else if (lowerInput.includes('optimize') || lowerInput.includes('cost') || lowerInput.includes('performance')) {
      return 'optimizer';
    }
    
    return 'planner'; // Default to planner
  };

  // Load repositories if GitHub is connected (best-effort)
  useEffect(() => {
    fetch('/api/integrations/github/repositories', { credentials: 'include' })
      .then(async (r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        const repos = Array.isArray(data) ? data : (data.repositories || []);
        setRepositories(repos.map((r: any) => ({ id: r.id, name: r.name, fullName: r.fullName || r.full_name })));
      })
      .catch(() => {});
  }, []);

  // Show sign-in prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <AppShell>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">Agent Suite Access Required</h1>
              <p className="text-muted-foreground">
                Please sign in to interact with our AI agents and deploy your applications.
              </p>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => setLocation('/')}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Go to Sign In
              </button>
              <button
                onClick={() => setLocation('/dashboard')}
                className="w-full px-6 py-3 border border-border text-foreground rounded-lg hover:bg-background/50 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  const scrollToBottom = () => {
    // Only scroll if there are messages and the ref exists
    if (messages.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const { create } = useAgentSession();

  const createAgentSession = async () => {
    setIsLoading(true);
    try {
      const sessionId = await create(selectedAgent, { 
        userId: user?.id,
        agentType: selectedAgent,
        timestamp: new Date().toISOString()
      });
      
      setCurrentSession({
        sessionId,
        status: 'active',
        agentType: selectedAgent,
        startTime: new Date()
      });

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `**${selectedAgent.charAt(0).toUpperCase() + selectedAgent.slice(1)} Agent** activated. I'm ready to help with ${getAgentDescription(selectedAgent)}.`,
        timestamp: new Date(),
        type: selectedAgent as any
      }]);
    } catch (error) {
      console.error('Session creation failed:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: '❌ Failed to start agent session. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getAgentDescription = (agent: string) => {
    const descriptions = {
      planner: 'planning your deployments and infrastructure',
      deployer: 'executing deployments across multiple clouds',
      monitor: 'monitoring your applications and infrastructure',
      healer: 'automatically fixing issues and optimizing performance',
      optimizer: 'analyzing and optimizing your cloud costs'
    };
    return descriptions[agent as keyof typeof descriptions] || 'your tasks';
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Auto-choose agent if no session exists and auto-choose is enabled
    if (!currentSession && autoChooseEnabled) {
      const autoSelectedAgent = autoChooseAgent(inputMessage);
      setSelectedAgent(autoSelectedAgent);
      try {
        await createAgentSession();
        // After creating session, send the message
        setTimeout(() => {
          sendMessage();
        }, 100);
      } catch (error) {
        console.error('Failed to create session:', error);
      }
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let endpoint = '';
      let body = {};

      // Determine which agent endpoint to call based on the selected agent
      switch (selectedAgent) {
        case 'planner':
          endpoint = '/api/agent/plan';
          body = {
            sessionId: currentSession.sessionId,
            projectDescription: inputMessage,
            requirements: { autonomy: 'supervised' }
          };
          break;
        case 'deployer':
          endpoint = '/api/agent/deploy';
          body = {
            sessionId: currentSession.sessionId,
            projectDescription: inputMessage,
            targetProvider: 'auto', // Let AI decide
            sourceRepository: selectedRepositoryId
              ? (repositories.find(r => r.id === selectedRepositoryId)?.fullName || repositories.find(r => r.id === selectedRepositoryId)?.name)
              : undefined,
            requirements: { autonomy: 'supervised' }
          };
          break;
        case 'monitor':
          endpoint = '/api/agent/monitor/start';
          body = {
            sessionId: currentSession.sessionId,
            deploymentId: 'auto', // Will be determined by AI
            intervalSeconds: 60,
            autonomyLevel: 'supervised'
          };
          break;
        case 'healer':
          endpoint = '/api/agent/heal';
          body = {
            sessionId: currentSession.sessionId,
            issue: inputMessage,
            autonomyLevel: 'supervised'
          };
          break;
        case 'optimizer':
          endpoint = '/api/agent/cost/analyze';
          body = {
            sessionId: currentSession.sessionId,
            scope: 'current'
          };
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error('Agent request failed');

      const data = await response.json();

      let responseContent = '';
      if (selectedAgent === 'planner' && data.plan) {
        responseContent = `📋 **Deployment Plan Generated**\n\n${data.plan.description}\n\n**Estimated Cost:** $${data.plan.costEstimate}\n**Target Cloud:** ${data.plan.recommendedProvider}\n**Timeline:** ${data.plan.timeline}`;
      } else if (selectedAgent === 'deployer' && data.deployment) {
        responseContent = `🚀 **Deployment Started**\n\n${data.deployment.status}\n\n**Deployment ID:** ${data.deployment.id}\n**Target:** ${data.deployment.target}\n**Progress:** ${data.deployment.progress}%`;
      } else if (selectedAgent === 'monitor') {
        responseContent = `📊 **Monitoring Started**\n\nYour application is now being monitored. I'll alert you of any issues and can take corrective actions if needed.`;
      } else if (selectedAgent === 'healer' && data.healing) {
        responseContent = `🔧 **Healing Started**\n\n${data.healing.action}\n\n**Issue:** ${data.healing.issue}\n**Solution:** ${data.healing.solution}`;
      } else if (selectedAgent === 'optimizer' && data.analysis) {
        responseContent = `💰 **Cost Analysis Complete**\n\n${data.analysis.summary}\n\n**Current Monthly Cost:** $${data.analysis.currentCost}\n**Potential Savings:** $${data.analysis.potentialSavings}`;
      } else {
        responseContent = `✅ **${selectedAgent.charAt(0).toUpperCase() + selectedAgent.slice(1)} Agent Response**\n\n${JSON.stringify(data, null, 2)}`;
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        type: selectedAgent as any,
        metadata: data
      }]);

    } catch (error) {
      console.error('Agent request failed:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const { repos } = useGitHubRepos();

  return (
    <AppShell>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Agent Suite Console</h1>
              <p className="text-muted-foreground">Plan, deploy, monitor, heal, and optimize your applications.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Agent Selection Sidebar (condensed) */}
            <div className="lg:col-span-1">
              <div className="bg-background/50 border border-border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Agent Control</h2>

                {/* Auto-Choose Toggle */}
                <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Auto-Choose</span>
                    <button
                      onClick={() => setAutoChooseEnabled(!autoChooseEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        autoChooseEnabled ? 'bg-primary' : 'bg-muted'
                      }`}
                      aria-label="Toggle auto-choose agent"
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          autoChooseEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {autoChooseEnabled
                      ? 'AI will automatically select the best agent'
                      : 'Manually select agent from dropdown below'
                    }
                  </p>
                </div>

                {/* Agent Dropdown */}
                <div className="mb-4">
                  <label htmlFor="agent-select" className="text-sm font-medium text-foreground mb-2 block">
                    Select Agent
                  </label>
                  <select
                    id="agent-select"
                    value={selectedAgent}
                    onChange={e => setSelectedAgent(e.target.value as any)}
                    disabled={autoChooseEnabled}
                    className={`w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground ${
                      autoChooseEnabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    aria-label="Select agent"
                  >
                    <option value="planner">Planner Agent</option>
                    <option value="deployer">Deployer Agent</option>
                    <option value="monitor">Monitor Agent</option>
                    <option value="healer">Healer Agent</option>
                    <option value="optimizer">Cost Optimizer</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Current: {selectedAgent.charAt(0).toUpperCase() + selectedAgent.slice(1)}
                  </p>
                </div>

                {/* Source Repository (optional) */}
                <div className="mb-4">
                  <label htmlFor="repo-select" className="text-sm font-medium text-foreground mb-2 block">
                    Source Repository (optional)
                  </label>
                  {repos && repos.length > 0 && (
                    <select
                      id="repo-select"
                      value={selectedRepositoryId}
                      onChange={e => setSelectedRepositoryId(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                    >
                      <option value="">None</option>
                      {repos.map(r => (
                        <option key={r.id} value={r.id}>{r.fullName || r.name}</option>
                      ))}
                    </select>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    If set, the deployer will use this repository as source.
                  </p>
                </div>

                {!currentSession && (
                  <button
                    onClick={createAgentSession}
                    className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  >
                    {autoChooseEnabled ? 'Start' : `Start ${selectedAgent.charAt(0).toUpperCase() + selectedAgent.slice(1)} Agent`}
                  </button>
                )}

                {currentSession && (
                  <div className="mt-6 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="text-sm font-medium text-green-600 mb-1">Session Active</div>
                    <div className="text-xs text-green-600/80">
                      {currentSession.agentType} • {currentSession.status}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-3">
              <div className="bg-background/50 border border-border rounded-lg h-[600px] flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground">
                      <h3 className="text-lg font-semibold mb-2">Welcome to Careerate</h3>
                      <p>Select an agent and start a conversation to get help with your deployments.</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-4 ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-background border border-border'
                          }`}
                        >
                          <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                          <div className={`text-xs mt-2 ${
                            message.role === 'user'
                              ? 'text-primary-foreground/70'
                              : 'text-muted-foreground'
                          }`}>
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-background border border-border rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          <span className="text-sm text-muted-foreground">Agent is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                {currentSession && (
                  <div className="border-t border-border p-4">
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={`Ask the ${selectedAgent} agent...`}
                        className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        disabled={isLoading}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                      >
                        {isLoading ? '...' : 'Send'}
                      </button>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Press Enter to send, Shift+Enter for new line
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
