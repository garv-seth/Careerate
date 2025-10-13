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
const NotFound = lazy(() => import("@/pages/not-found"));
import Dashboard from "@/pages/dashboard"; // Import directly to test
const IntegrationsPage = lazy(() => import("@/pages/integrations"));
const PaymentPage = lazy(() => import("@/pages/payment"));
const AccountSettings = lazy(() => import("@/pages/account-settings"));
const Deploy = lazy(() => import("@/pages/deploy"));
const Install = lazy(() => import("@/pages/install"));
const Test = lazy(() => import("@/pages/test"));
const Minimal = lazy(() => import("@/pages/minimal"));
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
  const pathname = window.location.pathname;
  
  if (pathname === '/dashboard') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 text-primary">Dashboard</h1>
          <p className="text-muted-foreground">Dashboard is loading correctly!</p>
          <p className="text-sm text-muted-foreground mt-2">URL: {pathname}</p>
        </div>
      </div>
    );
  }
  
  return <Landing />;
}

function App() {
  // Force rebuild: 2025-10-08T22:45:00Z - Complete SSR disable
  console.log('App component loaded');
  console.log('Current pathname:', window.location.pathname);

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
