import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F0] p-6 text-center">
          <div className="w-16 h-16 bg-[#C7826B]/10 rounded-full flex items-center justify-center text-[#C7826B] mb-6">
            <AlertTriangle size={32} />
          </div>
          <h1 className="font-serif text-2xl text-[#2C3E50] mb-2">Something went wrong</h1>
          <p className="text-[#2C3E50]/60 text-sm mb-8 max-w-xs mx-auto">
            We encountered an unexpected error. Please try reloading the page.
          </p>
          
          <div className="bg-white p-4 rounded-xl border border-[#C7826B]/20 mb-8 max-w-sm w-full overflow-auto">
            <code className="text-xs text-[#C7826B] font-mono block text-left">
              {this.state.error?.message}
            </code>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-3 bg-[#2C3E50] text-white rounded-xl font-medium hover:bg-[#2C3E50]/90 transition-colors shadow-lg shadow-[#2C3E50]/20"
          >
            <RefreshCw size={18} />
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
