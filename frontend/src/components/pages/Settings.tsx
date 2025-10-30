/**
 * Settings Page
 * 
 * User preferences, display settings, API configuration
 */

import React, { useState } from 'react';

interface SettingsProps {
  mode?: 'general' | 'notifications' | 'security' | 'api' | 'display';
}

const Settings: React.FC<SettingsProps> = ({ mode = 'general' }) => {
  const [activeTab, setActiveTab] = useState(mode);
  const [settings, setSettings] = useState({
    // General
    language: 'en',
    timezone: 'UTC',
    theme: 'dark',
    // Notifications
    enableNotifications: true,
    notificationSound: true,
    emailAlerts: true,
    slackIntegration: false,
    // Security
    twoFactorEnabled: false,
    sessionTimeout: 30,
    ipWhitelist: false,
    // API
    apiKey: 'sk_live_****',
    webhookUrl: '',
  });

  const [savedMessage, setSavedMessage] = useState('');

  const handleSave = () => {
    setSavedMessage('Settings saved successfully!');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="page-container">
      <style>{`
        .page-container {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          background-color: var(--color-background);
        }

        .page-header {
          margin-bottom: 32px;
        }

        .page-title {
          font-size: 32px;
          font-weight: 700;
          color: var(--color-text);
          margin-bottom: 8px;
        }

        .page-subtitle {
          font-size: 14px;
          color: var(--color-text-secondary);
        }

        .settings-container {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 24px;
          max-width: 1200px;
        }

        .settings-sidebar {
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          overflow: hidden;
        }

        .settings-nav {
          display: flex;
          flex-direction: column;
        }

        .settings-nav-item {
          padding: 16px;
          border-bottom: 1px solid var(--color-border);
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--color-text-secondary);
          font-size: 14px;
          font-weight: 500;
        }

        .settings-nav-item:last-child {
          border-bottom: none;
        }

        .settings-nav-item:hover {
          background-color: var(--color-surface-alt);
          color: var(--color-text);
        }

        .settings-nav-item.active {
          background-color: var(--color-primary);
          color: white;
        }

        .settings-content {
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 24px;
        }

        .settings-section {
          margin-bottom: 32px;
        }

        .settings-section:last-child {
          margin-bottom: 0;
        }

        .settings-section-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--color-text);
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 2px solid var(--color-border);
        }

        .settings-field {
          margin-bottom: 20px;
        }

        .settings-field-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text);
          margin-bottom: 8px;
          display: block;
        }

        .settings-field-description {
          font-size: 12px;
          color: var(--color-text-secondary);
          margin-top: 4px;
        }

        .settings-input {
          width: 100%;
          padding: 10px 12px;
          background-color: var(--color-surface-alt);
          border: 1px solid var(--color-border);
          border-radius: 6px;
          color: var(--color-text);
          font-size: 14px;
          font-family: inherit;
          transition: all 0.2s ease;
        }

        .settings-input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .settings-toggle {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .toggle-switch {
          width: 48px;
          height: 24px;
          background-color: var(--color-surface-alt);
          border-radius: 12px;
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
          border: 1px solid var(--color-border);
        }

        .toggle-switch.on {
          background-color: var(--color-success);
          border-color: var(--color-success);
        }

        .toggle-switch-circle {
          width: 20px;
          height: 20px;
          background-color: white;
          border-radius: 10px;
          position: absolute;
          top: 2px;
          left: 2px;
          transition: all 0.2s ease;
        }

        .toggle-switch.on .toggle-switch-circle {
          left: 26px;
        }

        .button-group {
          display: flex;
          gap: 12px;
          margin-top: 32px;
        }

        .btn-save {
          background-color: var(--color-primary);
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .btn-save:hover {
          background-color: var(--color-secondary);
        }

        .btn-cancel {
          background-color: var(--color-surface-alt);
          color: var(--color-text);
          border: 1px solid var(--color-border);
          padding: 10px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .btn-cancel:hover {
          background-color: var(--color-border);
        }

        .saved-message {
          color: var(--color-success);
          font-size: 14px;
          margin-top: 12px;
          padding: 8px 12px;
          background-color: rgba(34, 197, 94, 0.1);
          border-radius: 6px;
          border-left: 3px solid var(--color-success);
        }

        @media (max-width: 768px) {
          .page-container {
            padding: 16px;
          }

          .settings-container {
            grid-template-columns: 1fr;
          }

          .settings-sidebar {
            display: flex;
          }

          .settings-nav {
            flex-direction: row;
            overflow-x: auto;
          }

          .settings-nav-item {
            border-bottom: none;
            border-right: 1px solid var(--color-border);
            white-space: nowrap;
            flex: 1;
          }

          .page-title {
            font-size: 24px;
          }
        }
      `}</style>

      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your preferences and account settings</p>
      </div>

      <div className="settings-container">
        {/* Sidebar Navigation */}
        <div className="settings-sidebar">
          <div className="settings-nav">
            <div
              className={`settings-nav-item ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              ⚙️ General
            </div>
            <div
              className={`settings-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              🔔 Notifications
            </div>
            <div
              className={`settings-nav-item ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              🔒 Security
            </div>
            <div
              className={`settings-nav-item ${activeTab === 'api' ? 'active' : ''}`}
              onClick={() => setActiveTab('api')}
            >
              🔑 API Keys
            </div>
            <div
              className={`settings-nav-item ${activeTab === 'display' ? 'active' : ''}`}
              onClick={() => setActiveTab('display')}
            >
              🎨 Display
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="settings-content">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div>
              <div className="settings-section">
                <h2 className="settings-section-title">General Preferences</h2>

                <div className="settings-field">
                  <label className="settings-field-label">Language</label>
                  <select
                    className="settings-input"
                    value={settings.language}
                    onChange={(e) => handleChange('language', e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>

                <div className="settings-field">
                  <label className="settings-field-label">Timezone</label>
                  <select
                    className="settings-input"
                    value={settings.timezone}
                    onChange={(e) => handleChange('timezone', e.target.value)}
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Time</option>
                    <option value="CST">Central Time</option>
                    <option value="PST">Pacific Time</option>
                  </select>
                  <div className="settings-field-description">
                    Used for displaying dates and times throughout the dashboard
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div>
              <div className="settings-section">
                <h2 className="settings-section-title">Notification Preferences</h2>

                <div className="settings-field">
                  <label className="settings-field-label">Enable Notifications</label>
                  <div className="settings-toggle">
                    <div
                      className={`toggle-switch ${settings.enableNotifications ? 'on' : ''}`}
                      onClick={() => handleChange('enableNotifications', !settings.enableNotifications)}
                    >
                      <div className="toggle-switch-circle"></div>
                    </div>
                    <span>{settings.enableNotifications ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>

                <div className="settings-field">
                  <label className="settings-field-label">Notification Sound</label>
                  <div className="settings-toggle">
                    <div
                      className={`toggle-switch ${settings.notificationSound ? 'on' : ''}`}
                      onClick={() => handleChange('notificationSound', !settings.notificationSound)}
                    >
                      <div className="toggle-switch-circle"></div>
                    </div>
                    <span>{settings.notificationSound ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>

                <div className="settings-field">
                  <label className="settings-field-label">Email Alerts</label>
                  <div className="settings-toggle">
                    <div
                      className={`toggle-switch ${settings.emailAlerts ? 'on' : ''}`}
                      onClick={() => handleChange('emailAlerts', !settings.emailAlerts)}
                    >
                      <div className="toggle-switch-circle"></div>
                    </div>
                    <span>{settings.emailAlerts ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>

                <div className="settings-field">
                  <label className="settings-field-label">Slack Integration</label>
                  <div className="settings-toggle">
                    <div
                      className={`toggle-switch ${settings.slackIntegration ? 'on' : ''}`}
                      onClick={() => handleChange('slackIntegration', !settings.slackIntegration)}
                    >
                      <div className="toggle-switch-circle"></div>
                    </div>
                    <span>{settings.slackIntegration ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div>
              <div className="settings-section">
                <h2 className="settings-section-title">Security</h2>

                <div className="settings-field">
                  <label className="settings-field-label">Two-Factor Authentication</label>
                  <div className="settings-toggle">
                    <div
                      className={`toggle-switch ${settings.twoFactorEnabled ? 'on' : ''}`}
                      onClick={() => handleChange('twoFactorEnabled', !settings.twoFactorEnabled)}
                    >
                      <div className="toggle-switch-circle"></div>
                    </div>
                    <span>{settings.twoFactorEnabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>

                <div className="settings-field">
                  <label className="settings-field-label">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    className="settings-input"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                  />
                  <div className="settings-field-description">
                    Auto-logout after inactivity
                  </div>
                </div>

                <div className="settings-field">
                  <label className="settings-field-label">IP Whitelist</label>
                  <div className="settings-toggle">
                    <div
                      className={`toggle-switch ${settings.ipWhitelist ? 'on' : ''}`}
                      onClick={() => handleChange('ipWhitelist', !settings.ipWhitelist)}
                    >
                      <div className="toggle-switch-circle"></div>
                    </div>
                    <span>{settings.ipWhitelist ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API Settings */}
          {activeTab === 'api' && (
            <div>
              <div className="settings-section">
                <h2 className="settings-section-title">API Configuration</h2>

                <div className="settings-field">
                  <label className="settings-field-label">API Key</label>
                  <input
                    type="password"
                    className="settings-input"
                    value={settings.apiKey}
                    readOnly
                  />
                  <div className="settings-field-description">
                    Keep this key secret. Click to reveal
                  </div>
                </div>

                <div className="settings-field">
                  <label className="settings-field-label">Webhook URL</label>
                  <input
                    type="url"
                    className="settings-input"
                    placeholder="https://your-webhook-endpoint.com"
                    value={settings.webhookUrl}
                    onChange={(e) => handleChange('webhookUrl', e.target.value)}
                  />
                  <div className="settings-field-description">
                    Optional: Receive real-time events at this URL
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Display Settings */}
          {activeTab === 'display' && (
            <div>
              <div className="settings-section">
                <h2 className="settings-section-title">Display Preferences</h2>

                <div className="settings-field">
                  <label className="settings-field-label">Theme</label>
                  <select
                    className="settings-input"
                    value={settings.theme}
                    onChange={(e) => handleChange('theme', e.target.value)}
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="button-group">
            <button className="btn-save" onClick={handleSave}>
              💾 Save Settings
            </button>
            <button className="btn-cancel">
              ✕ Cancel
            </button>
          </div>

          {savedMessage && <div className="saved-message">✓ {savedMessage}</div>}
        </div>
      </div>
    </div>
  );
};

export default Settings;
