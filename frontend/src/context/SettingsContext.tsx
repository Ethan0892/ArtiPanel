/**
 * Settings Context
 *
 * Provides dashboard-wide access to user preferences and application settings,
 * backed by the backend persistence layer.
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getSavedTheme } from '../config/themes';
import { useAuth } from './AuthContext';

export type SettingsDensity = 'comfortable' | 'compact';
export type SettingsTheme = 'dark' | 'light' | 'system';
export type NotificationDigest = 'off' | 'daily' | 'weekly';
export type BackupLocation = 'local' | 's3' | 'gcs' | 'azure';

export interface SettingsSchema {
  profile: {
    name: string;
    email: string;
    role: string;
    organization: string;
    avatarColor: string;
    phone: string;
  };
  general: {
    language: string;
    timezone: string;
    dateFormat: string;
    maintenanceWindow: string;
    autoUpdates: boolean;
  };
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    digest: NotificationDigest;
    incidentChannels: string[];
    escalationPolicy: 'immediate' | 'after-5m' | 'after-15m';
  };
  appearance: {
    theme: SettingsTheme;
    themeId: string;
    density: SettingsDensity;
    animations: boolean;
    showTooltips: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    idleTimeout: number;
    loginAlerts: boolean;
    ipRestrictions: boolean;
    allowedIPs: string;
    apiSessions: number;
  };
  integrations: {
    slackEnabled: boolean;
    slackWebhook: string;
    discordEnabled: boolean;
    discordWebhook: string;
    pagerDutyEnabled: boolean;
    pagerDutyKey: string;
  };
  backups: {
    enabled: boolean;
    schedule: string;
    retentionDays: number;
    verifyIntegrity: boolean;
    location: BackupLocation;
  };
}

export interface ValidationError {
  path: string;
  message: string;
}

export interface SaveResult {
  success: boolean;
  errors?: ValidationError[];
}

interface SettingsContextValue {
  settings: SettingsSchema;
  persistedSettings: SettingsSchema;
  updateSetting: (path: string, value: unknown) => void;
  saveSettings: () => Promise<SaveResult>;
  resetSettings: (paths?: string[]) => void;
  refreshSettings: () => Promise<void>;
  hasUnsavedChanges: boolean;
  lastSavedAt: string | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  validationErrors: Record<string, string>;
  clearValidationError: (path: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const deepClone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

const defaultTheme = getSavedTheme();

const defaultSettings: SettingsSchema = {
  profile: {
    name: '',  // Will be populated from auth user
    email: '',  // Will be populated from auth user
    role: 'User',
    organization: '',
    avatarColor: '#6366F1',
    phone: '',
  },
  general: {
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'YYYY-MM-DD',
    maintenanceWindow: 'Sundays 02:00 UTC',
    autoUpdates: true,
  },
  notifications: {
    email: true,
    push: true,
    sms: false,
    digest: 'daily',
    incidentChannels: ['email', 'slack'],
    escalationPolicy: 'after-5m',
  },
  appearance: {
    theme: defaultTheme.isDark ? 'dark' : 'light',
    themeId: defaultTheme.id,
    density: 'comfortable',
    animations: true,
    showTooltips: true,
  },
  security: {
    twoFactorEnabled: false,
    idleTimeout: 30,
    loginAlerts: true,
    ipRestrictions: false,
    allowedIPs: '',
    apiSessions: 5,
  },
  integrations: {
    slackEnabled: true,
    slackWebhook: 'https://hooks.slack.com/services/XXXXX/XXXXX/XXXXX',
    discordEnabled: false,
    discordWebhook: '',
    pagerDutyEnabled: false,
    pagerDutyKey: '',
  },
  backups: {
    enabled: true,
    schedule: '02:00',
    retentionDays: 30,
    verifyIntegrity: true,
    location: 's3',
  },
};

const setByPath = (source: SettingsSchema, path: string, value: unknown): SettingsSchema => {
  const clone = deepClone(source);
  const segments = path.split('.');
  let cursor: any = clone;
  for (let index = 0; index < segments.length - 1; index += 1) {
    const key = segments[index];
    cursor[key] = { ...cursor[key] };
    cursor = cursor[key];
  }
  cursor[segments[segments.length - 1]] = value;
  return clone;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [persistedSettings, setPersistedSettings] = useState<SettingsSchema>(deepClone(defaultSettings));
  const [workingSettings, setWorkingSettings] = useState<SettingsSchema>(deepClone(defaultSettings));
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const clearValidationError = useCallback((path: string) => {
    setValidationErrors((prev) => {
      if (!prev[path]) {
        return prev;
      }
      const next = { ...prev };
      delete next[path];
      return next;
    });
  }, []);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/settings', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Failed to load settings (${response.status})`);
      }

      const payload = await response.json();
      const nextSettings = payload.settings ? payload.settings as SettingsSchema : payload as SettingsSchema;
      const resolved = deepClone(nextSettings);

      setPersistedSettings(resolved);
      setWorkingSettings(deepClone(resolved));
      setLastSavedAt(payload.savedAt || payload.lastSavedAt || null);
      setValidationErrors({});

      if (resolved.appearance?.themeId) {
        localStorage.setItem('artipanel-theme', resolved.appearance.themeId);
      }
    } catch (loadError: any) {
      console.error(loadError);
      setError(loadError?.message || 'Unable to load settings. Falling back to defaults.');
      const fallback = deepClone(defaultSettings);
      setPersistedSettings(fallback);
      setWorkingSettings(deepClone(fallback));
      setValidationErrors({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Populate profile from authenticated user
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      // Update profile section with actual user data
      setWorkingSettings(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          name: user.username,  // Use username as display name
          email: user.email,
          role: user.role.charAt(0).toUpperCase() + user.role.slice(1),  // Capitalize role
        }
      }));
      setPersistedSettings(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          name: user.username,
          email: user.email,
          role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
        }
      }));
    }
  }, [user]);

  const updateSetting = useCallback((path: string, value: unknown) => {
    clearValidationError(path);
    setWorkingSettings((prev) => setByPath(prev, path, value));
  }, [clearValidationError]);

  const saveSettings = useCallback(async (): Promise<SaveResult> => {
    setSaving(true);
    setError(null);
    setValidationErrors({});

    // Exponential backoff retry logic for rate-limited requests
    const MAX_RETRIES = 3;
    const BASE_DELAY_MS = 1000;

    const attemptSave = async (retryCount: number = 0): Promise<SaveResult> => {
      try {
        const response = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(workingSettings),
        });

        const payload = await response.json().catch(() => ({}));

        // Handle rate limit with exponential backoff
        if (response.status === 429 && retryCount < MAX_RETRIES) {
          const delayMs = BASE_DELAY_MS * Math.pow(2, retryCount);
          console.warn(`Rate limited (429). Retrying in ${delayMs}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          return attemptSave(retryCount + 1);
        }

        if (!response.ok) {
          const errors = Array.isArray(payload.errors) ? payload.errors as ValidationError[] : [];
          const map: Record<string, string> = {};
          errors.forEach((err) => {
            map[err.path] = err.message;
          });
          setValidationErrors(map);
          return { success: false, errors };
        }

        const nextSettings = payload.settings ? payload.settings as SettingsSchema : workingSettings;
        const resolved = deepClone(nextSettings);

        setPersistedSettings(resolved);
        setWorkingSettings(deepClone(resolved));
        const savedAt = payload.savedAt || new Date().toISOString();
        setLastSavedAt(savedAt);
        setValidationErrors({});

        if (resolved.appearance?.themeId) {
          localStorage.setItem('artipanel-theme', resolved.appearance.themeId);
        }

        return { success: true };
      } catch (saveError: any) {
        console.error(saveError);
        setError(saveError?.message || 'Unable to persist settings.');
        return {
          success: false,
          errors: [{ path: 'global', message: saveError?.message || 'Unable to persist settings.' }],
        };
      }
    };

    try {
      return await attemptSave();
    } finally {
      setSaving(false);
    }
  }, [workingSettings]);

  const resetSettings = useCallback((paths?: string[]) => {
    setValidationErrors({});
    setError(null);
    if (!paths || paths.length === 0) {
      setWorkingSettings(deepClone(persistedSettings));
      return;
    }

    setWorkingSettings((prev) => {
      const clone = deepClone(prev);
      paths.forEach((path) => {
        const segments = path.split('.');
        let cursor: any = clone;
        let baseline: any = persistedSettings;
        for (let index = 0; index < segments.length - 1; index += 1) {
          const segment = segments[index];
          cursor[segment] = { ...cursor[segment] };
          cursor = cursor[segment];
          baseline = baseline[segment];
        }
        const lastKey = segments[segments.length - 1];
        cursor[lastKey] = deepClone(baseline[lastKey]);
      });
      return clone;
    });
  }, [persistedSettings]);

  const refreshSettings = useCallback(async () => {
    await loadSettings();
  }, [loadSettings]);

  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(workingSettings) !== JSON.stringify(persistedSettings);
  }, [workingSettings, persistedSettings]);

  const value = useMemo<SettingsContextValue>(() => ({
    settings: workingSettings,
    persistedSettings,
    updateSetting,
    saveSettings,
    resetSettings,
    refreshSettings,
    hasUnsavedChanges,
    lastSavedAt,
    loading,
    saving,
    error,
    validationErrors,
    clearValidationError,
  }), [
    workingSettings,
    persistedSettings,
    updateSetting,
    saveSettings,
    resetSettings,
    refreshSettings,
    hasUnsavedChanges,
    lastSavedAt,
    loading,
    saving,
    error,
    validationErrors,
    clearValidationError,
  ]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = (): SettingsContextValue => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export { defaultSettings };
