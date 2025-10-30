import React, { useMemo, useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { AVAILABLE_THEMES } from '../../config/themes';

interface SettingsProps {
  mode?: 'general' | 'notifications' | 'security' | 'api' | 'display';
}

type SettingsTab = NonNullable<SettingsProps['mode']>;

const TABS: Array<{ id: SettingsTab; label: string; icon: string }> = [
  { id: 'general', label: 'General', icon: '⚙️' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'security', label: 'Security', icon: '🔒' },
  { id: 'api', label: 'Integrations', icon: '🔗' },
  { id: 'display', label: 'Display', icon: '🎨' },
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
];

const TIMEZONE_OPTIONS = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Singapore',
  'Australia/Sydney',
];

const DIGEST_OPTIONS = [
  { value: 'off', label: 'Disabled' },
  { value: 'daily', label: 'Daily summary' },
  { value: 'weekly', label: 'Weekly summary' },
];

const ESCALATION_OPTIONS = [
  { value: 'immediate', label: 'Immediately' },
  { value: 'after-5m', label: 'After 5 minutes' },
  { value: 'after-15m', label: 'After 15 minutes' },
];

const INCIDENT_CHANNELS = [
  { value: 'email', label: 'Email' },
  { value: 'slack', label: 'Slack' },
  { value: 'sms', label: 'SMS' },
  { value: 'pagerduty', label: 'PagerDuty' },
];

const BACKUP_LOCATIONS = [
  { value: 'local', label: 'Local Storage' },
  { value: 's3', label: 'Amazon S3' },
  { value: 'gcs', label: 'Google Cloud Storage' },
  { value: 'azure', label: 'Azure Blob' },
];

const DENSITY_OPTIONS = [
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'compact', label: 'Compact' },
];

