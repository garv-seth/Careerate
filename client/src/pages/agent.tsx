import { useState, useEffect, useRef } from 'react';
import { useAgentSession } from '@/hooks/useAgentSession';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { AppShell } from '@/components/AppShell';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-select agent via query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const a = params.get('agent') as any;
    if (a && ['planner','deployer','monitor','healer','optimizer'].includes(a)) {
      setSelectedAgent(a);
    }
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const { create } = useAgentSession();

  const createAgentSession = async () => {
    try {
      const sessionId = await create(selectedAgent, { userId: user?.id });
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
    if (!inputMessage.trim() || !currentSession) return;

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

  return (
    <AppShell>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              🤖 AI Agent Console
            </h1>
            <p className="text-muted-foreground">
              Interact with our intelligent agents to plan, deploy, monitor, heal, and optimize your applications.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Agent Selection Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-background/50 border border-border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Choose Agent</h2>
                <div className="space-y-3">
                  {[
                    { id: 'planner', name: 'Planner Agent', icon: '📋', desc: 'Plan deployments' },
                    { id: 'deployer', name: 'Deployer Agent', icon: '🚀', desc: 'Execute deployments' },
                    { id: 'monitor', name: 'Monitor Agent', icon: '📊', desc: 'Monitor health' },
                    { id: 'healer', name: 'Healer Agent', icon: '🔧', desc: 'Auto-fix issues' },
                    { id: 'optimizer', name: 'Cost Optimizer', icon: '💰', desc: 'Optimize costs' }
                  ].map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent.id as any)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        selectedAgent === agent.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background border border-border hover:bg-background/80'
                      }`}
                    >
                      <div className="text-lg font-medium mb-1">
                        {agent.icon} {agent.name}
                      </div>
                      <div className={`text-sm ${selectedAgent === agent.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        {agent.desc}
                      </div>
                    </button>
                  ))}
                </div>

                {!currentSession && (
                  <button
                    onClick={createAgentSession}
                    className="w-full mt-6 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  >
                    Start {selectedAgent.charAt(0).toUpperCase() + selectedAgent.slice(1)} Agent
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
                      <div className="text-4xl mb-4">🤖</div>
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
