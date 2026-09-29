import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          textAlign: "center",
          padding: "2rem",
          color: "#94a3b8",
        }}>
          <h2 style={{ color: "#ef4444", marginBottom: "1rem" }}>Something went wrong</h2>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              padding: "0.5rem 1rem",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
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

export default ErrorBoundary;
