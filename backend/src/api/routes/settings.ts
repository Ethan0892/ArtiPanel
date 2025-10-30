import { Router, Request, Response, NextFunction } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import logger from '../../utils/logger';

interface SettingsSchema {
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
    digest: 'off' | 'daily' | 'weekly';
    incidentChannels: string[];
    escalationPolicy: 'immediate' | 'after-5m' | 'after-15m';
  };
  appearance: {
    theme: 'dark' | 'light' | 'system';
    themeId: string;
    density: 'comfortable' | 'compact';
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
    location: 'local' | 's3' | 'gcs' | 'azure';
  };
}

interface SettingsFilePayload {
  settings: SettingsSchema;
  savedAt: string;
}

interface ValidationError {
  path: string;
  message: string;
}

const router = Router();

const DATA_DIR = path.join(process.cwd(), 'storage');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

const defaultSettings: SettingsSchema = {
  profile: {
    name: 'Ethan Richards',
    email: 'ethan@artipanel.io',
    role: 'Administrator',
    organization: 'ArtiPanel Labs',
    avatarColor: '#6366F1',
    phone: '+1 (555) 010-2645',
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
    theme: 'dark',
    themeId: 'pterodactyl-dark',
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

const cloneDefaultSettings = (): SettingsSchema => JSON.parse(JSON.stringify(defaultSettings));

const applyPatch = (target: Record<string, unknown>, source: Record<string, unknown>) => {
  Object.entries(source).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      target[key] = [...value];
      return;
    }

    if (typeof value === 'object') {
      const base = typeof target[key] === 'object' && target[key] !== null ? target[key] as Record<string, unknown> : {};
      target[key] = { ...base };
      applyPatch(target[key] as Record<string, unknown>, value as Record<string, unknown>);
      return;
    }

    target[key] = value;
  });
};

const mergeSettings = (source?: Partial<SettingsSchema> | null): SettingsSchema => {
  const next = cloneDefaultSettings();
  if (!source) {
    return next;
  }
  applyPatch(next as unknown as Record<string, unknown>, source as unknown as Record<string, unknown>);
  return next;
};

const ensureStorageDir = async () => {
  await fs.mkdir(DATA_DIR, { recursive: true });
};

const readSettingsFromDisk = async (): Promise<SettingsFilePayload> => {
  try {
    const raw = await fs.readFile(SETTINGS_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<SettingsFilePayload> | SettingsSchema;

    if ('settings' in parsed && parsed.settings) {
      return {
        settings: mergeSettings(parsed.settings as Partial<SettingsSchema>),
        savedAt: parsed.savedAt || new Date().toISOString(),
      };
    }

    return {
      settings: mergeSettings(parsed as Partial<SettingsSchema>),
      savedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return {
        settings: defaultSettings,
        savedAt: new Date().toISOString(),
      };
    }

    logger.error('Failed to read settings from disk', error);
    throw error;
  }
};

const writeSettingsToDisk = async (settings: SettingsSchema) => {
  await ensureStorageDir();
  const payload: SettingsFilePayload = {
    settings,
    savedAt: new Date().toISOString(),
  };
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  return payload;
};

const isValidEmail = (value: string) => /.+@.+\..+/.test(value);

const isValidHttpsUrl = (value: string) => {
  if (!value) {
    return false;
  }
  try {
    const url = new URL(value);
    return url.protocol === 'https:';
  } catch (error) {
    return false;
  }
};

const isValidPagerDutyKey = (value: string) => /^[A-Z0-9]{18,40}$/i.test(value);

const allowedIncidentChannels = new Set(['email', 'slack', 'sms', 'pagerduty']);

const validateSettings = (settings: SettingsSchema): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!isValidEmail(settings.profile.email)) {
    errors.push({ path: 'profile.email', message: 'Enter a valid email address.' });
  }

  const invalidChannels = settings.notifications.incidentChannels.filter((channel) => !allowedIncidentChannels.has(channel));
  if (invalidChannels.length > 0) {
    errors.push({ path: 'notifications.incidentChannels', message: 'One or more incident channels are not supported.' });
  }

  if (settings.integrations.slackEnabled) {
    if (!settings.integrations.slackWebhook) {
      errors.push({ path: 'integrations.slackWebhook', message: 'Provide the Slack webhook URL to enable the integration.' });
    } else if (!isValidHttpsUrl(settings.integrations.slackWebhook)) {
      errors.push({ path: 'integrations.slackWebhook', message: 'Slack webhook must be a valid HTTPS URL.' });
    }
  }

  if (settings.integrations.discordEnabled) {
    if (!settings.integrations.discordWebhook) {
      errors.push({ path: 'integrations.discordWebhook', message: 'Provide the Discord webhook URL to enable the integration.' });
    } else if (!isValidHttpsUrl(settings.integrations.discordWebhook)) {
      errors.push({ path: 'integrations.discordWebhook', message: 'Discord webhook must be a valid HTTPS URL.' });
    }
  }

  if (settings.integrations.pagerDutyEnabled) {
    if (!settings.integrations.pagerDutyKey) {
      errors.push({ path: 'integrations.pagerDutyKey', message: 'Provide the PagerDuty integration key to enable the integration.' });
    } else if (!isValidPagerDutyKey(settings.integrations.pagerDutyKey)) {
      errors.push({ path: 'integrations.pagerDutyKey', message: 'PagerDuty integration key should be 18-40 characters (letters and digits).' });
    }
  }

  return errors;
};

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = await readSettingsFromDisk();
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.put('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
  const merged = mergeSettings(req.body as Partial<SettingsSchema>);
    const validationErrors = validateSettings(merged);

    if (validationErrors.length > 0) {
      res.status(400).json({
        message: 'Settings validation failed',
        errors: validationErrors,
      });
      return;
    }

    const payload = await writeSettingsToDisk(merged);
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

export default router;
