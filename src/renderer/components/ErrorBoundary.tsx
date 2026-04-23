import { Component, type ErrorInfo, type ReactNode } from "react";
import { getDebugLogText } from "../lib/debugLog";
import { pt } from "../i18n/pt";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  error?: Error;
  info?: string;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ info: errorInfo.componentStack ?? "" });
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="app-error-fallback" role="alert" style={{ padding: 32, maxWidth: 720, margin: "0 auto" }}>
          <h1 style={{ margin: "0 0 12px" }}>Algo correu mal</h1>
          <p style={{ color: "var(--muted, #888)" }}>{pt.errorBound.summary}</p>
          <pre
            style={{
              background: "rgba(0,0,0,0.25)",
              padding: 16,
              borderRadius: 12,
              overflow: "auto",
              fontSize: 12
            }}
          >
            {this.state.error.toString()}
            {this.state.info}
          </pre>
          <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 10 }}>
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                void navigator.clipboard.writeText(
                  `${this.state.error}\n\n${this.state.info ?? ""}\n\n--- LippTV log ---\n${getDebugLogText()}`
                );
              }}
            >
              {pt.errorBound.copyDetails}
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={() => {
                this.setState({ hasError: false, error: undefined, info: undefined });
                window.location.hash = "";
                window.location.reload();
              }}
            >
              {pt.errorBound.reload}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
