import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SendHorizontal, Loader2, AlertCircle, CheckCircle2, DollarSign, Github, GitBranch } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AutonomyLevelModal } from './AutonomyLevelModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Message {
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  type?: 'plan' | 'progress' | 'complete' | 'error';
  data?: any;
}

interface Repository {
  provider: 'github' | 'gitlab';
  id: string;
  name: string;
  url: string;
}

export function DeploymentChatUI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [showAutonomyModal, setShowAutonomyModal] = useState(false);
  const [autonomyLevel, setAutonomyLevel] = useState<'supervised' | 'semi-autonomous' | 'fully-autonomous'>('supervised');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [loadingRepos, setLoadingRepos] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    // Only scroll if there are messages and the ref exists
    if (messages.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch repositories on mount
  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    setLoadingRepos(true);
    try {
      const res = await fetch('/api/github/repos', { credentials: 'include' });

      if (!res.ok) {
        // Not connected to GitHub/GitLab yet
        return;
      }

      const data = await res.json();
      const repos: Repository[] = [];

      // GitHub repos
      if (data && Array.isArray(data)) {
        data.forEach((repo: any) => {
          repos.push({
            provider: 'github',
            id: repo.id?.toString() || repo.name,
            name: repo.name || repo.full_name,
            url: repo.html_url || repo.url
          });
        });
      }

      setRepositories(repos);
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
    } finally {
      setLoadingRepos(false);
    }
  };

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
    if ((!input.trim() && !selectedRepo) || isLoading) return;

    // Use selected repo or manual input
    const finalInput = selectedRepo || input;
    const selectedRepoData = repositories.find(r => `${r.provider}:${r.name}` === selectedRepo);

    const userMessage: Message = {
      role: 'user',
      content: selectedRepoData
        ? `Deploy ${selectedRepoData.name} from ${selectedRepoData.provider === 'github' ? 'GitHub' : 'GitLab'}`
        : input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = selectedRepoData?.url || input;
    setInput('');
    setSelectedRepo('');
    setIsLoading(true);

    try {
      // Extract repository URL
      const githubUrlMatch = userInput.match(/https?:\/\/(www\.)?(github\.com|gitlab\.com)\/[\w-]+\/[\w-]+/);
      const repoUrl = githubUrlMatch ? githubUrlMatch[0] : (selectedRepoData?.url || undefined);

      // Call NEW Deployment Planner API (GPT-4o with direct OpenAI)
      const res = await fetch('/api/deploy/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          input: userInput,
          repoUrl
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create plan');
      }

      const { planId, plan } = await res.json();
      setCurrentPlan({ ...plan, planId });

      // Add agent response
      const agentMessage: Message = {
        role: 'agent',
        content: `I've analyzed your request and created a deployment plan using GPT-4o.`,
        timestamp: new Date(),
        type: 'plan',
        data: { ...plan, planId }
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
    if (!currentPlan) return;

    setIsLoading(true);

    try {
      const progressMessage: Message = {
        role: 'agent',
        content: `Starting deployment... This will take 5-10 minutes.`,
        timestamp: new Date(),
        type: 'progress',
        data: { status: 'starting' }
      };
      setMessages(prev => [...prev, progressMessage]);

      // Call NEW Deployment Execute API (Real Azure deployment)
      const res = await fetch('/api/deploy/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          planId: currentPlan.planId
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Deployment failed');
      }

      const { deployment } = await res.json();

      // Success!
      const completeMessage: Message = {
        role: 'agent',
        content: `🎉 Deployment completed successfully!\n\nYour app is live at:\n${deployment.url}\n\nApp Name: ${deployment.appName}\nRegion: ${deployment.region}\nStatus: ${deployment.status}`,
        timestamp: new Date(),
        type: 'complete',
        data: deployment
      };

      setMessages(prev => [...prev, completeMessage]);

      toast({
        title: 'Deployment Success!',
        description: `App deployed to ${deployment.url}`,
      });

    } catch (error) {
      const errorMessage: Message = {
        role: 'agent',
        content: `❌ Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);

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
      <div className="glass-pane rounded-2xl p-4 mb-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">AI Deployment Agent</h2>
            <p className="text-sm text-foreground/60">
              Select a repository or describe your deployment
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

        {/* Repository Selector */}
        {repositories.length > 0 && (
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-foreground/60" />
            <Select value={selectedRepo} onValueChange={setSelectedRepo}>
              <SelectTrigger className="flex-1 rounded-xl border-foreground/10">
                <SelectValue placeholder="Select a repository (optional)" />
              </SelectTrigger>
              <SelectContent>
                {repositories.map((repo) => (
                  <SelectItem key={`${repo.provider}:${repo.name}`} value={`${repo.provider}:${repo.name}`}>
                    <div className="flex items-center gap-2">
                      {repo.provider === 'github' ? (
                        <Github className="w-4 h-4" />
                      ) : (
                        <GitBranch className="w-4 h-4" />
                      )}
                      <span>{repo.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {loadingRepos && (
          <div className="text-sm text-foreground/60 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading repositories...
          </div>
        )}

        {!loadingRepos && repositories.length === 0 && (
          <div className="text-sm text-foreground/60">
            💡 Connect <a href="/integrations" className="text-orange-500 hover:underline">GitHub or GitLab</a> to see your repositories
          </div>
        )}
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
                  className="w-full text-left justify-start text-xs"
                  onClick={() => setInput("Deploy my Next.js app from https://github.com/vercel/next.js/tree/canary/examples/hello-world")}
                >
                  "Deploy this Next.js demo: https://github.com/vercel/next.js/tree/canary/examples/hello-world"
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-left justify-start text-xs"
                  onClick={() => setInput("Deploy a simple web app to Azure with auto-scaling")}
                >
                  "Deploy a simple web app to Azure with auto-scaling"
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-left justify-start text-xs"
                  onClick={() => setInput("Deploy my GitHub repository (paste your repo URL)")}
                >
                  "Deploy my GitHub repository (paste your repo URL)"
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
                      {message.data.techStack || 'Unknown'}
                    </Badge>
                    <div className="flex items-center gap-1 text-foreground/80">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        ${message.data.costEstimate?.monthly || 0}/month
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-foreground/60 uppercase font-semibold">Architecture</p>
                    <div className="text-sm text-foreground/80">
                      <p>• Compute: {message.data.infrastructure?.compute || 'N/A'}</p>
                      {message.data.infrastructure?.database && message.data.infrastructure.database !== 'none' && (
                        <p>• Database: {message.data.infrastructure.database}</p>
                      )}
                      {message.data.infrastructure?.storage && message.data.infrastructure.storage !== 'none' && (
                        <p>• Storage: {message.data.infrastructure.storage}</p>
                      )}
                      <p>• Region: {message.data.region || 'westus2'}</p>
                      <p>• Resources: {message.data.cpu || 0.5} CPU, {message.data.memory || '1Gi'} RAM</p>
                    </div>
                  </div>

                  {message.data.reasoning && (
                    <div className="space-y-1">
                      <p className="text-xs text-foreground/60 uppercase font-semibold">Reasoning</p>
                      <p className="text-sm text-foreground/80">{message.data.reasoning}</p>
                    </div>
                  )}

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
          disabled={(!input.trim() && !selectedRepo) || isLoading}
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

