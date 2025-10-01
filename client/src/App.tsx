import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { DeploymentInfo } from "@/components/DeploymentInfo";
import { CookieConsent } from "@/components/CookieConsent";

// Lazy load pages for better performance
const Landing = lazy(() => import("@/pages/landing-new"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const NotFound = lazy(() => import("@/pages/not-found"));
const Editor = lazy(() => import("@/pages/editor"));
const DevOpsDashboard = lazy(() => import("@/pages/devops-dashboard"));
const MonitoringDashboard = lazy(() => import("@/pages/monitoring-dashboard"));
const IntegrationsPage = lazy(() => import("@/pages/integrations"));
const IntegrationsSetup = lazy(() => import("@/pages/integrations-setup"));
const BillingDashboard = lazy(() => import("@/pages/BillingDashboard"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const PaymentPage = lazy(() => import("@/pages/payment"));
const EnterpriseMigration = lazy(() => import("@/pages/enterprise-migration"));
const EnterpriseDashboard = lazy(() => import("@/pages/enterprise-dashboard"));
const AccountSettings = lazy(() => import("@/pages/account-settings"));
const VibeCoding = lazy(() => import("@/pages/vibe-coding"));
const Deploy = lazy(() => import("@/pages/deploy"));
const GitHubImport = lazy(() => import("@/pages/github-import"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state to prevent flash
  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
      {/* Routes accessible to all users */}
      <Route path="/payment" component={PaymentPage} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />

      {/* Authenticated routes */}
      {isAuthenticated ? (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/editor/:projectId" component={Editor} />
          <Route path="/devops/:projectId" component={DevOpsDashboard} />
          <Route path="/monitoring/:projectId" component={MonitoringDashboard} />
          <Route path="/integrations" component={IntegrationsPage} />
          <Route path="/integrations/setup" component={IntegrationsSetup} />
          <Route path="/billing" component={BillingDashboard} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/enterprise" component={EnterpriseDashboard} />
          <Route path="/account" component={AccountSettings} />
          <Route path="/settings" component={AccountSettings} />
          {/* Deployment Routes */}
          <Route path="/deploy" component={Deploy} />
          {/* GitHub Import */}
          <Route path="/dashboard/import" component={GitHubImport} />
          {/* Vibe Coding and Hosting Routes */}
          <Route path="/projects/:id/coding" component={VibeCoding} />
          <Route path="/projects/:id/hosting" component={VibeCoding} />
          {/* Enterprise Migration - Unified Dashboard */}
          <Route path="/projects/:id/migration" component={EnterpriseMigration} />
          {/* Legacy migration routes redirect to unified dashboard */}
          <Route path="/migration" component={EnterpriseMigration} />
          <Route path="/migration/analysis" component={EnterpriseMigration} />
          <Route path="/migration/new-assessment" component={EnterpriseMigration} />
          <Route path="/migration/planning" component={EnterpriseMigration} />
          <Route path="/migration/modernization" component={EnterpriseMigration} />
          <Route path="/migration/execution" component={EnterpriseMigration} />
          <Route path="/migration/execution/:projectId" component={EnterpriseMigration} />
          <Route path="/migration/recommendations" component={EnterpriseMigration} />
          <Route path="/migration/project/:projectId" component={EnterpriseMigration} />
          <Route path="/migration/reports" component={EnterpriseMigration} />
          <Route component={NotFound} />
        </>
      ) : (
        <>
          <Route path="/" component={Landing} />
          <Route component={Landing} />
        </>
      )}
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <CookieConsent />
        <DeploymentInfo />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
