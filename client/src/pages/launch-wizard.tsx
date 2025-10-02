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
      setStep('deploy');
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
                <p className="text-sm text-foreground/70">Deployment started. You can monitor status on the dashboard.</p>
                <Button asChild>
                  <a href="/dashboard">Go to Dashboard</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}