const Settings: React.FC<SettingsProps> = ({ mode = 'general' }) => {
  const {
    settings,
    updateSetting,
    saveSettings,
    resetSettings,
    refreshSettings,
    clearValidationError,
    hasUnsavedChanges,
    lastSavedAt,
    saving,
    loading,
    error: loadError,
    validationErrors,
  } = useSettings();

  const [activeTab, setActiveTab] = useState<SettingsTab>(mode);
  const [feedback, setFeedback] = useState<{ message: string; tone: 'success' | 'error' | 'info' } | null>(null);

  const profileInitials = useMemo(() => {
    const parts = settings.profile.name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) {
      return 'U';
    }
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  }, [settings.profile.name]);

  const currentTheme = useMemo(() => {
    return AVAILABLE_THEMES.find((theme) => theme.id === settings.appearance.themeId);
  }, [settings.appearance.themeId]);

  const themeName = currentTheme ? currentTheme.name : 'Custom Theme';
  const lastSavedLabel = useMemo(() => {
    if (!lastSavedAt) {
      return 'Never';
    }
    try {
      return new Date(lastSavedAt).toLocaleString();
    } catch {
      return lastSavedAt;
    }
  }, [lastSavedAt]);

  const statusClass = loading ? 'loading' : saving ? 'pending' : hasUnsavedChanges ? 'pending' : 'synced';
  const statusMessage = useMemo(() => {
    if (loading) {
      return 'Loading settings...';
    }
    if (saving) {
      return 'Saving changes...';
    }
    if (hasUnsavedChanges) {
      return 'Unsaved changes';
    }
    return `Last saved ${lastSavedLabel}`;
  }, [loading, saving, hasUnsavedChanges, lastSavedLabel]);

  const hasValidationErrors = useMemo(() => Object.keys(validationErrors).length > 0, [validationErrors]);
  const fieldError = (path: string): string | null => validationErrors[path] || null;
  const fieldHasError = (path: string): boolean => Boolean(validationErrors[path]);
  const renderFieldError = (path: string) => {
    const message = fieldError(path);
    return message ? <span className="settings-field-error">{message}</span> : null;
  };

  const showMessage = (message: string, tone: 'success' | 'error' | 'info' = 'success') => {
    setFeedback({ message, tone });
    window.setTimeout(() => setFeedback(null), tone === 'error' ? 4200 : 3200);
  };

  const handleSave = async () => {
    const result = await saveSettings();
    if (result.success) {
      showMessage('Settings saved successfully.', 'success');
      return;
    }
    if (result.errors && result.errors.length > 0) {
      showMessage('Fix the highlighted fields and try again.', 'error');
      return;
    }
    showMessage('Unable to save settings. Try again.', 'error');
  };

  const handleReset = () => {
    resetSettings();
    showMessage('Changes reverted.', 'info');
  };

  const toggleChannel = (channel: string) => {
    const channels = settings.notifications.incidentChannels;
    const next = channels.includes(channel)
      ? channels.filter((candidate) => candidate !== channel)
      : [...channels, channel];
    updateSetting('notifications.incidentChannels', next);
  };

  const openThemeSelector = () => {
    window.dispatchEvent(new Event('ui:open-theme-selector'));
  };

  return (
    <div className="page-container">
      <style>{`
        .page-container {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          background-color: var(--color-background);
          color: var(--color-text);
        }

        .page-header {
          margin-bottom: 32px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .page-title {
          font-size: 32px;
          font-weight: 700;
        }

        .page-subtitle {
          font-size: 14px;
          color: var(--color-text-secondary);
        }

        .page-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--color-text-secondary);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--color-success);
        }

        .status-dot.pending {
          background-color: var(--color-warning);
          animation: pulse 2s infinite;
        }

        .status-dot.loading {
          background-color: var(--color-info);
          animation: pulse 1.4s infinite;
        }

        .status-dot.synced {
          background-color: var(--color-success);
        }

        .feedback-stack {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .feedback-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 13px;
          border: 1px solid transparent;
        }

        .feedback-banner.feedback-success {
          background-color: rgba(34, 197, 94, 0.12);
          border-color: rgba(34, 197, 94, 0.4);
          color: var(--color-success);
        }

        .feedback-banner.feedback-info {
          background-color: rgba(59, 130, 246, 0.12);
          border-color: rgba(59, 130, 246, 0.4);
          color: var(--color-info);
        }

        .feedback-banner.feedback-error {
          background-color: rgba(239, 68, 68, 0.12);
          border-color: rgba(239, 68, 68, 0.4);
          color: var(--color-error);
        }

        .feedback-banner.subtle {
          background-color: rgba(239, 68, 68, 0.08);
          border-style: dashed;
        }

        .feedback-action {
          background: transparent;
          border: none;
          color: inherit;
          cursor: pointer;
          font-weight: 600;
          text-decoration: underline;
          padding: 0;
        }

        .feedback-action:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .settings-container {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 24px;
          max-width: 1280px;
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
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 18px;
          font-size: 14px;
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
          border-bottom: 1px solid var(--color-border);
        }

        .settings-nav-item:last-child {
          border-bottom: none;
        }

        .settings-nav-item:hover {
          background-color: var(--color-surface-alt);
          color: var(--color-text);
        }

        .settings-nav-item.active {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(99, 102, 241, 0.12));
          color: var(--color-primary);
          font-weight: 600;
        }

        .settings-content {
          background-color: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .settings-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .settings-section-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--color-text);
          padding-bottom: 12px;
          border-bottom: 2px solid var(--color-border);
        }

        .settings-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .settings-field-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text);
        }

        .settings-field.has-error .settings-field-label {
          color: var(--color-error);
        }

        .settings-field-description {
          font-size: 12px;
          color: var(--color-text-secondary);
        }

        .settings-input,
        .settings-select,
        .settings-textarea {
          width: 100%;
          padding: 10px 12px;
          background-color: var(--color-surface-alt);
          border: 1px solid var(--color-border);
          border-radius: 6px;
          color: var(--color-text);
          font-size: 14px;
          transition: border-color 0.2s ease;
        }

        .settings-input.has-error,
        .settings-select.has-error,
        .settings-textarea.has-error {
          border-color: var(--color-error);
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
        }

        .settings-textarea {
          min-height: 88px;
          resize: vertical;
        }

        .settings-input:focus,
        .settings-select:focus,
        .settings-textarea:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }

        .settings-grid {
          display: grid;
          gap: 20px;
        }

        .settings-grid.two-column {
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px 24px;
        }

        .toggle-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .toggle-switch {
          width: 48px;
          height: 24px;
          background-color: var(--color-surface-alt);
          border-radius: 12px;
          border: 1px solid var(--color-border);
          position: relative;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .toggle-switch.on {
          background-color: var(--color-success);
          border-color: var(--color-success);
        }

        .toggle-switch-circle {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: #ffffff;
          position: absolute;
          top: 2px;
          left: 2px;
          transition: transform 0.2s ease;
        }

        .toggle-switch.on .toggle-switch-circle {
          transform: translateX(24px);
        }

        .checkbox-group {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .checkbox-group.has-error {
          border: 1px dashed rgba(239, 68, 68, 0.4);
          border-radius: 8px;
          padding: 12px;
        }

        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid var(--color-border);
          background-color: var(--color-surface-alt);
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 12px;
        }

        .settings-field-error {
          font-size: 12px;
          color: var(--color-error);
        }

        .checkbox-item.active {
          border-color: var(--color-primary);
          color: var(--color-primary);
          background-color: rgba(99, 102, 241, 0.12);
        }

        .checkbox-item input {
          accent-color: var(--color-primary);
        }

        .profile-card {
          display: grid;
          grid-template-columns: 80px 1fr;
          gap: 20px;
          padding: 18px;
          border-radius: 10px;
          background-color: var(--color-surface-alt);
          border: 1px solid var(--color-border);
          align-items: center;
        }

        .profile-avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 700;
          color: #ffffff;
        }

        .profile-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }

        .density-options {
          display: flex;
          gap: 12px;
        }

        .density-chip {
          padding: 8px 14px;
          border-radius: 999px;
          border: 1px solid var(--color-border);
          font-size: 13px;
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .density-chip.active {
          border-color: var(--color-primary);
          color: var(--color-primary);
          background-color: rgba(99, 102, 241, 0.12);
          font-weight: 600;
        }

        .theme-summary {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          background-color: var(--color-surface-alt);
        }

        .theme-swatch {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          overflow: hidden;
        }

        .theme-swatch span {
          flex: 1;
        }

        .theme-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 12px;
          color: var(--color-text-secondary);
        }

        .theme-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text);
        }

        .button-group {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .btn-save {
          background-color: var(--color-primary);
          color: #ffffff;
          border: none;
          padding: 12px 28px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-save:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .btn-save:not(:disabled):hover {
          background-color: var(--color-secondary);
        }

        .btn-cancel {
          background-color: var(--color-surface-alt);
          color: var(--color-text);
          border: 1px solid var(--color-border);
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-cancel:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .btn-cancel:not(:disabled):hover {
          background-color: var(--color-border);
        }

        .color-input {
          width: 48px;
          height: 32px;
          border: 1px solid var(--color-border);
          border-radius: 6px;
          background: none;
          padding: 0;
          cursor: pointer;
        }

        .helper-note {
          font-size: 12px;
          color: var(--color-text-secondary);
          background-color: rgba(99, 102, 241, 0.12);
          border-left: 3px solid var(--color-primary);
          border-radius: 6px;
          padding: 8px 12px;
        }

        @media (max-width: 960px) {
          .settings-container {
            grid-template-columns: 1fr;
          }

          .settings-sidebar {
            display: flex;
            overflow-x: auto;
          }

          .settings-nav {
            flex-direction: row;
          }

          .settings-nav-item {
            flex: 1;
            justify-content: center;
            border-bottom: none;
            border-right: 1px solid var(--color-border);
          }

          .settings-nav-item:last-child {
            border-right: none;
          }
        }

        @media (max-width: 768px) {
          .page-container {
            padding: 16px;
          }

          .page-title {
            font-size: 26px;
          }

          .profile-card {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .profile-avatar {
            margin: 0 auto;
          }

          .profile-details {
            grid-template-columns: 1fr;
          }

          .button-group {
            flex-direction: column;
            align-items: stretch;
          }

          .btn-save,
          .btn-cancel {
            width: 100%;
          }
        }
      `}</style>

      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <div className="page-subtitle">Manage your preferences, notifications, security, and integrations</div>
        <div className="page-meta">
          <span className={`status-dot ${statusClass}`}></span>
          <span>{statusMessage}</span>
        </div>
      </div>

      {(feedback || loadError || hasValidationErrors) && (
        <div className="feedback-stack">
          {feedback && (
            <div className={`feedback-banner feedback-${feedback.tone}`}>
              {feedback.message}
            </div>
          )}
          {loadError && (
            <div className="feedback-banner feedback-error">
              <span>{loadError}</span>
              <button className="feedback-action" onClick={refreshSettings}>
                Retry
              </button>
            </div>
          )}
          {!feedback && hasValidationErrors && (
            <div className="feedback-banner feedback-error subtle">Fix the highlighted fields below.</div>
          )}
        </div>
      )}

      <div className="settings-container">
        <div className="settings-sidebar">
          <div className="settings-nav">
            {TABS.map((tab) => (
              <div
                key={tab.id}
                className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="settings-content">
          {activeTab === 'general' && (
            <>
              <div className="settings-section">
                <h2 className="settings-section-title">Profile</h2>
                <div className="profile-card">
                  <div className="profile-avatar" style={{ backgroundColor: settings.profile.avatarColor }}>
                    {profileInitials}
                  </div>
                  <div className="profile-details">
                    <div className="settings-field">
                      <span className="settings-field-label">Full Name</span>
                      <input
                        className="settings-input"
                        value={settings.profile.name}
                        onChange={(event) => updateSetting('profile.name', event.target.value)}
                      />
                    </div>
                    <div className={`settings-field ${fieldHasError('profile.email') ? 'has-error' : ''}`}>
                      <span className="settings-field-label">Email Address</span>
                      <input
                        className={`settings-input ${fieldHasError('profile.email') ? 'has-error' : ''}`}
                        type="email"
                        value={settings.profile.email}
                        onChange={(event) => updateSetting('profile.email', event.target.value)}
                      />
                      {renderFieldError('profile.email')}
                    </div>
                    <div className="settings-field">
                      <span className="settings-field-label">Role</span>
                      <input
                        className="settings-input"
                        value={settings.profile.role}
                        onChange={(event) => updateSetting('profile.role', event.target.value)}
                      />
                    </div>
                    <div className="settings-field">
                      <span className="settings-field-label">Organization</span>
                      <input
                        className="settings-input"
                        value={settings.profile.organization}
                        onChange={(event) => updateSetting('profile.organization', event.target.value)}
                      />
                    </div>
                    <div className="settings-field">
                      <span className="settings-field-label">Phone Number</span>
                      <input
                        className="settings-input"
                        value={settings.profile.phone}
                        onChange={(event) => updateSetting('profile.phone', event.target.value)}
                      />
                    </div>
                    <div className="settings-field">
                      <span className="settings-field-label">Avatar Color</span>
                      <input
                        className="color-input"
                        type="color"
                        value={settings.profile.avatarColor}
                        onChange={(event) => updateSetting('profile.avatarColor', event.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h2 className="settings-section-title">Localization</h2>
                <div className="settings-grid two-column">
                  <div className="settings-field">
                    <span className="settings-field-label">Language</span>
                    <select
                      className="settings-select"
                      value={settings.general.language}
                      onChange={(event) => updateSetting('general.language', event.target.value)}
                    >
                      {LANGUAGE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="settings-field">
                    <span className="settings-field-label">Timezone</span>
                    <select
                      className="settings-select"
                      value={settings.general.timezone}
                      onChange={(event) => updateSetting('general.timezone', event.target.value)}
                    >
                      {TIMEZONE_OPTIONS.map((zone) => (
                        <option key={zone} value={zone}>
                          {zone}
                        </option>
                      ))}
                    </select>
                    <div className="settings-field-description">
                      Used for scheduling maintenance windows and timestamp displays.
                    </div>
                  </div>
                  <div className="settings-field">
                    <span className="settings-field-label">Date Format</span>
                    <input
                      className="settings-input"
                      value={settings.general.dateFormat}
                      onChange={(event) => updateSetting('general.dateFormat', event.target.value)}
                    />
                    <div className="settings-field-description">
                      Supported tokens follow Day.js formatting (e.g. YYYY-MM-DD).
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h2 className="settings-section-title">Operations</h2>
                <div className="settings-grid two-column">
                  <div className="settings-field">
                    <span className="settings-field-label">Maintenance Window</span>
                    <input
                      className="settings-input"
                      value={settings.general.maintenanceWindow}
                      onChange={(event) => updateSetting('general.maintenanceWindow', event.target.value)}
                    />
                    <div className="settings-field-description">
                      Inform your team when scheduled maintenance typically occurs.
                    </div>
                  </div>
                  <div className="settings-field">
                    <span className="settings-field-label">Automatic Updates</span>
                    <div className="toggle-row">
                      <div
                        className={`toggle-switch ${settings.general.autoUpdates ? 'on' : ''}`}
                        onClick={() => updateSetting('general.autoUpdates', !settings.general.autoUpdates)}
                      >
                        <div className="toggle-switch-circle"></div>
                      </div>
                      <span>{settings.general.autoUpdates ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="settings-field-description">
                      Automatically deploy certified panel updates during the maintenance window.
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h2 className="settings-section-title">Backups</h2>
                <div className="settings-grid two-column">
                  <div className="settings-field">
                    <span className="settings-field-label">Automated Backups</span>
                    <div className="toggle-row">
                      <div
                        className={`toggle-switch ${settings.backups.enabled ? 'on' : ''}`}
                        onClick={() => updateSetting('backups.enabled', !settings.backups.enabled)}
                      >
                        <div className="toggle-switch-circle"></div>
                      </div>
                      <span>{settings.backups.enabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="settings-field-description">
                      Run scheduled backups for all managed resources.
                    </div>
                  </div>
                  <div className="settings-field">
                    <span className="settings-field-label">Backup Time</span>
                    <input
                      className="settings-input"
                      type="time"
                      value={settings.backups.schedule}
                      onChange={(event) => updateSetting('backups.schedule', event.target.value)}
                    />
                  </div>
                  <div className="settings-field">
                    <span className="settings-field-label">Retention (days)</span>
                    <input
                      className="settings-input"
                      type="number"
                      min={1}
                      value={settings.backups.retentionDays}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        updateSetting('backups.retentionDays', Number.isNaN(value) ? 0 : value);
                      }}
                    />
                  </div>
                  <div className="settings-field">
                    <span className="settings-field-label">Storage Location</span>
                    <select
                      className="settings-select"
                      value={settings.backups.location}
                      onChange={(event) => updateSetting('backups.location', event.target.value)}
                    >
                      {BACKUP_LOCATIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="settings-field">
                    <span className="settings-field-label">Integrity Checks</span>
                    <div className="toggle-row">
                      <div
                        className={`toggle-switch ${settings.backups.verifyIntegrity ? 'on' : ''}`}
                        onClick={() => updateSetting('backups.verifyIntegrity', !settings.backups.verifyIntegrity)}
                      >
                        <div className="toggle-switch-circle"></div>
                      </div>
                      <span>{settings.backups.verifyIntegrity ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="settings-field-description">
                      Verify backup archives immediately after creation.
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'notifications' && (
            <>
              <div className="settings-section">
                <h2 className="settings-section-title">Notification Channels</h2>
                <div className="settings-grid two-column">
                  <div className="settings-field">
                    <span className="settings-field-label">Email Alerts</span>
                    <div className="toggle-row">
                      <div
                        className={`toggle-switch ${settings.notifications.email ? 'on' : ''}`}
                        onClick={() => updateSetting('notifications.email', !settings.notifications.email)}
                      >
                        <div className="toggle-switch-circle"></div>
                      </div>
                      <span>{settings.notifications.email ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="settings-field-description">
                      Send critical incident emails to {settings.profile.email}.
                    </div>
                  </div>
                  <div className="settings-field">
                    <span className="settings-field-label">Push Notifications</span>
                    <div className="toggle-row">
                      <div
                        className={`toggle-switch ${settings.notifications.push ? 'on' : ''}`}
                        onClick={() => updateSetting('notifications.push', !settings.notifications.push)}
                      >
                        <div className="toggle-switch-circle"></div>
                      </div>
                      <span>{settings.notifications.push ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                  <div className="settings-field">
                    <span className="settings-field-label">SMS Alerts</span>
                    <div className="toggle-row">
                      <div
                        className={`toggle-switch ${settings.notifications.sms ? 'on' : ''}`}
                        onClick={() => updateSetting('notifications.sms', !settings.notifications.sms)}
                      >
                        <div className="toggle-switch-circle"></div>
                      </div>
                      <span>{settings.notifications.sms ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="settings-field-description">
                      Use the configured phone number for urgent SMS incidents.
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h2 className="settings-section-title">Delivery Preferences</h2>
                <div className="settings-grid two-column">
                  <div className="settings-field">
                    <span className="settings-field-label">Digest Summary</span>
                    <select
                      className="settings-select"
                      value={settings.notifications.digest}
                      onChange={(event) => updateSetting('notifications.digest', event.target.value)}
                    >
                      {DIGEST_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="settings-field-description">
                      Summary reports delivered outside of real-time alerts.
                    </div>
                  </div>
                  <div className="settings-field">
                    <span className="settings-field-label">Escalation Policy</span>
                    <select
                      className="settings-select"
                      value={settings.notifications.escalationPolicy}
                      onChange={(event) => updateSetting('notifications.escalationPolicy', event.target.value)}
                    >
                      {ESCALATION_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={`settings-field ${fieldHasError('notifications.incidentChannels') ? 'has-error' : ''}`}>
                  <span className="settings-field-label">Incident Channels</span>
                  <div className={`checkbox-group ${fieldHasError('notifications.incidentChannels') ? 'has-error' : ''}`}>
                    {INCIDENT_CHANNELS.map((channel) => {
                      const enabled = settings.notifications.incidentChannels.includes(channel.value);
                      return (
                        <label
                          key={channel.value}
                          className={`checkbox-item ${enabled ? 'active' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={() => toggleChannel(channel.value)}
                          />
                          <span>{channel.label}</span>
                        </label>
                      );
                    })}
                  </div>
                  {renderFieldError('notifications.incidentChannels')}
                </div>
              </div>
            </>
          )}

          {activeTab === 'security' && (
            <>
              <div className="settings-section">
                <h2 className="settings-section-title">Account Security</h2>
                <div className="settings-grid two-column">
                  <div className="settings-field">
                    <span className="settings-field-label">Two-Factor Authentication</span>
                    <div className="toggle-row">
                      <div
                        className={`toggle-switch ${settings.security.twoFactorEnabled ? 'on' : ''}`}
                        onClick={() => updateSetting('security.twoFactorEnabled', !settings.security.twoFactorEnabled)}
                      >
                        <div className="toggle-switch-circle"></div>
                      </div>
                      <span>{settings.security.twoFactorEnabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="settings-field-description">
                      Require an authenticator code for every sign-in.
                    </div>
                  </div>
                  <div className="settings-field">
                    <span className="settings-field-label">Login Alerts</span>
                    <div className="toggle-row">
                      <div
                        className={`toggle-switch ${settings.security.loginAlerts ? 'on' : ''}`}
                        onClick={() => updateSetting('security.loginAlerts', !settings.security.loginAlerts)}
                      >
                        <div className="toggle-switch-circle"></div>
                      </div>
                      <span>{settings.security.loginAlerts ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="settings-field-description">
                      Notify when logins occur from unrecognized locations.
                    </div>
                  </div>
                  <div className="settings-field">
                    <span className="settings-field-label">Idle Timeout (minutes)</span>
                    <input
                      className="settings-input"
                      type="number"
                      min={5}
                      value={settings.security.idleTimeout}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        updateSetting('security.idleTimeout', Number.isNaN(value) ? 0 : value);
                      }}
                    />
                  </div>
                  <div className="settings-field">
                    <span className="settings-field-label">IP Restrictions</span>
                    <div className="toggle-row">
                      <div
                        className={`toggle-switch ${settings.security.ipRestrictions ? 'on' : ''}`}
                        onClick={() => updateSetting('security.ipRestrictions', !settings.security.ipRestrictions)}
                      >
                        <div className="toggle-switch-circle"></div>
                      </div>
                      <span>{settings.security.ipRestrictions ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="settings-field-description">
                      Limit dashboard access to the CIDR ranges below.
                    </div>
                  </div>
                  <div className="settings-field">
                    <span className="settings-field-label">Allowed IP Ranges</span>
                    <textarea
                      className="settings-textarea"
                      placeholder="e.g. 10.0.0.0/24, 192.168.1.0/26"
                      value={settings.security.allowedIPs}
                      onChange={(event) => updateSetting('security.allowedIPs', event.target.value)}
                    />
                  </div>
                  <div className="settings-field">
                    <span className="settings-field-label">Concurrent API Sessions</span>
                    <input
                      className="settings-input"
                      type="number"
                      min={1}
                      value={settings.security.apiSessions}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        updateSetting('security.apiSessions', Number.isNaN(value) ? 0 : value);
                      }}
                    />
                    <div className="settings-field-description">
                      Maximum active API tokens allowed simultaneously.
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'api' && (
            <>
              <div className="settings-section">
                <h2 className="settings-section-title">Integrations</h2>
                <div className="settings-grid two-column">
                  <div className={`settings-field ${fieldHasError('integrations.slackWebhook') ? 'has-error' : ''}`}>
                    <span className="settings-field-label">Slack</span>
                    <div className="toggle-row">
                      <div
                        className={`toggle-switch ${settings.integrations.slackEnabled ? 'on' : ''}`}
                        onClick={() => {
                          const next = !settings.integrations.slackEnabled;
                          updateSetting('integrations.slackEnabled', next);
                          if (!next) {
                            clearValidationError('integrations.slackWebhook');
                          }
                        }}
                      >
                        <div className="toggle-switch-circle"></div>
                      </div>
                      <span>{settings.integrations.slackEnabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <input
                      className={`settings-input ${fieldHasError('integrations.slackWebhook') ? 'has-error' : ''}`}
                      placeholder="https://hooks.slack.com/services/..."
                      value={settings.integrations.slackWebhook}
                      onChange={(event) => updateSetting('integrations.slackWebhook', event.target.value)}
                      disabled={!settings.integrations.slackEnabled}
                    />
                    {renderFieldError('integrations.slackWebhook')}
                  </div>

                  <div className={`settings-field ${fieldHasError('integrations.discordWebhook') ? 'has-error' : ''}`}>
                    <span className="settings-field-label">Discord</span>
                    <div className="toggle-row">
                      <div
                        className={`toggle-switch ${settings.integrations.discordEnabled ? 'on' : ''}`}
                        onClick={() => {
                          const next = !settings.integrations.discordEnabled;
                          updateSetting('integrations.discordEnabled', next);
                          if (!next) {
                            clearValidationError('integrations.discordWebhook');
                          }
                        }}
                      >
                        <div className="toggle-switch-circle"></div>
                      </div>
                      <span>{settings.integrations.discordEnabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <input
                      className={`settings-input ${fieldHasError('integrations.discordWebhook') ? 'has-error' : ''}`}
                      placeholder="https://discord.com/api/webhooks/..."
                      value={settings.integrations.discordWebhook}
                      onChange={(event) => updateSetting('integrations.discordWebhook', event.target.value)}
                      disabled={!settings.integrations.discordEnabled}
                    />
                    {renderFieldError('integrations.discordWebhook')}
                  </div>

                  <div className={`settings-field ${fieldHasError('integrations.pagerDutyKey') ? 'has-error' : ''}`}>
                    <span className="settings-field-label">PagerDuty</span>
                    <div className="toggle-row">
                      <div
                        className={`toggle-switch ${settings.integrations.pagerDutyEnabled ? 'on' : ''}`}
                        onClick={() => {
                          const next = !settings.integrations.pagerDutyEnabled;
                          updateSetting('integrations.pagerDutyEnabled', next);
                          if (!next) {
                            clearValidationError('integrations.pagerDutyKey');
                          }
                        }}
                      >
                        <div className="toggle-switch-circle"></div>
                      </div>
                      <span>{settings.integrations.pagerDutyEnabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <input
                      className={`settings-input ${fieldHasError('integrations.pagerDutyKey') ? 'has-error' : ''}`}
                      placeholder="PagerDuty integration key"
                      value={settings.integrations.pagerDutyKey}
                      onChange={(event) => updateSetting('integrations.pagerDutyKey', event.target.value)}
                      disabled={!settings.integrations.pagerDutyEnabled}
                    />
                    {renderFieldError('integrations.pagerDutyKey')}
                    <div className="settings-field-description">
                      Used for paging on-call responders when incidents escalate.
                    </div>
                  </div>
                </div>
                <div className="helper-note">
                  Webhook details are encrypted at rest. Rotate keys regularly to maintain compliance.
                </div>
              </div>
            </>
          )}

          {activeTab === 'display' && (
            <>
              <div className="settings-section">
                <h2 className="settings-section-title">Theme & Appearance</h2>
                <div className="theme-summary">
                  <div className="theme-swatch">
                    <span style={{ backgroundColor: currentTheme?.colors.primary || settings.profile.avatarColor }}></span>
                    <span style={{ backgroundColor: currentTheme?.colors.secondary || 'var(--color-secondary)' }}></span>
                    <span style={{ backgroundColor: currentTheme?.colors.accent || 'var(--color-accent)' }}></span>
                  </div>
                  <div className="theme-info">
                    <span className="theme-name">{themeName}</span>
                    <span>{currentTheme?.description || 'Custom color palette applied'}</span>
                    <span>Mode: {settings.appearance.theme.toUpperCase()}</span>
                  </div>
                </div>
                <div className="settings-field">
                  <button className="btn-cancel" onClick={openThemeSelector}>
                    Open Theme Selector
                  </button>
                </div>
              </div>

              <div className="settings-section">
                <h2 className="settings-section-title">Layout Density</h2>
                <div className="density-options">
                  {DENSITY_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      className={`density-chip ${settings.appearance.density === option.value ? 'active' : ''}`}
                      onClick={() => updateSetting('appearance.density', option.value)}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="settings-section">
                <h2 className="settings-section-title">Interaction</h2>
                <div className="settings-grid two-column">
                  <div className="settings-field">
                    <span className="settings-field-label">Animations</span>
                    <div className="toggle-row">
                      <div
                        className={`toggle-switch ${settings.appearance.animations ? 'on' : ''}`}
                        onClick={() => updateSetting('appearance.animations', !settings.appearance.animations)}
                      >
                        <div className="toggle-switch-circle"></div>
                      </div>
                      <span>{settings.appearance.animations ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="settings-field-description">
                      Disable to reduce motion for accessibility or remote sessions.
                    </div>
                  </div>
                  <div className="settings-field">
                    <span className="settings-field-label">Tooltips</span>
                    <div className="toggle-row">
                      <div
                        className={`toggle-switch ${settings.appearance.showTooltips ? 'on' : ''}`}
                        onClick={() => updateSetting('appearance.showTooltips', !settings.appearance.showTooltips)}
                      >
                        <div className="toggle-switch-circle"></div>
                      </div>
                      <span>{settings.appearance.showTooltips ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="settings-field-description">
                      Toggle contextual help across dashboard components.
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="button-group">
            <button className="btn-cancel" onClick={handleReset} disabled={loading || saving || !hasUnsavedChanges}>
              Reset
            </button>
            <button className="btn-save" onClick={handleSave} disabled={saving || loading || !hasUnsavedChanges}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
