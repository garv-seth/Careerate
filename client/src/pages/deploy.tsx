import { DeploymentChatUI } from '@/components/DeploymentChatUI';
import { AppShell } from '@/components/AppShell';

export default function DeployPage() {
  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8 h-[calc(100vh-8rem)]">
        <DeploymentChatUI />
      </div>
    </AppShell>
  );
}
