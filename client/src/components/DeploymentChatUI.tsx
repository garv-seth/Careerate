import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SendHorizontal, Loader2, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AutonomyLevelModal } from './AutonomyLevelModal';

interface Message {
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  type?: 'plan' | 'progress' | 'complete' | 'error';
  data?: any;
}

export function DeploymentChatUI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [showAutonomyModal, setShowAutonomyModal] = useState(false);
  const [autonomyLevel, setAutonomyLevel] = useState<'supervised' | 'semi-autonomous' | 'fully-autonomous'>('supervised');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createSession = async () => {
    try {
      const res = await fetch('/api/agent/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sessionType: 'deployment', initialContext: { executionPolicy: autonomyLevel } })
      });
      
      if (!res.ok) throw new Error('Failed to create session');
      
      const data = await res.json();
      setSessionId(data.sessionId);
      return data.sessionId;
    } catch (error) {
      toast({
        title: 'Session Error',
        description: 'Failed to create agent session',
        variant: 'destructive'
      });
      return null;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Create session if needed
      let activeSessionId = sessionId;
      if (!activeSessionId) {
        activeSessionId = await createSession();
        if (!activeSessionId) {
          setIsLoading(false);
          return;
        }
      }

      // Call Planner Agent
      const res = await fetch('/api/agent/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sessionId: activeSessionId,
          naturalLanguageInput: input,
          autonomyLevel,
          costLimit: 50000 // $500/month default limit
        })
      });

      if (!res.ok) throw new Error('Failed to create plan');

      const { plan } = await res.json();
      setCurrentPlan(plan);

      // Add agent response
      const agentMessage: Message = {
        role: 'agent',
        content: `I've analyzed your request and created a deployment plan.`,
        timestamp: new Date(),
        type: 'plan',
        data: plan
      };

      setMessages(prev => [...prev, agentMessage]);

    } catch (error) {
      const errorMessage: Message = {
        role: 'agent',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
        type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeploy = async () => {
    if (!currentPlan || !sessionId) return;

    setIsLoading(true);

    try {
      const res = await fetch('/api/agent/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sessionId,
          planId: currentPlan.planId,
          autonomyLevel,
          costLimit: 50000
        })
      });

      if (!res.ok) throw new Error('Deployment failed');

      const { deployment } = await res.json();

      const deployMessage: Message = {
        role: 'agent',
        content: `Deployment started! ${deployment.totalSteps} steps to complete.`,
        timestamp: new Date(),
        type: 'progress',
        data: deployment
      };

      setMessages(prev => [...prev, deployMessage]);

      // Monitor deployment progress
      monitorDeployment(deployment.deploymentId);

    } catch (error) {
      toast({
        title: 'Deployment Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const monitorDeployment = async (deploymentId: string) => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/agent/deploy/${deploymentId}/status`, {
          credentials: 'include'
        });

        if (!res.ok) return;

        const { status } = await res.json();

        if (status.status === 'completed') {
          const completeMessage: Message = {
            role: 'agent',
            content: `🎉 Deployment completed successfully! Your app is live at: ${status.url}`,
            timestamp: new Date(),
            type: 'complete',
            data: status
          };
          setMessages(prev => [...prev, completeMessage]);
        } else if (status.status === 'failed') {
          const failMessage: Message = {
            role: 'agent',
            content: `❌ Deployment failed: ${status.error}`,
            timestamp: new Date(),
            type: 'error',
            data: status
          };
          setMessages(prev => [...prev, failMessage]);
        } else {
          // Still in progress, check again
          setTimeout(checkStatus, 2000);
        }
      } catch (error) {
        console.error('Status check error:', error);
      }
    };

    checkStatus();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="glass-pane rounded-2xl p-4 mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">AI Deployment Agent</h2>
          <p className="text-sm text-foreground/60">
            Describe your deployment in natural language
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAutonomyModal(true)}
          className="rounded-full"
        >
          {autonomyLevel === 'supervised' && '👁️ Supervised'}
          {autonomyLevel === 'semi-autonomous' && '⚡ Semi-Autonomous'}
          {autonomyLevel === 'fully-autonomous' && '🤖 Fully Autonomous'}
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 && (
          <Card className="glass-pane rounded-2xl border-dashed">
            <CardContent className="pt-6">
              <p className="text-center text-foreground/60 mb-4">
                Try asking:
              </p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-left justify-start"
                  onClick={() => setInput("Deploy my Next.js app to Vercel with auto-scaling")}
                >
                  "Deploy my Next.js app to Vercel with auto-scaling"
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-left justify-start"
                  onClick={() => setInput("Set up a Node.js API on AWS with PostgreSQL database")}
                >
                  "Set up a Node.js API on AWS with PostgreSQL database"
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-left justify-start"
                  onClick={() => setInput("Create a staging environment on Azure for my React app")}
                >
                  "Create a staging environment on Azure for my React app"
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                  : 'glass-pane'
              } rounded-2xl p-4`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              
              {/* Plan Details */}
              {message.type === 'plan' && message.data && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-foreground/10 text-foreground border-foreground/20">
                      {message.data.provider.toUpperCase()}
                    </Badge>
                    <div className="flex items-center gap-1 text-foreground/80">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        ${(message.data.costEstimate.monthly / 100).toFixed(2)}/month
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-foreground/60 uppercase font-semibold">Architecture</p>
                    <div className="text-sm text-foreground/80">
                      <p>• Compute: {message.data.architecture.compute}</p>
                      {message.data.architecture.database && (
                        <p>• Database: {message.data.architecture.database}</p>
                      )}
                      <p>• Region: {message.data.region}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-foreground/60 uppercase font-semibold">Reasoning</p>
                    <p className="text-sm text-foreground/80">{message.data.reasoning}</p>
                  </div>

                  <Button
                    onClick={handleDeploy}
                    disabled={isLoading}
                    className="w-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deploying...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Approve & Deploy
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Progress */}
              {message.type === 'progress' && message.data && (
                <div className="mt-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">
                      Step {message.data.currentStep} of {message.data.totalSteps}
                    </span>
                  </div>
                </div>
              )}

              {/* Complete/Error */}
              {(message.type === 'complete' || message.type === 'error') && (
                <div className="mt-2 flex items-center gap-2">
                  {message.type === 'complete' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              )}

              <p className="text-xs text-foreground/40 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="glass-pane rounded-2xl p-4 flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Describe your deployment... (e.g., 'Deploy my Next.js app to AWS with auto-scaling')"
          className="resize-none rounded-xl border-foreground/10 focus:border-orange-500"
          rows={2}
          disabled={isLoading}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          size="icon"
          className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white h-12 w-12"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <SendHorizontal className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Autonomy Modal */}
      <AutonomyLevelModal
        isOpen={showAutonomyModal}
        onClose={() => setShowAutonomyModal(false)}
        currentLevel={autonomyLevel}
        onSelect={(level) => {
          setAutonomyLevel(level);
          setShowAutonomyModal(false);
          toast({
            title: 'Autonomy Level Updated',
            description: `Agent will now operate in ${level} mode`
          });
        }}
      />
    </div>
  );
}

