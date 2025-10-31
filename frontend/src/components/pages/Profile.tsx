/**
 * User Profile Page
 * 
 * Displays and manages user profile information
 */

import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { settings, updateSetting, saveSettings } = useSettings();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const profile = settings.profile;
  
  const profileInitials = useMemo(() => {
    const parts = profile.name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  }, [profile.name]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await saveSettings();
      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to save profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving profile' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        .profile-page {
          padding: 30px;
          max-width: 800px;
          margin: 0 auto;
        }

        .profile-header {
          display: flex;
          gap: 20px;
          align-items: flex-start;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--color-border);
        }

        .profile-avatar-large {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 600;
          color: white;
          flex-shrink: 0;
        }

        .profile-info h1 {
          margin: 0 0 4px 0;
          font-size: 24px;
          font-weight: 600;
          color: var(--color-text);
        }

        .profile-role {
          font-size: 13px;
          color: var(--color-text-secondary);
          text-transform: capitalize;
        }

        .profile-section {
          margin-bottom: 30px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 20px;
        }

        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--color-text);
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .section-title::before {
          content: '';
          width: 3px;
          height: 16px;
          background: var(--color-primary);
          border-radius: 2px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: var(--color-text);
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-input {
          width: 100%;
          padding: 10px 12px;
          background: var(--color-surface-alt);
          border: 1px solid var(--color-border);
          border-radius: 6px;
          font-size: 13px;
          color: var(--color-text);
          font-family: inherit;
          transition: all 0.2s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.1);
          background: var(--color-surface);
        }

        .form-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background: var(--color-surface-alt);
        }

        .form-hint {
          font-size: 12px;
          color: var(--color-text-secondary);
          margin-top: 4px;
        }

        .button-group {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .btn {
          padding: 10px 20px;
          border-radius: 6px;
          border: none;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-primary {
          background: var(--color-primary);
          color: white;
        }

        .btn-primary:hover {
          background: var(--color-primary-hover);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-secondary {
          background: var(--color-surface-alt);
          color: var(--color-text);
          border: 1px solid var(--color-border);
        }

        .btn-secondary:hover {
          background: var(--color-surface);
        }

        .message {
          padding: 12px 16px;
          border-radius: 6px;
          font-size: 13px;
          margin-bottom: 20px;
          animation: slideDown 0.3s ease;
        }

        .message-success {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.2);
        }

        .message-error {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .profile-page {
            padding: 20px;
          }

          .profile-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .button-group {
            flex-direction: column;
          }

          .btn {
            justify-content: center;
          }
        }
      `}</style>

      <div className="profile-page">
        {message && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Profile Header */}
        <div className="profile-header">
          <div 
            className="profile-avatar-large" 
            style={{ backgroundColor: profile.avatarColor }}
          >
            {profileInitials}
          </div>
          <div className="profile-info">
            <h1>{profile.name}</h1>
            <div className="profile-role">{profile.role}</div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="profile-section">
          <div className="section-title">Profile Information</div>
          
          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              type="text"
              className="form-input"
              value={user?.username || ''}
              disabled
            />
            <div className="form-hint">Your username cannot be changed</div>
          </div>

          <div className="form-group">
            <label className="form-label">Display Name</label>
            <input 
              type="text"
              className="form-input"
              value={profile.name}
              onChange={(e) => updateSetting('profile.name', e.target.value)}
              placeholder="Enter your display name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email"
              className="form-input"
              value={profile.email}
              onChange={(e) => updateSetting('profile.email', e.target.value)}
              placeholder="Enter your email address"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <input 
              type="text"
              className="form-input"
              value={profile.role}
              disabled
            />
            <div className="form-hint">Your role is managed by administrators</div>
          </div>

          <div className="button-group">
            <button 
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? '💾 Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </div>

        {/* Additional Information */}
        <div className="profile-section">
          <div className="section-title">Additional Information</div>
          
          <div className="form-group">
            <label className="form-label">Organization</label>
            <input 
              type="text"
              className="form-input"
              value={profile.organization}
              onChange={(e) => updateSetting('profile.organization', e.target.value)}
              placeholder="Organization name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input 
              type="tel"
              className="form-input"
              value={profile.phone}
              onChange={(e) => updateSetting('profile.phone', e.target.value)}
              placeholder="Phone number"
            />
          </div>

          <div className="button-group">
            <button 
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? '💾 Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </div>

        {/* Account Info */}
        <div className="profile-section">
          <div className="section-title">Account Information</div>
          
          <div className="form-group">
            <label className="form-label">User ID</label>
            <input 
              type="text"
              className="form-input"
              value={user?.id || ''}
              disabled
            />
          </div>

          <div className="form-group">
            <label className="form-label">Account Created</label>
            <input 
              type="text"
              className="form-input"
              value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              disabled
            />
          </div>

          <div className="form-group">
            <label className="form-label">Last Login</label>
            <input 
              type="text"
              className="form-input"
              value={user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
              disabled
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    height: '100%',
    overflow: 'auto',
    backgroundColor: 'var(--color-bg)',
  }
};

export default Profile;
