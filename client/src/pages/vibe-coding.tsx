import { useRoute } from "wouter";
import { AppShell } from "@/components/AppShell";
import CaraWorkshopLite from "@/components/CaraWorkshopLite";

export default function VibeCoding() {
  const [codingMatch, codingParams] = useRoute("/projects/:id/coding");
  const [hostingMatch, hostingParams] = useRoute("/projects/:id/hosting");

  const projectId = (codingParams?.id || hostingParams?.id) || '1';
  const initialMode = hostingMatch ? 'host' : 'both';

  return (
    <AppShell>
      <div className="relative min-h-screen">
        <CaraWorkshopLite projectId={projectId} initialMode={initialMode} />
      </div>
    </AppShell>
  );
}