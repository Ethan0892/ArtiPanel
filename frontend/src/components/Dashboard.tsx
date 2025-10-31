/**
 * Main Dashboard Layout
 * 
 * Beautiful Pelican + Pterodactyl-inspired UI with
 * configurable colors and professional design
 */

import React, { useCallback, useEffect, useState } from 'react';
import { applyTheme, AVAILABLE_THEMES, getSavedTheme } from '../config/themes';
import { useSettings } from '../context/SettingsContext';
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
  const { settings, updateSetting } = useSettings();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTheme, setCurrentTheme] = useState(() => {
    const selected = AVAILABLE_THEMES.find(theme => theme.id === settings.appearance.themeId);
    return selected || getSavedTheme();
  });
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handlePageSelect = useCallback((pageId: string) => {
    if (pageId === 'settings') {
      setCurrentPage('settings-general');
      return;
    }
    setCurrentPage(pageId);
  }, []);

  // Initialize keyboard shortcuts and theme
  useEffect(() => {
    shortcutManager.addListener();

    return () => {
      shortcutManager.removeListener();
    };
  }, []);

  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    const handleOpenThemeSelector = (_event: Event) => setShowThemeSelector(true);
    window.addEventListener('ui:open-theme-selector', handleOpenThemeSelector);
    return () => window.removeEventListener('ui:open-theme-selector', handleOpenThemeSelector);
  }, []);

  useEffect(() => {
    const themeFromSettings = AVAILABLE_THEMES.find(theme => theme.id === settings.appearance.themeId);
    if (themeFromSettings && themeFromSettings.id !== currentTheme.id) {
      setCurrentTheme(themeFromSettings);
    }
  }, [settings.appearance.themeId, currentTheme.id]);

  useEffect(() => {
    document.documentElement.setAttribute('data-density', settings.appearance.density);
  }, [settings.appearance.density]);

  useEffect(() => {
    document.documentElement.setAttribute('data-tooltips', settings.appearance.showTooltips ? 'on' : 'off');
  }, [settings.appearance.showTooltips]);

  useEffect(() => {
    const className = 'artipanel-reduce-motion';
    if (settings.appearance.animations) {
      document.documentElement.classList.remove(className);
    } else {
      document.documentElement.classList.add(className);
    }
  }, [settings.appearance.animations]);

  useEffect(() => {
    if (settings.appearance.themeId !== currentTheme.id) {
      updateSetting('appearance.themeId', currentTheme.id);
    }
    const mode = currentTheme.isDark ? 'dark' : 'light';
    if (settings.appearance.theme !== mode) {
      updateSetting('appearance.theme', mode);
    }
  }, [currentTheme, settings.appearance.themeId, settings.appearance.theme, updateSetting]);

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
          onPageSelect={handlePageSelect}
          activePage={currentPage}
        />

        {/* Main Content Area */}
        <div className="dashboard-main">
          {/* Top Navigation Bar */}
          <TopBar 
            onThemeClick={() => setShowThemeSelector(!showThemeSelector)}
            onSettingsClick={() => setCurrentPage('settings-general')}
            onLogout={onLogout}
            onNavigate={(page) => setCurrentPage(page)}
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
              updateSetting('appearance.themeId', theme.id);
              updateSetting('appearance.theme', theme.isDark ? 'dark' : 'light');
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
          font-size: ${settings.appearance.density === 'compact' ? '13px' : '14px'};
          line-height: 1.5;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        ${settings.appearance.animations ? '' : `.artipanel-dashboard * {
          transition: none !important;
          animation: none !important;
        }`}

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
