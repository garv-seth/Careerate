import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/pages/home";
import LandingRedesigned from "@/pages/landing-redesigned";
import NotFound from "@/pages/not-found";

function Router() {
  // Temporarily show landing page for all users to fix loading issues
  // TODO: Re-enable authentication after fixing the request loop
  const isAuthenticated = false;

  return (
    <Switch>
      <Route path="/">
        {isAuthenticated ? <Home /> : <LandingRedesigned />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
