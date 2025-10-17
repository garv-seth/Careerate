import { DeploymentChatUI } from '@/components/DeploymentChatUI';
import { AppShell } from '@/components/AppShell';
import { useGitHubRepos } from '@/hooks/useGitHubRepos';

export default function DeployPage() {
  const { repos } = useGitHubRepos();
  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8 h-[calc(100vh-8rem)]">
        {repos && repos.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Repository</label>
            <select aria-label="Repository" className="bg-background border border-border rounded px-2 py-1">
              {repos.map(r => (
                <option key={r.id} value={r.name}>{r.name}</option>
              ))}
            </select>
          </div>
        )}
        <DeploymentChatUI />
      </div>
    </AppShell>
  );
}
