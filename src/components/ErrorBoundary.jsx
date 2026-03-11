import React from "react";
import * as Sentry from "@sentry/react";
import Button from "./ui/Button";
import Card from "./ui/Card";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });

    // Send the error to Sentry with the React component stack attached
    Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/dashboard";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-default flex items-center justify-center p-4">
          <Card className="p-6 max-w-2xl w-full">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="h1 mb-3">Oops! Something went wrong</h1>
              <p className="text-secondary mb-6">
                Don't worry, we've logged the error. You can try refreshing the page or go back to the dashboard.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={this.handleReset} className="btn-primary">
                  Go to Dashboard
                </Button>
                <button onClick={() => window.location.reload()} className="btn">
                  Refresh Page
                </button>
              </div>

              {/* Error details visible in development only */}
              {import.meta.env.DEV && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-secondary mb-2">
                    Error Details (Dev Only)
                  </summary>
                  <div
                    className="p-3 rounded text-xs font-mono overflow-auto max-h-64"
                    style={{
                      background: "color-mix(in oklab, var(--color-warning) 10%, white)",
                      border: "1px solid color-mix(in oklab, var(--color-warning) 40%, transparent)",
                    }}
                  >
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.toString()}
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap mt-1">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;