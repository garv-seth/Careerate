import { Router, Route, Switch } from "wouter"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"
import { AuthProvider } from "@/hooks/useAuth"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/toaster"
import { Layout } from "@/components/layout/Layout"

import Landing from "@/pages/landing"
import LandingNew from "@/pages/landing-new"
import LandingRedesigned from "@/pages/landing-redesigned"
import Home from "@/pages/home"
import Dashboard from "@/pages/dashboard"
import NotFound from "@/pages/not-found"

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Layout>
            <Router>
              <Switch>
                <Route path="/" component={LandingNew} />
                <Route path="/landing" component={Landing} />
                <Route path="/landing-redesigned" component={LandingRedesigned} />
                <Route path="/home" component={Home} />
                <Route path="/dashboard" component={Dashboard} />
                <Route component={NotFound} />
              </Switch>
            </Router>
          </Layout>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App