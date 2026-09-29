import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Caught in ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070A0F] text-slate-100 flex flex-col items-center justify-center p-6 font-mono">
          <div className="max-w-xl w-full p-6 rounded-xl bg-[#0D1117] border border-rose-500/40 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
              <h2 className="text-base font-bold uppercase tracking-wider">React Runtime Error</h2>
            </div>
            
            <p className="text-xs text-slate-400">
              An unexpected render error occurred in the UI:
            </p>

            <div className="p-3.5 rounded bg-[#070A0F] border border-rose-900/50 text-rose-300 text-xs break-words max-h-40 overflow-y-auto">
              {this.state.error?.toString()}
            </div>

            {this.state.errorInfo?.componentStack && (
              <details className="text-[11px] text-slate-500">
                <summary className="cursor-pointer hover:text-slate-300">View Component Stack</summary>
                <pre className="mt-2 p-2 bg-[#070A0F] rounded text-[10px] overflow-x-auto text-slate-400">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <button
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                window.location.reload();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-rose-500 hover:bg-rose-400 text-slate-950 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
