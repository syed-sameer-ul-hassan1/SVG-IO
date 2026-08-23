import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@hummingbirdui/hummingbird/dist/hummingbird.css';
import './styles/index.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: '#0B0F17',
          color: '#FFFFFF',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>
            Something went wrong
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', maxWidth: '500px', marginBottom: '24px', fontSize: '14px' }}>
            {this.state.error?.message || 'An unexpected error occurred while loading the icon catalog.'}
          </p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            style={{
              padding: '12px 24px',
              borderRadius: '999px',
              background: '#FF5F02',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
            
            Reload Application
          </button>
        </div>);

    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);