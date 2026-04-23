import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Register the service worker defensively. Failures here should never prevent
// the app from mounting — iOS standalone mode will show a blank screen if
// anything throws during module evaluation.
import('virtual:pwa-register')
  .then(({ registerSW }) => {
    try {
      registerSW({
        immediate: true,
        onNeedRefresh() {
          window.dispatchEvent(new CustomEvent('pwa:update-ready'));
        },
        onRegisterError(err) {
          console.warn('SW register error', err);
        },
      });
    } catch (err) {
      console.warn('SW init error', err);
    }
  })
  .catch((err) => console.warn('SW module load error', err));

class RootBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      const e = this.state.error as Error;
      return (
        <div
          style={{
            padding: 20,
            color: '#fff',
            background: '#0a0a0a',
            fontFamily: 'system-ui, sans-serif',
            minHeight: '100vh',
          }}
        >
          <h1 style={{ color: '#ff6b6b', marginBottom: 8 }}>App error</h1>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontSize: 12,
              marginBottom: 12,
            }}
          >
            {e.name}: {e.message}
            {'\n\n'}
            {e.stack}
          </pre>
          <button
            type="button"
            onClick={() => {
              location.hash = '';
              location.reload();
            }}
            style={{
              background: '#ff6b6b',
              color: '#0a0a0a',
              border: 'none',
              padding: '10px 18px',
              borderRadius: 999,
              fontWeight: 600,
            }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootBoundary>
      <HashRouter>
        <App />
      </HashRouter>
    </RootBoundary>
  </React.StrictMode>,
);
