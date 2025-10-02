import { useState, useEffect } from 'react';
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rocket, Loader2, CheckCircle2, XCircle, ExternalLink, Copy, Check, Github, Code, Cloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DeploymentStatus {
  id: string;
  status: 'pending' | 'building' | 'deploying' | 'success' | 'failed';
  url?: string;
  message?: string;
  error?: string;
  containerAppName?: string;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string };
  html_url: string;
  description: string | null;
  default_branch: string;
  language: string | null;
}

interface DetectedFramework {
  framework: string;
  language: string;
  buildCommand?: string;
  startCommand?: string;
  port?: number;
}

export default function Deploy() {
  const [deploySource, setDeploySource] = useState<'manual' | 'github'>('manual');
  const [appDescription, setAppDescription] = useState('');
  const [appName, setAppName] = useState('');
  const [deploying, setDeploying] = useState(false);
  const [deployment, setDeployment] = useState<DeploymentStatus | null>(null);
  const [copied, setCopied] = useState(false);

  // GitHub integration state
  const [githubConnected, setGithubConnected] = useState(false);
  const [repositories, setRepositories] = useState<GitHubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [detectedFramework, setDetectedFramework] = useState<DetectedFramework | null>(null);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [detectingFramework, setDetectingFramework] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    checkGitHubConnection();
  }, []);

  const checkGitHubConnection = async () => {
    setLoadingRepos(true);
    try {
      const response = await fetch('/api/integrations/github/repositories');
      if (response.ok) {
        const data = await response.json();
        setRepositories(data.repositories);
        setGithubConnected(true);
      } else {
        setGithubConnected(false);
      }
    } catch (error) {
      setGithubConnected(false);
    } finally {
      setLoadingRepos(false);
    }
  };

  const handleRepoSelect = async (repoFullName: string) => {
    const repo = repositories.find(r => r.full_name === repoFullName);
    if (!repo) return;

    setSelectedRepo(repo);
    setAppName(repo.name);
    setDetectingFramework(true);

    try {
      const response = await fetch(`/api/integrations/github/${repo.owner.login}/${repo.name}/detect`);
      if (response.ok) {
        const data = await response.json();
        setDetectedFramework(data.framework);

        toast({
          title: "Framework Detected",
          description: `Detected ${data.framework.framework} (${data.framework.language})`
        });
      }
    } catch (error) {
      console.error('Framework detection failed:', error);
    } finally {
      setDetectingFramework(false);
    }
  };

  const handleDeploy = async () => {
    if (!appDescription.trim() || !appName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both app name and description",
        variant: "destructive"
      });
      return;
    }

    setDeploying(true);
    setDeployment({
      id: '',
      status: 'pending',
      message: 'Understanding your app...'
    });

    try {
      // Step 1: Parse intent with AI
      setDeployment(prev => ({
        ...prev!,
        status: 'building',
        message: 'Analyzing your requirements...'
      }));

      const intentResponse = await fetch('/api/hosting/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: 'default',
          message: appDescription
        })
      });

      if (!intentResponse.ok) {
        throw new Error('Failed to parse deployment intent');
      }

      const intent = await intentResponse.json();

      // Step 2: Deploy
      setDeployment(prev => ({
        ...prev!,
        status: 'deploying',
        message: 'Building and deploying your app to Azure Container Apps...'
      }));

      const deployResponse = await fetch('/api/hosting/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: appName.toLowerCase().replace(/\s+/g, '-'),
          environment: 'production',
          sourceCode: intent.sourceCode || {
            'package.json': JSON.stringify({
              name: appName.toLowerCase().replace(/\s+/g, '-'),
              version: '1.0.0',
              main: 'index.js',
              scripts: { start: 'node index.js' },
              dependencies: { express: '^4.18.0' }
            }),
            'index.js': `const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello from ${appName}! 🚀');
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(port, '0.0.0.0', () => {
  console.log(\\\`Server running on port \\\${port}\\\`);
});`
          },
          envVars: intent.envVars || {},
          port: intent.port || 3000
        })
      });

      if (!deployResponse.ok) {
        throw new Error('Deployment failed');
      }

      const deployResult = await deployResponse.json();

      // Poll for deployment status
      const pollStatus = async () => {
        const statusResponse = await fetch(deployResult.statusUrl);
        const status = await statusResponse.json();

        if (status.status === 'deployed' || status.status === 'success') {
          setDeployment({
            id: deployResult.deploymentId,
            status: 'success',
            url: status.url,
            containerAppName: status.containerAppName,
            message: 'Deployment successful!'
          });
          setDeploying(false);
        } else if (status.status === 'failed') {
          setDeployment({
            id: deployResult.deploymentId,
            status: 'failed',
            error: status.error || 'Deployment failed',
            message: 'Deployment failed'
          });
          setDeploying(false);
        } else {
          setTimeout(pollStatus, 3000);
        }
      };

      setTimeout(pollStatus, 3000);

    } catch (error) {
      setDeployment({
        id: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Deployment failed'
      });
      setDeploying(false);
      toast({
        title: "Deployment Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    }
  };

  const copyUrl = () => {
    if (deployment?.url) {
      navigator.clipboard.writeText(deployment.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "URL copied to clipboard"
      });
    }
  };

  return (
    <AppShell>
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Deploy Your App in Seconds</h1>
          <p className="text-xl text-muted-foreground">
            Deploy from GitHub or describe what you want. We'll handle the rest.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Deployment Configuration</CardTitle>
            <CardDescription>
              Choose your deployment source
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={deploySource} onValueChange={(v) => setDeploySource(v as 'manual' | 'github')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="github">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub Repository
                </TabsTrigger>
                <TabsTrigger value="manual">
                  <Code className="h-4 w-4 mr-2" />
                  Manual Configuration
                </TabsTrigger>
              </TabsList>

              {/* GitHub Deployment */}
              <TabsContent value="github" className="space-y-4">
                {!githubConnected ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <Github className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">Connect GitHub</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Connect your GitHub account to deploy from repositories
                    </p>
                    <Button onClick={() => window.location.href = '/integrations'}>
                      <Github className="h-4 w-4 mr-2" />
                      Connect GitHub
                    </Button>
                  </div>
                ) : loadingRepos ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">Loading repositories...</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Select Repository
                      </label>
                      <Select value={selectedRepo?.full_name} onValueChange={handleRepoSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a repository" />
                        </SelectTrigger>
                        <SelectContent>
                          {repositories.slice(0, 20).map((repo) => (
                            <SelectItem key={repo.id} value={repo.full_name}>
                              <div className="flex items-center gap-2">
                                <span>{repo.full_name}</span>
                                {repo.language && (
                                  <Badge variant="outline" className="text-xs">
                                    {repo.language}
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedRepo && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            App Name
                          </label>
                          <Input
                            value={appName}
                            onChange={(e) => setAppName(e.target.value)}
                            disabled={deploying}
                          />
                        </div>

                        {detectingFramework ? (
                          <div className="p-4 border rounded-lg flex items-center gap-3">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Detecting framework...</span>
                          </div>
                        ) : detectedFramework && (
                          <div className="p-4 border rounded-lg bg-muted/50">
                            <h4 className="text-sm font-medium mb-2">Detected Configuration</h4>
                            <div className="space-y-1 text-sm">
                              <p><strong>Framework:</strong> {detectedFramework.framework}</p>
                              <p><strong>Language:</strong> {detectedFramework.language}</p>
                              {detectedFramework.buildCommand && (
                                <p><strong>Build:</strong> {detectedFramework.buildCommand}</p>
                              )}
                              {detectedFramework.startCommand && (
                                <p><strong>Start:</strong> {detectedFramework.startCommand}</p>
                              )}
                              {detectedFramework.port && (
                                <p><strong>Port:</strong> {detectedFramework.port}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </TabsContent>

              {/* Manual Deployment */}
              <TabsContent value="manual" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    App Name
                  </label>
                  <Input
                    placeholder="my-awesome-app"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    disabled={deploying}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    What are you deploying?
                  </label>
                  <Textarea
                    placeholder="I want to deploy a simple Node.js Express app that shows 'Hello World' on the homepage..."
                    value={appDescription}
                    onChange={(e) => setAppDescription(e.target.value)}
                    disabled={deploying}
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Describe your app in plain English. Include framework, features, and any special requirements.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <Button
              onClick={handleDeploy}
              disabled={
                deploying ||
                !appName.trim() ||
                (deploySource === 'manual' && !appDescription.trim()) ||
                (deploySource === 'github' && !selectedRepo)
              }
              size="lg"
              className="w-full"
            >
              {deploying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  Deploy to Production
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {deployment && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {deployment.status === 'success' && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
                {deployment.status === 'failed' && (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                {(deployment.status === 'pending' || deployment.status === 'building' || deployment.status === 'deploying') && (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                )}
                Deployment Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant={
                  deployment.status === 'success' ? 'default' :
                  deployment.status === 'failed' ? 'destructive' :
                  'secondary'
                }>
                  {deployment.status}
                </Badge>
              </div>

              {deployment.message && (
                <p className="text-sm text-muted-foreground">
                  {deployment.message}
                </p>
              )}

              {deployment.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{deployment.error}</p>
                </div>
              )}

              {deployment.url && (
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-900 mb-2">
                      🎉 Your app is live!
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        value={deployment.url}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copyUrl}
                      >
                        {copied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => window.open(deployment.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {deployment.containerAppName && (
                    <p className="text-xs text-muted-foreground">
                      Container App: {deployment.containerAppName}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
