import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
const IntegrationsPage = lazy(() => import("@/pages/integrations"));
const PaymentPage = lazy(() => import("@/pages/payment"));
const AccountSettings = lazy(() => import("@/pages/account-settings"));
const Deploy = lazy(() => import("@/pages/deploy"));
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
      <AnimatePresence mode="wait">
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
          <Route path="/integrations" component={IntegrationsPage} />
          <Route path="/account" component={AccountSettings} />
          <Route path="/settings" component={AccountSettings} />
          <Route path="/deploy" component={Deploy} />
          <Route component={NotFound} />
        </>
      ) : (
        <>
          <Route path="/" component={Landing} />
          <Route component={Landing} />
        </>
      )}
      </Switch>
      </AnimatePresence>
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
