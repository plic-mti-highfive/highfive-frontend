import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";
import { Button, ErrorState } from "@shared/ui";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Filet de secours applicatif (V2 item 4) : migre sur la primitive
 * `ErrorState` (src/shared/ui/error-state.tsx) — plus aucune couleur en dur
 * (V2-2), le rouge/blanc codes en dur laissent place aux tokens `danger-*`
 * et `background`/`card`/`border` deja utilises partout ailleurs.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
          <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-8 shadow-lift">
            <ErrorState message="Une erreur inattendue est survenue." />

            {this.state.error && (
              <details className="mt-2">
                <summary className="cursor-pointer text-body-sm text-muted-foreground hover:text-foreground">
                  Détails techniques
                </summary>
                <div className="mt-2 rounded-md border border-border bg-muted p-4">
                  <p className="font-mono text-body-sm text-danger-fg">
                    {this.state.error.message}
                  </p>
                  <pre className="mt-2 max-h-60 overflow-auto text-body-sm text-muted-foreground">
                    {this.state.error.stack}
                  </pre>
                </div>
              </details>
            )}

            <div className="mt-6 flex justify-center gap-3">
              <Button onClick={() => window.location.reload()}>
                Recharger la page
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/")}
              >
                Retour à l'accueil
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
