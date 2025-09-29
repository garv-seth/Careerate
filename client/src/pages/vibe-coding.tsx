import { Link, useRoute } from "wouter";
import { AppShell } from "@/components/AppShell";
import CaraWorkshop from "@/components/CaraWorkshop";

export default function VibeCoding() {
  const [, params] = useRoute("/projects/:id/coding");
  const projectId = params?.id || '1';

  return (
    <AppShell>

      <div className="relative min-h-screen">
        <CaraWorkshop projectId={projectId} />
      </div>
    </AppShell>
  );
}