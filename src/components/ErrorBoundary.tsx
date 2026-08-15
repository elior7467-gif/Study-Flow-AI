import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neo-bg text-neo-text p-6 text-center">
          <div className="w-20 h-20 bg-neo-convex shadow-neo rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-gray-500 max-w-md mb-8">
            An unexpected error occurred. Please refresh the page or try again later.
          </p>
          {this.state.error && (
            <div className="bg-neo-concave shadow-neo-inner p-4 rounded-xl text-left max-w-2xl w-full mb-8 overflow-auto text-sm text-red-400 font-mono">
              {this.state.error.message}
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-neo-convex shadow-neo hover:shadow-neo-sm active:shadow-neo-inner px-6 py-3 rounded-xl font-bold transition-all"
          >
            <RefreshCcw className="w-5 h-5" />
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
