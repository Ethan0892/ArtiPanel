/**
 * Top Navigation Bar Component
 * 
 * Header with search, notifications, and settings
 */

import React, { useState } from 'react';

interface TopBarProps {
  onThemeClick: () => void;
  onLogout?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onThemeClick, onLogout }) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  return (
    <div className="topbar">
      <style>{`
        .topbar {
          background-color: var(--color-surface);
          border-bottom: 1px solid var(--color-border);
          padding: 0 20px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .topbar-left {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--color-text-secondary);
        }

        .breadcrumb-item {
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .breadcrumb-item:hover {
          background-color: var(--color-surface-alt);
          color: var(--color-text);
        }

        .breadcrumb-separator {
          color: var(--color-border);
        }

        .search-box {
          flex: 0 1 300px;
          display: flex;
          align-items: center;
          background-color: var(--color-surface-alt);
          border: 1px solid var(--color-border);
          border-radius: 6px;
          padding: 8px 12px;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .search-box.focused {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.1);
        }

        .search-icon {
          font-size: 14px;
          color: var(--color-text-secondary);
        }

        .search-input {
          flex: 1;
          background: none;
          border: none;
          color: var(--color-text);
          font-size: 13px;
          outline: none;
        }

        .search-input::placeholder {
          color: var(--color-text-secondary);
        }

        .search-hint {
          font-size: 11px;
          color: var(--color-text-secondary);
          background-color: rgba(0, 0, 0, 0.2);
          padding: 2px 6px;
          border-radius: 3px;
          white-space: nowrap;
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--color-success);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--color-success);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .topbar-button {
          background: none;
          border: none;
          color: var(--color-text-secondary);
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          font-size: 16px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .topbar-button:hover {
          background-color: var(--color-surface-alt);
          color: var(--color-text);
        }

        .topbar-button.active {
          background-color: var(--color-primary);
          color: white;
        }

        .notification-badge {
          position: relative;
        }

        .badge-count {
          position: absolute;
          top: -4px;
          right: -4px;
          background-color: var(--color-error);
          color: white;
          font-size: 10px;
          padding: 2px 4px;
          border-radius: 10px;
          min-width: 16px;
          text-align: center;
        }

        .keyboard-hint {
          font-size: 11px;
          color: var(--color-text-secondary);
          background-color: rgba(0, 0, 0, 0.2);
          padding: 2px 6px;
          border-radius: 3px;
          white-space: nowrap;
          display: none;
        }

        /* Dropdown Menu Styles */
        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          min-width: 280px;
          margin-top: 8px;
          z-index: 1000;
        }

        .dropdown-header {
          padding: 12px 16px;
          border-bottom: 1px solid var(--color-border);
          font-weight: 600;
          font-size: 13px;
          color: var(--color-text);
        }

        .dropdown-item {
          padding: 12px 16px;
          color: var(--color-text);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
        }

        .dropdown-item:hover {
          background-color: var(--color-surface-alt);
        }

        .dropdown-item.danger {
          color: var(--color-error);
        }

        .dropdown-item.danger:hover {
          background-color: rgba(239, 68, 68, 0.1);
        }

        .dropdown-divider {
          height: 1px;
          background-color: var(--color-border);
          margin: 8px 0;
        }

        .shortcuts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          padding: 16px;
        }

        .shortcut-item {
          background-color: var(--color-surface-alt);
          padding: 12px;
          border-radius: 6px;
          font-size: 12px;
        }

        .shortcut-key {
          background-color: var(--color-background);
          padding: 4px 6px;
          border-radius: 3px;
          font-family: monospace;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .shortcut-desc {
          color: var(--color-text-secondary);
          font-size: 11px;
        }

        @media (max-width: 1024px) {
          .keyboard-hint {
            display: none !important;
          }
        }

        @media (max-width: 768px) {
          .topbar {
            flex-wrap: wrap;
            height: auto;
            padding: 12px 16px;
          }

          .topbar-left {
            width: 100%;
            flex-wrap: wrap;
          }

          .search-box {
            flex: 1;
            min-width: 200px;
          }

          .breadcrumb {
            display: none;
          }

          .dropdown-menu {
            min-width: 240px;
          }
        }
      `}</style>

      <div className="topbar-left">
        <div className="breadcrumb">
          <span className="breadcrumb-item">🏠 Home</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item">📊 Dashboard</span>
        </div>

        <div className={`search-box ${searchFocused ? 'focused' : ''}`}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search servers, files, nodes..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <span className="search-hint">Ctrl+P</span>
        </div>
      </div>

      <div className="topbar-right">
        <div className="status-indicator">
          <span className="status-dot"></span>
          <span>All Systems Online</span>
        </div>

        {/* Notifications Button */}
        <div style={{ position: 'relative' }}>
          <button 
            className={`topbar-button notification-badge ${showNotifications ? 'active' : ''}`}
            title="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            🔔
            <span className="badge-count">3</span>
          </button>
          {showNotifications && (
            <div className="dropdown-menu">
              <div className="dropdown-header">Notifications (3)</div>
              <div className="dropdown-item">
                <span>⚠️</span>
                <div>
                  <div style={{ fontWeight: 600 }}>Server Alert</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>High CPU usage detected</div>
                </div>
              </div>
              <div className="dropdown-item">
                <span>✓</span>
                <div>
                  <div style={{ fontWeight: 600 }}>Backup Complete</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Database backup successful</div>
                </div>
              </div>
              <div className="dropdown-item">
                <span>ℹ️</span>
                <div>
                  <div style={{ fontWeight: 600 }}>Update Available</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>New version 0.2.0 released</div>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item" style={{ justifyContent: 'center' }}>
                View all notifications
              </div>
            </div>
          )}
        </div>

        {/* Theme Button */}
        <button 
          className="topbar-button" 
          title="Toggle theme (Ctrl+Shift+T)"
          onClick={onThemeClick}
        >
          🎨
        </button>

        {/* Keyboard Shortcuts Button */}
        <div style={{ position: 'relative' }}>
          <button 
            className={`topbar-button ${showShortcuts ? 'active' : ''}`}
            title="Keyboard shortcuts (Shift+?)"
            onClick={() => setShowShortcuts(!showShortcuts)}
          >
            ⌨️
          </button>
          {showShortcuts && (
            <div className="dropdown-menu" style={{ minWidth: '320px' }}>
              <div className="dropdown-header">Keyboard Shortcuts</div>
              <div className="shortcuts-grid">
                <div className="shortcut-item">
                  <div className="shortcut-key">Ctrl+P</div>
                  <div className="shortcut-desc">Search</div>
                </div>
                <div className="shortcut-item">
                  <div className="shortcut-key">Ctrl+Shift+T</div>
                  <div className="shortcut-desc">Toggle theme</div>
                </div>
                <div className="shortcut-item">
                  <div className="shortcut-key">Shift+?</div>
                  <div className="shortcut-desc">Help</div>
                </div>
                <div className="shortcut-item">
                  <div className="shortcut-key">Esc</div>
                  <div className="shortcut-desc">Close menu</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings Button */}
        <div style={{ position: 'relative' }}>
          <button 
            className={`topbar-button ${showSettings ? 'active' : ''}`}
            title="Settings"
            onClick={() => setShowSettings(!showSettings)}
          >
            ⚙️
          </button>
          {showSettings && (
            <div className="dropdown-menu">
              <div className="dropdown-header">Settings</div>
              <div className="dropdown-item">Display</div>
              <div className="dropdown-item">Notifications</div>
              <div className="dropdown-item">Security</div>
              <div className="dropdown-item">API Keys</div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item">Preferences</div>
            </div>
          )}
        </div>

        {/* User Menu Button */}
        <div style={{ position: 'relative' }}>
          <button 
            className={`topbar-button ${showUserMenu ? 'active' : ''}`}
            title="User menu"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            👤
          </button>
          {showUserMenu && (
            <div className="dropdown-menu">
              <div className="dropdown-header">Account</div>
              <div className="dropdown-item">
                <span style={{ fontSize: '18px' }}>👤</span>
                <div>
                  <div style={{ fontWeight: 600 }}>Ethan</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Administrator</div>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item">Profile</div>
              <div className="dropdown-item">Account Settings</div>
              <div className="dropdown-item">Two-Factor Auth</div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item danger" onClick={onLogout}>
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
