import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import './App.css';

function AppContent() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="app-loading">
        <div className="app-loading-spinner" />
        <p>Initializing ArtiPanel...</p>
      </div>
    );
  }

  return isAuthenticated ? <Dashboard /> : <Auth />;
}

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <div className="app">
          <AppContent />
        </div>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
