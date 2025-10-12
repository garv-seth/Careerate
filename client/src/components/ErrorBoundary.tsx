/**
 * Error Boundary Component
 * 
 * Catches React errors and provides graceful fallback UI
 * Prevents entire app from crashing due to component errors
 */

import { Component, ReactNode, ErrorInfo } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Optional: Send error to monitoring service
    if (typeof window !== 'undefined' && (window as any).AppInsights) {
      (window as any).AppInsights.trackException({ exception: error });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="glass-pane rounded-3xl p-8 max-w-2xl w-full">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-red-500/20 p-3 rounded-2xl flex-shrink-0">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                    Something went wrong
                  </span>
                </h1>
                <p className="text-muted-foreground mb-4">
                  We encountered an unexpected error. This has been logged and we'll investigate.
                </p>
                
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-4 glass-pane rounded-xl p-4 text-sm">
                    <summary className="cursor-pointer font-medium mb-2 text-red-400">
                      Error Details (Development Only)
                    </summary>
                    <div className="space-y-2 text-xs font-mono">
                      <div>
                        <strong className="text-red-400">Message:</strong>
                        <p className="text-muted-foreground mt-1">{this.state.error.message}</p>
                      </div>
                      {this.state.error.stack && (
                        <div>
                          <strong className="text-red-400">Stack Trace:</strong>
                          <pre className="text-muted-foreground mt-1 overflow-auto max-h-48">
                            {this.state.error.stack}
                          </pre>
                        </div>
                      )}
                      {this.state.errorInfo && (
                        <div>
                          <strong className="text-red-400">Component Stack:</strong>
                          <pre className="text-muted-foreground mt-1 overflow-auto max-h-48">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={this.handleReset}
                className="flex-1 bg-gradient-to-r from-primary/80 to-orange-500/80 hover:from-primary hover:to-orange-500"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="flex-1"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-6 text-center">
              If this issue persists, please contact support or check our{' '}
              <a href="/docs" className="text-primary hover:underline">
                documentation
              </a>
              .
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Simple error fallback for minor components
export function SimpleErrorFallback({ error, reset }: { error?: Error; reset?: () => void }) {
  return (
    <div className="glass-pane rounded-2xl p-6 text-center">
      <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
      <p className="text-sm text-muted-foreground mb-4">
        {error?.message || 'Something went wrong with this component'}
      </p>
      {reset && (
        <Button onClick={reset} size="sm" variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      )}
    </div>
  );
}
