/**
 * Error Boundary Component
 * 
 * Catches React errors and displays user-friendly error UI
 */

import { ReactNode, Component, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.retry);
      }

      return (
        <div
          style={{
            padding: '20px',
            margin: '20px',
            backgroundColor: '#fee',
            border: '1px solid #f99',
            borderRadius: '4px',
            fontFamily: 'monospace',
          }}
        >
          <h2 style={{ color: '#c00' }}>Something went wrong</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error.toString()}
          </details>
          <button
            onClick={this.retry}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Error display component for async errors
 */
export function ErrorDisplay({
  error,
  onDismiss,
}: {
  error: Error | null;
  onDismiss: () => void;
}) {
  if (!error) return null;

  return (
    <div
      style={{
        backgroundColor: '#fee',
        border: '1px solid #f99',
        borderRadius: '4px',
        padding: '12px',
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div style={{ color: '#c00', fontSize: '14px' }}>
        <strong>Error:</strong> {error.message}
      </div>
      <button
        onClick={onDismiss}
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '20px',
          color: '#c00',
        }}
      >
        ×
      </button>
    </div>
  );
}

/**
 * Loading skeleton component
 */
export function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            height: '60px',
            backgroundColor: '#f0f0f0',
            borderRadius: '4px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      ))}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
