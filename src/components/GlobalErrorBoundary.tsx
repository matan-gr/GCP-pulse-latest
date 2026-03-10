import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReport = () => {
    const { error, errorInfo } = this.state;
    const subject = encodeURIComponent(`Error Report: GCP Pulse`);
    const body = encodeURIComponent(
      `I encountered an error in the GCP Pulse application.\n\nError: ${error?.toString()}\n\nStack Trace:\n${errorInfo?.componentStack || ''}`
    );
    window.location.href = `mailto:support@example.com?subject=${subject}&body=${body}`;
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} className="text-red-600 dark:text-red-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Something went wrong
            </h1>
            
            <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm leading-relaxed">
              We encountered an unexpected error. Our team has been notified. Please try reloading the page.
            </p>

            {this.state.error && (
              <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg text-left overflow-hidden max-h-40 overflow-y-auto custom-scrollbar">
                <p className="text-xs font-mono text-red-600 dark:text-red-400 break-words">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                   <p className="text-[10px] font-mono text-red-500/80 mt-2 whitespace-pre-wrap">
                     {this.state.errorInfo.componentStack}
                   </p>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReload}
                className="btn btn-primary flex items-center justify-center space-x-2 w-full"
              >
                <RefreshCw size={16} />
                <span>Reload Page</span>
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={this.handleReport}
                  className="btn btn-secondary flex-1 flex items-center justify-center space-x-2"
                >
                  <Mail size={16} />
                  <span>Report</span>
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="btn btn-secondary flex-1 flex items-center justify-center space-x-2"
                >
                  <Home size={16} />
                  <span>Home</span>
                </button>
              </div>
            </div>
          </div>
          
          <p className="mt-8 text-xs text-slate-400">
            GCP Pulse &bull; Enterprise Dashboard
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
