/**
 * Theme Selector Modal Component
 * 
 * Allows users to select and preview themes
 */

import React, { useState } from 'react';
import { AVAILABLE_THEMES, Theme, createCustomTheme, saveCustomTheme } from '../config/themes';

interface ThemeSelectorProps {
  currentTheme: Theme;
  onClose: () => void;
  onThemeSelect: (theme: Theme) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onClose, onThemeSelect }) => {
  const [customColorMode, setCustomColorMode] = useState(false);
  const [customColors, setCustomColors] = useState<Record<string, string>>({
    primary: currentTheme.colors.primary,
    secondary: currentTheme.colors.secondary,
    accent: currentTheme.colors.accent,
  });

  const handleColorChange = (colorKey: string, value: string) => {
    setCustomColors({ ...customColors, [colorKey]: value });
  };

  const handleSaveCustomTheme = () => {
    const theme = createCustomTheme(
      'My Custom Theme',
      customColors,
      currentTheme.isDark
    );
    saveCustomTheme(theme);
    onThemeSelect(theme);
  };

  return (
    <div className="theme-selector-overlay">
      <style jsx>{`
        .theme-selector-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .theme-selector-modal {
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          padding: 24px;
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--color-border);
        }

        .modal-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--color-text);
        }

        .modal-close {
          background: none;
          border: none;
          color: var(--color-text-secondary);
          cursor: pointer;
          font-size: 20px;
          padding: 4px;
        }

        .modal-close:hover {
          color: var(--color-text);
        }

        .theme-tabs {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 12px;
        }

        .theme-tab {
          background: none;
          border: none;
          padding: 8px 16px;
          cursor: pointer;
          color: var(--color-text-secondary);
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s ease;
          border-bottom: 2px solid transparent;
          margin-bottom: -13px;
        }

        .theme-tab.active {
          color: var(--color-primary);
          border-bottom-color: var(--color-primary);
        }

        .theme-tab:hover {
          color: var(--color-text);
        }

        .themes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 12px;
          margin-bottom: 24px;
        }

        .theme-card {
          border: 2px solid var(--color-border);
          border-radius: 8px;
          padding: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }

        .theme-card.active {
          border-color: var(--color-primary);
          background-color: rgba(99, 102, 241, 0.1);
        }

        .theme-card:hover {
          border-color: var(--color-primary);
          transform: translateY(-2px);
        }

        .theme-preview {
          display: flex;
          gap: 4px;
          margin-bottom: 8px;
          height: 32px;
        }

        .theme-preview-swatch {
          flex: 1;
          border-radius: 4px;
          opacity: 0.8;
        }

        .theme-name {
          font-size: 12px;
          font-weight: 500;
          color: var(--color-text);
          margin-bottom: 4px;
        }

        .theme-description {
          font-size: 11px;
          color: var(--color-text-secondary);
        }

        .custom-colors-section {
          background-color: var(--color-surface-alt);
          border-radius: 8px;
          padding: 16px;
          margin-top: 16px;
        }

        .custom-colors-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text);
          margin-bottom: 12px;
        }

        .color-picker {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 12px;
        }

        .color-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .color-label {
          font-size: 12px;
          color: var(--color-text-secondary);
          text-transform: capitalize;
        }

        .color-input-group {
          display: flex;
          gap: 8px;
        }

        .color-input {
          width: 40px;
          height: 32px;
          border: 1px solid var(--color-border);
          border-radius: 4px;
          cursor: pointer;
          padding: 0;
        }

        .color-value {
          flex: 1;
          background-color: var(--color-background);
          border: 1px solid var(--color-border);
          border-radius: 4px;
          padding: 6px 8px;
          font-size: 11px;
          color: var(--color-text-secondary);
          font-family: 'Monaco', 'Menlo', monospace;
        }

        .modal-footer {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding-top: 16px;
          border-top: 1px solid var(--color-border);
          margin-top: 20px;
        }

        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .btn-secondary {
          background-color: var(--color-surface-alt);
          color: var(--color-text);
          border: 1px solid var(--color-border);
        }

        .btn-secondary:hover {
          background-color: var(--color-border);
        }

        .btn-primary {
          background-color: var(--color-primary);
          color: white;
        }

        .btn-primary:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
      `}</style>

      <div className="theme-selector-modal">
        <div className="modal-header">
          <h2 className="modal-title">🎨 Theme Selector</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="theme-tabs">
          <button 
            className={`theme-tab ${!customColorMode ? 'active' : ''}`}
            onClick={() => setCustomColorMode(false)}
          >
            Built-in Themes
          </button>
          <button 
            className={`theme-tab ${customColorMode ? 'active' : ''}`}
            onClick={() => setCustomColorMode(true)}
          >
            Custom Theme
          </button>
        </div>

        {!customColorMode ? (
          <div className="themes-grid">
            {AVAILABLE_THEMES.map(theme => (
              <div 
                key={theme.id}
                className={`theme-card ${theme.id === currentTheme.id ? 'active' : ''}`}
                onClick={() => onThemeSelect(theme)}
              >
                <div className="theme-preview">
                  <div 
                    className="theme-preview-swatch"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  <div 
                    className="theme-preview-swatch"
                    style={{ backgroundColor: theme.colors.secondary }}
                  />
                  <div 
                    className="theme-preview-swatch"
                    style={{ backgroundColor: theme.colors.accent }}
                  />
                </div>
                <div className="theme-name">{theme.name}</div>
                <div className="theme-description">{theme.description}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="custom-colors-section">
            <div className="custom-colors-title">Customize Colors</div>
            <div className="color-picker">
              {Object.entries(customColors).map(([colorKey, colorValue]) => (
                <div key={colorKey} className="color-item">
                  <label className="color-label">{colorKey}</label>
                  <div className="color-input-group">
                    <input 
                      type="color"
                      className="color-input"
                      value={colorValue}
                      onChange={(e) => handleColorChange(colorKey, e.target.value)}
                    />
                  </div>
                  <div className="color-value">{colorValue}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          {customColorMode && (
            <button className="btn btn-primary" onClick={handleSaveCustomTheme}>
              Save Custom Theme
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;
