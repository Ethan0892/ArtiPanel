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

  return (
    <div className="topbar">
      <style jsx>{`
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
        }

        .topbar-button:hover {
          background-color: var(--color-surface-alt);
          color: var(--color-text);
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

        <button 
          className="topbar-button notification-badge" 
          title="Notifications"
        >
          🔔
          <span className="badge-count">3</span>
        </button>

        <button 
          className="topbar-button" 
          title="Toggle theme (Ctrl+Shift+T)"
          onClick={onThemeClick}
        >
          🎨
        </button>

        <button 
          className="topbar-button" 
          title="Keyboard shortcuts (Shift+?)"
        >
          ⌨️
        </button>

        <button 
          className="topbar-button" 
          title="Settings"
        >
          ⚙️
        </button>

        <button 
          className="topbar-button" 
          title="User menu"
        >
          👤
        </button>
      </div>
    </div>
  );
};

export default TopBar;
