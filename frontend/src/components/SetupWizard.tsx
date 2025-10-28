/**
 * ArtiPanel Setup Wizard
 * 
 * Easy step-by-step setup for first-time users
 */

import React, { useState } from 'react';
import { AVAILABLE_THEMES, applyTheme } from '../config/themes';

interface SetupWizardProps {
  onComplete: () => void;
}

type SetupStep = 'welcome' | 'theme' | 'database' | 'node' | 'gaming' | 'complete';

const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<SetupStep>('welcome');
  const [formData, setFormData] = useState({
    adminName: 'Administrator',
    adminEmail: 'admin@artipanel.local',
    selectedTheme: 'pterodactyl-dark',
    databaseHost: 'localhost',
    databasePort: '5432',
    databaseName: 'artipanel',
    databaseUser: 'artipanel',
    nodeType: 'local',
    nodeHost: 'localhost',
  });

  const steps: { id: SetupStep; title: string; description: string }[] = [
    { id: 'welcome', title: 'Welcome to ArtiPanel', description: 'Let\'s set up your server panel' },
    { id: 'theme', title: 'Choose Your Theme', description: 'Select a color scheme you like' },
    { id: 'database', title: 'Database Configuration', description: 'Connect to your database' },
    { id: 'node', title: 'Add First Node', description: 'Set up your first server node' },
    { id: 'gaming', title: 'Gaming Settings', description: 'Configure game server support' },
    { id: 'complete', title: 'Setup Complete!', description: 'You\'re all set to go' },
  ];

  const stepIndex = steps.findIndex(s => s.id === currentStep);
  const progress = ((stepIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    const nextStepId = steps[stepIndex + 1]?.id;
    if (nextStepId) {
      setCurrentStep(nextStepId);
    }
  };

  const handlePrev = () => {
    const prevStepId = steps[stepIndex - 1]?.id;
    if (prevStepId) {
      setCurrentStep(prevStepId);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleThemeSelect = (themeId: string) => {
    handleInputChange('selectedTheme', themeId);
    const theme = AVAILABLE_THEMES.find(t => t.id === themeId);
    if (theme) {
      applyTheme(theme);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('artipanel-setup-complete', 'true');
    localStorage.setItem('artipanel-config', JSON.stringify(formData));
    onComplete();
  };

  return (
    <div className="setup-wizard">
      <style jsx>{`
        .setup-wizard {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3000;
          padding: 20px;
        }

        .wizard-container {
          background-color: var(--color-surface);
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          width: 100%;
          max-width: 600px;
          overflow: hidden;
          animation: slideUp 0.4s ease;
        }

        @keyframes slideUp {
          from {
            transform: translateY(40px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .wizard-header {
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          color: white;
          padding: 32px 24px;
          text-align: center;
        }

        .wizard-logo {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .wizard-title {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .wizard-subtitle {
          font-size: 14px;
          opacity: 0.9;
        }

        .wizard-progress {
          height: 3px;
          background-color: rgba(255, 255, 255, 0.2);
          width: 100%;
        }

        .wizard-progress-bar {
          height: 100%;
          background-color: rgba(255, 255, 255, 0.8);
          transition: width 0.3s ease;
        }

        .wizard-content {
          padding: 32px 24px;
          min-height: 300px;
          max-height: 60vh;
          overflow-y: auto;
        }

        .wizard-section {
          display: none;
        }

        .wizard-section.active {
          display: block;
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

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--color-text);
          margin-bottom: 12px;
        }

        .section-description {
          font-size: 13px;
          color: var(--color-text-secondary);
          margin-bottom: 24px;
          line-height: 1.6;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: var(--color-text);
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-input,
        .form-select {
          width: 100%;
          padding: 10px 12px;
          background-color: var(--color-surface-alt);
          border: 1px solid var(--color-border);
          border-radius: 6px;
          color: var(--color-text);
          font-size: 13px;
          font-family: inherit;
        }

        .form-input:focus,
        .form-select:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
        }

        .form-input::placeholder {
          color: var(--color-text-secondary);
        }

        .theme-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .theme-option {
          border: 2px solid var(--color-border);
          border-radius: 8px;
          padding: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }

        .theme-option.selected {
          border-color: var(--color-primary);
          background-color: rgba(99, 102, 241, 0.1);
        }

        .theme-option:hover {
          border-color: var(--color-primary);
        }

        .theme-preview {
          display: flex;
          gap: 4px;
          margin-bottom: 8px;
          height: 24px;
        }

        .theme-preview-swatch {
          flex: 1;
          border-radius: 4px;
        }

        .theme-name {
          font-size: 12px;
          font-weight: 500;
          color: var(--color-text);
        }

        .checklist {
          background-color: var(--color-surface-alt);
          border-radius: 8px;
          padding: 16px;
        }

        .checklist-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
          font-size: 13px;
          color: var(--color-text);
        }

        .checklist-item::before {
          content: '✓';
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          background-color: var(--color-success);
          color: white;
          border-radius: 50%;
          font-size: 12px;
          font-weight: bold;
          flex-shrink: 0;
        }

        .wizard-footer {
          padding: 24px;
          background-color: var(--color-surface-alt);
          border-top: 1px solid var(--color-border);
          display: flex;
          gap: 12px;
          justify-content: space-between;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .btn-secondary {
          background-color: transparent;
          color: var(--color-text-secondary);
          border: 1px solid var(--color-border);
        }

        .btn-secondary:hover {
          background-color: var(--color-surface);
          color: var(--color-text);
        }

        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          color: white;
          flex: 1;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .welcome-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .welcome-text {
          font-size: 14px;
          color: var(--color-text-secondary);
          line-height: 1.8;
        }

        @media (max-width: 600px) {
          .wizard-container {
            max-width: 100%;
            border-radius: 0;
          }

          .theme-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="wizard-container">
        {/* Progress Bar */}
        <div className="wizard-progress">
          <div className="wizard-progress-bar" style={{ width: `${progress}%` }}></div>
        </div>

        {/* Header */}
        <div className="wizard-header">
          <div className="wizard-logo">⚙️</div>
          <div className="wizard-title">{steps[stepIndex].title}</div>
          <div className="wizard-subtitle">{steps[stepIndex].description}</div>
        </div>

        {/* Content */}
        <div className="wizard-content">
          {/* Welcome Step */}
          <div className={`wizard-section ${currentStep === 'welcome' ? 'active' : ''}`}>
            <div className="welcome-icon">👋</div>
            <div className="section-title">Welcome to ArtiPanel</div>
            <div className="welcome-text">
              <p>ArtiPanel is a modern, open-source server control panel built for:</p>
              <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
                <li>🖥️ Server management across multiple nodes</li>
                <li>🎮 Minecraft and game server hosting</li>
                <li>💾 NAS and storage management</li>
                <li>📡 Real-time monitoring and alerts</li>
                <li>🌐 Web-based remote access (VNC/RDP/SSH)</li>
              </ul>
              <p style={{ marginTop: '12px' }}>This setup wizard will guide you through the configuration in just a few minutes.</p>
            </div>
          </div>

          {/* Theme Step */}
          <div className={`wizard-section ${currentStep === 'theme' ? 'active' : ''}`}>
            <div className="section-title">Choose Your Theme</div>
            <div className="section-description">Select a color scheme you prefer. You can always change this later.</div>
            <div className="theme-grid">
              {AVAILABLE_THEMES.map(theme => (
                <div
                  key={theme.id}
                  className={`theme-option ${formData.selectedTheme === theme.id ? 'selected' : ''}`}
                  onClick={() => handleThemeSelect(theme.id)}
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
                  </div>
                  <div className="theme-name">{theme.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Database Step */}
          <div className={`wizard-section ${currentStep === 'database' ? 'active' : ''}`}>
            <div className="section-title">Database Configuration</div>
            <div className="section-description">Connect to your PostgreSQL database. These settings will be saved securely.</div>
            <div className="form-group">
              <label className="form-label">Database Host</label>
              <input
                type="text"
                className="form-input"
                value={formData.databaseHost}
                onChange={(e) => handleInputChange('databaseHost', e.target.value)}
                placeholder="localhost"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Database Port</label>
              <input
                type="text"
                className="form-input"
                value={formData.databasePort}
                onChange={(e) => handleInputChange('databasePort', e.target.value)}
                placeholder="5432"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Database Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.databaseName}
                onChange={(e) => handleInputChange('databaseName', e.target.value)}
                placeholder="artipanel"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Database User</label>
              <input
                type="text"
                className="form-input"
                value={formData.databaseUser}
                onChange={(e) => handleInputChange('databaseUser', e.target.value)}
                placeholder="artipanel"
              />
            </div>
          </div>

          {/* Node Step */}
          <div className={`wizard-section ${currentStep === 'node' ? 'active' : ''}`}>
            <div className="section-title">Add Your First Node</div>
            <div className="section-description">Nodes are servers where your game servers will run. You can add more later.</div>
            <div className="form-group">
              <label className="form-label">Node Type</label>
              <select
                className="form-select"
                value={formData.nodeType}
                onChange={(e) => handleInputChange('nodeType', e.target.value)}
              >
                <option value="local">Local (This Server)</option>
                <option value="remote">Remote Server</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Node Host</label>
              <input
                type="text"
                className="form-input"
                value={formData.nodeHost}
                onChange={(e) => handleInputChange('nodeHost', e.target.value)}
                placeholder="localhost or IP address"
              />
            </div>
          </div>

          {/* Gaming Step */}
          <div className={`wizard-section ${currentStep === 'gaming' ? 'active' : ''}`}>
            <div className="section-title">Gaming Server Support</div>
            <div className="section-description">ArtiPanel includes built-in support for game servers.</div>
            <div className="checklist">
              <div className="checklist-item">Minecraft Java Edition</div>
              <div className="checklist-item">Minecraft Bedrock Edition</div>
              <div className="checklist-item">Multi-game framework</div>
              <div className="checklist-item">Real-time server console</div>
              <div className="checklist-item">Automatic backups</div>
              <div className="checklist-item">Player management</div>
            </div>
          </div>

          {/* Complete Step */}
          <div className={`wizard-section ${currentStep === 'complete' ? 'active' : ''}`}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>✨</div>
              <div className="section-title">You're All Set!</div>
              <div className="section-description">
                <p>Your ArtiPanel is now configured and ready to use.</p>
                <p style={{ marginTop: '12px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  Keyboard shortcuts: Press Shift+? to view all available shortcuts
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="wizard-footer">
          <button
            className="btn btn-secondary"
            onClick={handlePrev}
            disabled={currentStep === 'welcome'}
          >
            ← Previous
          </button>
          {currentStep !== 'complete' && (
            <button className="btn btn-primary" onClick={handleNext}>
              Next →
            </button>
          )}
          {currentStep === 'complete' && (
            <button className="btn btn-primary" onClick={handleComplete}>
              Go to Dashboard →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;
