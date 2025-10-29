/**
 * Main Dashboard Layout
 * 
 * Beautiful Pelican + Pterodactyl-inspired UI with
 * configurable colors and professional design
 */

import React, { useState, useEffect } from 'react';
import { applyTheme, getSavedTheme, AVAILABLE_THEMES } from '../config/themes';
import { shortcutManager } from '../utils/shortcuts';
import { ErrorBoundary } from './ErrorBoundary';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ContentArea from './ContentArea';
import ThemeSelector from './ThemeSelector';

export interface DashboardProps {
  onLogout?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTheme, setCurrentTheme] = useState(getSavedTheme());
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Initialize keyboard shortcuts and theme
  useEffect(() => {
    applyTheme(currentTheme);
    shortcutManager.addListener();

    // Handle theme changes
    window.addEventListener('theme-changed', (e: any) => {
      const newTheme = AVAILABLE_THEMES.find(t => t.id === e.detail.themeId);
      if (newTheme) {
        setCurrentTheme(newTheme);
        applyTheme(newTheme);
      }
    });

    return () => {
      shortcutManager.removeListener();
    };
  }, []);

  // Handle sidebar toggle
  useEffect(() => {
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    window.addEventListener('nav:toggle-sidebar', toggleSidebar);
    return () => window.removeEventListener('nav:toggle-sidebar', toggleSidebar);
  }, [sidebarOpen]);

  return (
    <div className="artipanel-dashboard">
      {/* CSS Variables based on theme */}
      <style>{`
        :root {
          --color-primary: ${currentTheme.colors.primary};
          --color-secondary: ${currentTheme.colors.secondary};
          --color-accent: ${currentTheme.colors.accent};
          --color-background: ${currentTheme.colors.background};
          --color-surface: ${currentTheme.colors.surface};
          --color-surface-alt: ${currentTheme.colors.surfaceAlt};
          --color-text: ${currentTheme.colors.text};
          --color-text-secondary: ${currentTheme.colors.textSecondary};
          --color-border: ${currentTheme.colors.border};
          --color-success: ${currentTheme.colors.success};
          --color-warning: ${currentTheme.colors.warning};
          --color-error: ${currentTheme.colors.error};
          --color-info: ${currentTheme.colors.info};
        }
      `}</style>

      <div className="dashboard-container">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onPageSelect={setCurrentPage}
        />

        {/* Main Content Area */}
        <div className="dashboard-main">
          {/* Top Navigation Bar */}
          <TopBar 
            onThemeClick={() => setShowThemeSelector(!showThemeSelector)}
            onLogout={onLogout}
          />

          {/* Content */}
          <ErrorBoundary>
            <ContentArea currentPage={currentPage} />
          </ErrorBoundary>
        </div>

        {/* Theme Selector Modal */}
        {showThemeSelector && (
          <ThemeSelector 
            currentTheme={currentTheme}
            onClose={() => setShowThemeSelector(false)}
            onThemeSelect={(theme) => {
              setCurrentTheme(theme);
              applyTheme(theme);
              setShowThemeSelector(false);
            }}
          />
        )}
      </div>

      {/* Styles */}
      <style>{`
        .artipanel-dashboard {
          background-color: var(--color-background);
          color: var(--color-text);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
          font-size: 14px;
          line-height: 1.5;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .dashboard-container {
          display: flex;
          height: 100vh;
          width: 100%;
          overflow: hidden;
        }

        .dashboard-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background-color: var(--color-background);
        }

        @media (max-width: 768px) {
          .dashboard-container {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
