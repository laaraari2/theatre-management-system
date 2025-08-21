import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h2>عذراً، حدث خطأ غير متوقع</h2>
            <p>نعتذر عن هذا الإزعاج. يرجى تحديث الصفحة أو المحاولة لاحقاً.</p>
            
            <div className="error-actions">
              <button 
                className="error-btn primary"
                onClick={() => window.location.reload()}
              >
                🔄 تحديث الصفحة
              </button>
              
              <button 
                className="error-btn secondary"
                onClick={() => this.setState({ hasError: false })}
              >
                🔙 المحاولة مرة أخرى
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>تفاصيل الخطأ (للمطورين)</summary>
                <pre className="error-stack">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
