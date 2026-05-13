import { Component } from "react";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
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

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cream flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-start gap-4">
              <span className="text-4xl font-bold text-red-500">!</span>
              <div className="flex-1">
                <h1 className="text-2xl font-heading font-bold text-ink mb-2">
                  Oups, quelque chose s'est mal passé
                </h1>
                <p className="text-ink-muted mb-4">
                  Une erreur inattendue est survenue. L'équipe a été notifiée.
                </p>

                <details className="mb-6">
                  <summary className="cursor-pointer text-sm text-ink-muted hover:text-ink mb-2">
                    Détails techniques
                  </summary>
                  <div className="p-4 bg-cream rounded border border-cream-mid">
                    <p className="font-mono text-sm text-red-600 mb-2">
                      {this.state.error?.message}
                    </p>
                    <pre className="text-xs text-ink-muted overflow-auto max-h-60">
                      {this.state.error?.stack}
                    </pre>
                  </div>
                </details>

                <div className="flex gap-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-ink text-white rounded-lg hover:bg-ink-muted transition-colors"
                  >
                    Recharger la page
                  </button>
                  <button
                    onClick={() => (window.location.href = "/")}
                    className="px-4 py-2 border border-cream-mid rounded-lg hover:bg-cream transition-colors"
                  >
                    Retour à l'accueil
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
