import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });

    // Optional: Send error to logging service
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, { extra: errorInfo });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Optionally reload the page
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="glass-pane rounded-3xl max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-red-500/10 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <CardTitle className="text-2xl text-foreground">Something went wrong</CardTitle>
              </div>
              <CardDescription className="text-foreground/70">
                We encountered an unexpected error. Don't worry - your data is safe.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="rounded-lg bg-foreground/5 p-4 border border-foreground/10">
                  <p className="text-sm font-mono text-foreground/80 break-all">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={this.handleReset}
                  className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg shadow-orange-500/25"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                  className="rounded-full"
                >
                  Go Home
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-foreground/60 hover:text-foreground">
                    Show error details (dev only)
                  </summary>
                  <pre className="mt-2 text-xs bg-foreground/5 p-3 rounded overflow-auto max-h-64 border border-foreground/10">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
