import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

type Step = 'connect' | 'repo' | 'provider' | 'preflight' | 'deploy';

export default function LaunchWizard() {
  const [step, setStep] = useState<Step>('connect');
  const [repo, setRepo] = useState<string>("");
  const [provider, setProvider] = useState<string>("");
  const [plan, setPlan] = useState<any | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deployment, setDeployment] = useState<any | null>(null);
  const [rollbacking, setRollbacking] = useState(false);

  const { data: readiness } = useQuery({
    queryKey: ["/api/hosting/readiness"],
    queryFn: async () => (await fetch("/api/hosting/readiness", { credentials: 'include'})).json()
  });
  const { data: repos } = useQuery({
    queryKey: ["/api/integrations/repos"],
    queryFn: async () => (await fetch("/api/integrations/repos", { credentials: 'include'})).json()
  });

  const next = async () => {
    if (step === 'provider') {
      // Run preflight
      setSubmitting(true);
      setErrors([]);
      try {
        const res = await fetch('/api/hosting/preflight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ repo, provider })
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setErrors(data.errors || [data.error || 'Preflight failed']);
          return;
        }
        setPlan(data.plan);
        setStep('preflight');
      } finally {
        setSubmitting(false);
      }
      return;
    }
    if (step === 'preflight') {
      // Start deployment
      setSubmitting(true);
      setDeploying(true);
      try {
        // Derive a projectId from repo or fallback
        const projectId = (repo?.split(':').pop() || 'careerate-app')
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '-')
          .slice(-50);

        const body = {
          projectId,
          environment: 'production',
          // For now deploy a minimal Node app if sourceCode not provided server-side
          sourceCode: {
            'package.json': JSON.stringify({
              name: projectId,
              version: '1.0.0',
              main: 'index.js',
              scripts: { start: 'node index.js' },
              dependencies: { express: '^4.18.0' }
            }),
            'index.js': `const express = require('express');\nconst app = express();\nconst port = process.env.PORT || 3000;\napp.get('/', (req, res) => res.send('Hello from ${projectId}! 🚀'));\napp.get('/health', (req, res) => res.json({ status: 'healthy', ts: new Date().toISOString() }));\napp.listen(port, '0.0.0.0', () => console.log('Listening on', port));`
          },
          envVars: {},
          port: 3000,
        };

        const res = await fetch('/api/hosting/deploy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) {
          setErrors([data?.message || 'Deployment failed to start']);
          setDeploying(false);
          return;
        }
        setDeployment({
          id: data.deploymentId,
          statusUrl: data.statusUrl,
          status: data.status,
          appName: data.appName,
        });
        setStep('deploy');
      } finally {
        setSubmitting(false);
      }
      return;
    }
    const order: Step[] = ['connect','repo','provider','preflight','deploy'];
    const idx = order.indexOf(step);
    setStep(order[Math.min(order.length - 1, idx + 1)]);
  };

  const prev = () => {
    const order: Step[] = ['connect','repo','provider','preflight','deploy'];
    const idx = order.indexOf(step);
    setStep(order[Math.max(0, idx - 1)]);
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Launch Wizard</h1>

        <Card className="glass-pane rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm">Step: {step.toUpperCase()}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 'connect' && (
              <div className="space-y-3">
                <p className="text-foreground/70 text-sm">We’ll check your provider credentials and repo access.</p>
                <div className="flex gap-2">
                  {(readiness?.providers || []).map((p: any) => (
                    <div key={p.id} className={`px-3 py-2 rounded-lg text-xs ${p.ready ? 'bg-green-500/20 text-green-300' : 'bg-foreground/10 text-foreground/60'}`}>{p.label}: {p.ready ? 'Ready' : 'Missing'}</div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button onClick={next} disabled={!readiness?.providers?.some((p:any)=>p.ready)}>Continue</Button>
                </div>
              </div>
            )}

            {step === 'repo' && (
              <div className="space-y-3">
                <p className="text-sm text-foreground/70">Select a repository to deploy.</p>
                <Select value={repo} onValueChange={setRepo}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Choose Repository"/></SelectTrigger>
                  <SelectContent>
                    {(repos?.providers || []).flatMap((prov: any) => prov.repos.map((r: any) => (
                      <SelectItem key={`${prov.provider}:${r.id}`} value={`${prov.provider}:${r.id}`}>{r.name}</SelectItem>
                    )))}
                  </SelectContent>
                </Select>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={prev}>Back</Button>
                  <Button onClick={next} disabled={!repo}>Continue</Button>
                </div>
              </div>
            )}

            {step === 'provider' && (
              <div className="space-y-3">
                <p className="text-sm text-foreground/70">Choose a cloud provider.</p>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Choose Provider"/></SelectTrigger>
                  <SelectContent>
                    {(readiness?.providers || []).map((p: any) => (
                      <SelectItem key={p.id} value={p.id} disabled={!p.ready}>{p.label}{!p.ready ? ' (setup)' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={prev}>Back</Button>
                  <Button onClick={next} disabled={!provider || submitting}>{submitting ? 'Checking…' : 'Run Preflight'}</Button>
                </div>
              </div>
            )}

            {step === 'preflight' && (
              <div className="space-y-3">
                {errors.length > 0 && (
                  <div className="p-3 rounded-lg bg-red-500/10 text-red-300 text-sm">
                    {errors.join(', ')}
                  </div>
                )}
                <p className="text-sm text-foreground/70">Review the plan:</p>
                <ul className="list-disc pl-5 text-sm text-foreground/80">
                  {(plan?.steps || []).map((s: string, i: number) => <li key={i}>{s}</li>)}
                </ul>
                <div className="text-xs text-foreground/60">Env hints: {(plan?.envHints || []).join(', ')}</div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={prev}>Back</Button>
                  <Button onClick={next}>Deploy</Button>
                </div>
              </div>
            )}

            {step === 'deploy' && (
              <div className="space-y-3">
                <DeployStatus statusUrl={deployment?.statusUrl} />
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    disabled={!deployment?.id || rollbacking}
                    onClick={async () => {
                      if (!deployment?.id) return;
                      setRollbacking(true);
                      try {
                        const res = await fetch(`/api/hosting/deployments/${deployment.id}/rollback`, {
                          method: 'POST',
                          credentials: 'include'
                        });
                        const data = await res.json();
                        if (res.ok) {
                          // Switch to polling rollback deployment
                          setDeployment({ id: data.deploymentId, statusUrl: data.statusUrl, status: 'pending' });
                        }
                      } finally {
                        setRollbacking(false);
                      }
                    }}
                  >
                    {rollbacking ? 'Rolling back…' : 'Rollback'}
                  </Button>
                  <Button asChild>
                    <a href="/dashboard">Open Dashboard</a>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function DeployStatus({ statusUrl }: { statusUrl?: string }) {
  const [status, setStatus] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!statusUrl) return;
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(statusUrl, { credentials: 'include' });
        const data = await res.json();
        if (cancelled) return;
        setStatus(data);
        if (autoRefresh && (data.status === 'pending' || data.status === 'deploying' || data.status === 'building')) {
          setTimeout(poll, 2000);
        }
      } catch (e: any) {
        if (!cancelled) setError('Failed to fetch status');
      }
    }
    poll();
    return () => { cancelled = true; };
  }, [statusUrl, autoRefresh]);

  if (!statusUrl) return <p className="text-sm text-foreground/60">Missing deployment status URL.</p>;
  if (error) return <p className="text-sm text-red-400">{error}</p>;

  const health = status?.deployment?.healthStatus || status?.healthStatus;
  const url = status?.deployment?.deploymentUrl || status?.deploymentUrl;
  const logs = status?.deployment?.deploymentLogs || status?.deploymentLogs;
  const errors = status?.deployment?.errorLogs || status?.errorLogs;

  return (
    <div className="p-4 rounded-lg bg-foreground/5 text-sm space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <div>Status: <strong>{status?.status || 'starting'}</strong></div>
          {health && (<div className="text-foreground/70">Health: <strong>{health}</strong></div>)}
          {url && (
            <div className="mt-1">URL: <a className="underline" href={url} target="_blank" rel="noreferrer">{url}</a></div>
          )}
        </div>
        <button className="text-xs underline text-foreground/60" onClick={() => setAutoRefresh((v)=>!v)}>{autoRefresh ? 'Pause' : 'Resume'}</button>
      </div>
      {logs && (
        <details className="rounded-md bg-black/30 p-2">
          <summary className="cursor-pointer">Logs</summary>
          <pre className="mt-2 text-xs whitespace-pre-wrap text-foreground/80">{logs}</pre>
        </details>
      )}
      {errors && (
        <details open className="rounded-md bg-red-500/10 p-2">
          <summary className="cursor-pointer text-red-300">Errors</summary>
          <pre className="mt-2 text-xs whitespace-pre-wrap text-red-300">{errors}</pre>
        </details>
      )}
    </div>
  );
}


