import { Switch, Route } from "wouter";
import { lazy, Suspense, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DeploymentInfo } from "@/components/DeploymentInfo";
import { CookieConsent } from "@/components/CookieConsent";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Landing from "@/pages/landing-new";

// Lazy load pages for better performance (except Landing which is the entry point)
// Dashboard page removed due to persistent React errors
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
  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
      <Switch>
        {/* Public routes */}
        <Route path="/" component={Landing} />
        <Route path="/payment" component={PaymentPage} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route path="/terms" component={TermsOfService} />

        {/* App routes (auth handled per-page) */}
        <Route path="/dashboard" component={Landing} />
        <Route path="/integrations" component={IntegrationsPage} />
        <Route path="/account" component={AccountSettings} />
        <Route path="/settings" component={AccountSettings} />
        <Route path="/deploy" component={Deploy} />

        {/* 404 */}
        <Route component={NotFound} />
      </Switch>
      </AnimatePresence>
    </Suspense>
  );
}

function App() {
  // Force rebuild: 2025-10-08T22:45:00Z - Complete SSR disable
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render anything until client-side
  if (!isClient) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#0a0a0a',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '3px solid #f97316', 
            borderTop: '3px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Loading Careerate...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
          <CookieConsent />
          <DeploymentInfo />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
