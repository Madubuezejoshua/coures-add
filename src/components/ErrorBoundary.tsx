import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface State {
  hasError: boolean;
  message?: string;
}

/** Catches render-time errors anywhere below it and shows a friendly fallback. */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, message: error instanceof Error ? error.message : 'Unexpected error' };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error('Render error caught by ErrorBoundary:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-4">
        <div className="w-full max-w-md rounded-2xl border border-cream-200 bg-white p-8 text-center shadow-card">
          <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <AlertTriangle className="h-7 w-7" />
          </span>
          <h1 className="text-xl font-bold text-slate-900">Something went wrong</h1>
          <p className="mt-2 text-sm text-slate-500">
            An unexpected error occurred while rendering this page.
          </p>
          {this.state.message && (
            <p className="mt-3 break-words rounded-lg bg-slate-50 px-3 py-2 text-left text-xs text-slate-400">
              {this.state.message}
            </p>
          )}
          <button
            onClick={() => {
              this.setState({ hasError: false, message: undefined });
              window.location.assign('/');
            }}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-brand-300 px-6 text-sm font-semibold text-ink transition-colors hover:bg-brand-400"
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }
}
