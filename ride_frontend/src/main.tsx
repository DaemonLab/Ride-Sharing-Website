import { StrictMode, Component, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { NuqsAdapter } from 'nuqs/adapters/react';
import App from './App.tsx';
import './index.css';

// ErrorBoundary: catches render errors so you see a message instead of a blank screen
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div role="alert" style={{ padding: '2rem', fontFamily: 'sans-serif', color: '#161c27' }}>
          <h2>Something went wrong</h2>
          <p>Please refresh the page and try again.</p>
          <button onClick={() => window.location.reload()}>Refresh page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NuqsAdapter>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </NuqsAdapter>
  </StrictMode>
);
