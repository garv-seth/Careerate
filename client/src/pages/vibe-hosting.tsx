import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Rocket, Cloud, GitBranch, Shield, Zap } from "lucide-react";

interface DeploymentPlan {
  infrastructure: {
    provider: string;
    resources: Array<{
      type: string;
      name: string;
      estimatedCost: number;
    }>;
  };
  integrations: Array<{
    service: string;
    configuration: any;
  }>;
  deploymentSteps: string[];
  totalEstimatedCost: number;
  estimatedTime: number;
}

export function VibeHosting() {
  const [command, setCommand] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<DeploymentPlan | null>(null);

  const examples = [
    "Deploy my React app with a Postgres database to AWS",
    "Create a Kubernetes cluster for my microservices on Azure",
    "Set up CI/CD for my GitHub repo with automated testing",
    "Deploy my Node.js API with Redis caching to Google Cloud",
    "Deploy my app to multiple clouds for redundancy"
  ];

  const handleDeploy = async () => {
    if (!command.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch("/api/vibe/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command })
      });
      
      const data = await response.json();
      if (data.success) {
        setPlan(data.plan);
      }
    } catch (error) {
      console.error("Deployment error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
            Vibe Hosting
          </h1>
          <p className="text-2xl text-gray-300 mb-2">
            Deploy anything, anywhere, with just one command
          </p>
          <p className="text-lg text-gray-500">
            Powered by phi-4-reasoning AI agents that handle everything autonomously
          </p>
        </div>

        {/* Command Input */}
        <Card className="max-w-4xl mx-auto mb-12 bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle>Describe what you want to deploy</CardTitle>
            <CardDescription>
              Use natural language - our AI agents understand everything
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Example: Deploy my React app with authentication to AWS with auto-scaling"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              className="min-h-[100px] mb-4 bg-gray-950 border-gray-700"
            />
            <div className="flex flex-wrap gap-2 mb-4">
              {examples.map((example, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="cursor-pointer hover:bg-purple-900"
                  onClick={() => setCommand(example)}
                >
                  {example}
                </Badge>
              ))}
            </div>
            <Button
              onClick={handleDeploy}
              disabled={loading || !command}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating deployment plan...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  Deploy with Vibe
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Deployment Plan */}
        {plan && (
          <Card className="max-w-4xl mx-auto mb-12 bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle>Your Deployment Plan</CardTitle>
              <CardDescription>
                Review and execute when ready
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Cloud className="mr-2 h-4 w-4" />
                    Infrastructure
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">
                      Provider: <span className="text-white">{plan.infrastructure.provider}</span>
                    </p>
                    {plan.infrastructure.resources.map((resource, i) => (
                      <div key={i} className="bg-gray-800 p-2 rounded">
                        <p className="text-sm">{resource.type}: {resource.name}</p>
                        <p className="text-xs text-gray-500">${resource.estimatedCost}/mo</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <GitBranch className="mr-2 h-4 w-4" />
                    Integrations
                  </h3>
                  <div className="space-y-2">
                    {plan.integrations.map((integration, i) => (
                      <Badge key={i} variant="outline">
                        {integration.service}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-800 rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-semibold">
                      Total Cost: ${plan.totalEstimatedCost}/month
                    </p>
                    <p className="text-sm text-gray-400">
                      Deployment time: ~{plan.estimatedTime} minutes
                    </p>
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700">
                    Execute Plan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <Zap className="h-8 w-8 text-yellow-500 mb-2" />
              <CardTitle>Instant Deployment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                From code to production in minutes. Our AI agents handle everything - 
                containerization, infrastructure, networking, and monitoring.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <Cloud className="h-8 w-8 text-blue-500 mb-2" />
              <CardTitle>Multi-Cloud Native</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                Deploy to AWS, Azure, GCP, or all three at once. Our agents optimize 
                for cost and performance across any cloud provider.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <Shield className="h-8 w-8 text-green-500 mb-2" />
              <CardTitle>Enterprise Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                Built-in security scanning, compliance checking, and automated 
                remediation. SOC2, HIPAA, and GDPR compliant by default.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}