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
  // Temporarily disable auth to fix infinite loop - show dashboard directly
  const isAuthenticated = true;

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
