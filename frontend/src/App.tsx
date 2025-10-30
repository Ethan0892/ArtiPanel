import React from 'react';
import Dashboard from './components/Dashboard';
import { SettingsProvider } from './context/SettingsContext';
import './App.css';

function App() {
  return (
    <SettingsProvider>
      <div className="app">
        <Dashboard />
      </div>
    </SettingsProvider>
  );
}

export default App;
