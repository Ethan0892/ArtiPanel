/**
 * Security Audit Logger
 * Comprehensive logging of all security-related events
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export type AuditEventType =
  | 'auth-login'
  | 'auth-logout'
  | 'auth-failed'
  | 'auth-2fa-enabled'
  | 'auth-2fa-disabled'
  | 'auth-2fa-challenge'
  | 'permission-changed'
  | 'role-changed'
  | 'data-access'
  | 'data-modified'
  | 'data-deleted'
  | 'certificate-issued'
  | 'certificate-renewed'
  | 'certificate-revoked'
  | 'update-started'
  | 'update-completed'
  | 'update-failed'
  | 'encryption-enabled'
  | 'encryption-disabled'
  | 'admin-action'
  | 'suspicious-activity'
  | 'rate-limit-exceeded'
  | 'ip-blocked'
  | 'api-key-created'
  | 'api-key-revoked';

export interface AuditEvent {
  id: string;
  timestamp: Date;
  eventType: AuditEventType;
  userId?: string;
  username?: string;
  ipAddress: string;
  userAgent?: string;
  resource?: string;
  action: string;
  details: Record<string, any>;
  status: 'success' | 'failure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  signature?: string;
}

export interface AuditLog {
  events: AuditEvent[];
  totalCount: number;
}

const AUDIT_LOG_DIR = './logs/audit';
const MAX_LOG_SIZE = 100 * 1024 * 1024; // 100MB
const LOG_RETENTION_DAYS = 90;
const INTEGRITY_CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

let integrityCheckTimer: NodeJS.Timer | null = null;

/**
 * Initialize audit logging
 */
export function initializeAuditLogging(): boolean {
  try {
    if (!fs.existsSync(AUDIT_LOG_DIR)) {
      fs.mkdirSync(AUDIT_LOG_DIR, { recursive: true });
    }

    // Start integrity check interval
    if (integrityCheckTimer === null) {
      integrityCheckTimer = setInterval(() => {
        verifyAuditLogIntegrity();
      }, INTEGRITY_CHECK_INTERVAL);
    }

    return true;
  } catch (error) {
    console.error(`Failed to initialize audit logging: ${error}`);
    return false;
  }
}

/**
 * Log a security event
 */
export function logSecurityEvent(
  eventType: AuditEventType,
  action: string,
  details: Record<string, any>,
  options: {
    userId?: string;
    username?: string;
    ipAddress: string;
    userAgent?: string;
    resource?: string;
    status?: 'success' | 'failure';
    severity?: 'low' | 'medium' | 'high' | 'critical';
  },
): AuditEvent {
  const event: AuditEvent = {
    id: crypto.randomUUID?.() || generateUUID(),
    timestamp: new Date(),
    eventType,
    userId: options.userId,
    username: options.username,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
    resource: options.resource,
    action,
    details,
    status: options.status || 'success',
    severity: options.severity || determineSeverity(eventType, options.status),
  };

  // Generate signature for integrity verification
  event.signature = generateEventSignature(event);

  // Write to audit log
  writeAuditEvent(event);

  // Alert on high severity events
  if (event.severity === 'critical' || event.severity === 'high') {
    alertSecurityEvent(event);
  }

  return event;
}

/**
 * Log authentication event
 */
export function logAuthEvent(
  eventType: 'auth-login' | 'auth-logout' | 'auth-failed' | 'auth-2fa-enabled' | 'auth-2fa-disabled' | 'auth-2fa-challenge',
  userId: string,
  username: string,
  ipAddress: string,
  userAgent: string,
  status: 'success' | 'failure',
): void {
  logSecurityEvent(eventType, `User ${eventType.replace('auth-', '')}`, { userId, username }, {
    userId,
    username,
    ipAddress,
    userAgent,
    status,
    severity: status === 'failure' && eventType === 'auth-failed' ? 'medium' : 'low',
  });
}

/**
 * Log permission change
 */
export function logPermissionChange(
  userId: string,
  changedBy: string,
  oldPermissions: string[],
  newPermissions: string[],
  ipAddress: string,
): void {
  logSecurityEvent(
    'permission-changed',
    `Permissions changed for user ${userId}`,
    { userId, oldPermissions, newPermissions, changedBy },
    {
      userId,
      username: changedBy,
      ipAddress,
      status: 'success',
      severity: 'high',
    },
  );
}

/**
 * Log data access
 */
export function logDataAccess(userId: string, resource: string, ipAddress: string, fields: string[]): void {
  logSecurityEvent(
    'data-access',
    `Accessed resource: ${resource}`,
    { resource, fields, fieldCount: fields.length },
    {
      userId,
      ipAddress,
      resource,
      status: 'success',
      severity: 'low',
    },
  );
}

/**
 * Log data modification
 */
export function logDataModification(userId: string, resource: string, changes: Record<string, any>, ipAddress: string): void {
  logSecurityEvent(
    'data-modified',
    `Modified resource: ${resource}`,
    { resource, changes, changeCount: Object.keys(changes).length },
    {
      userId,
      ipAddress,
      resource,
      status: 'success',
      severity: 'medium',
    },
  );
}

/**
 * Log data deletion
 */
export function logDataDeletion(userId: string, resource: string, recordId: string, ipAddress: string): void {
  logSecurityEvent(
    'data-deleted',
    `Deleted resource: ${resource}`,
    { resource, recordId },
    {
      userId,
      ipAddress,
      resource,
      status: 'success',
      severity: 'high',
    },
  );
}

/**
 * Log suspicious activity
 */
export function logSuspiciousActivity(description: string, details: Record<string, any>, ipAddress: string, userId?: string): void {
  logSecurityEvent(
    'suspicious-activity',
    description,
    details,
    {
      userId,
      ipAddress,
      status: 'failure',
      severity: 'high',
    },
  );
}

/**
 * Log rate limit exceeded
 */
export function logRateLimitExceeded(ipAddress: string, endpoint: string, attempts: number): void {
  logSecurityEvent(
    'rate-limit-exceeded',
    `Rate limit exceeded on ${endpoint}`,
    { endpoint, attempts },
    {
      ipAddress,
      resource: endpoint,
      status: 'failure',
      severity: 'medium',
    },
  );
}

/**
 * Write audit event to log file
 */
function writeAuditEvent(event: AuditEvent): void {
  try {
    const logFile = path.join(AUDIT_LOG_DIR, `audit-${getFormattedDate(event.timestamp)}.log`);
    const logEntry = JSON.stringify(event) + '\n';

    // Check file size and rotate if needed
    if (fs.existsSync(logFile)) {
      const stats = fs.statSync(logFile);
      if (stats.size > MAX_LOG_SIZE) {
        rotateAuditLog(logFile);
      }
    }

    fs.appendFileSync(logFile, logEntry, 'utf8');
  } catch (error) {
    console.error(`Failed to write audit event: ${error}`);
  }
}

/**
 * Rotate audit log when size limit exceeded
 */
function rotateAuditLog(logFile: string): void {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `${logFile}.${timestamp}.backup`;
    fs.renameSync(logFile, backupFile);
  } catch (error) {
    console.error(`Failed to rotate audit log: ${error}`);
  }
}

/**
 * Query audit logs
 */
export function queryAuditLogs(options: {
  startDate?: Date;
  endDate?: Date;
  eventType?: AuditEventType;
  userId?: string;
  ipAddress?: string;
  severity?: string;
  limit?: number;
  offset?: number;
}): AuditLog {
  const events: AuditEvent[] = [];

  try {
    const files = fs
      .readdirSync(AUDIT_LOG_DIR)
      .filter((f) => f.startsWith('audit-') && f.endsWith('.log'))
      .sort()
      .reverse();

    for (const file of files) {
      const filePath = path.join(AUDIT_LOG_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter((l) => l.trim());

      for (const line of lines) {
        try {
          const event = JSON.parse(line) as AuditEvent;
          if (matchesQuery(event, options)) {
            events.push(event);
          }
        } catch {
          // Skip invalid lines
        }
      }

      if (events.length >= (options.limit || 1000)) {
        break;
      }
    }
  } catch (error) {
    console.error(`Failed to query audit logs: ${error}`);
  }

  const offset = options.offset || 0;
  const limit = options.limit || 1000;

  return {
    events: events.slice(offset, offset + limit),
    totalCount: events.length,
  };
}

/**
 * Export audit logs for compliance
 */
export function exportAuditLogs(startDate: Date, endDate: Date, format: 'json' | 'csv' = 'json'): string {
  const logs = queryAuditLogs({ startDate, endDate });

  if (format === 'csv') {
    return convertToCSV(logs.events);
  }

  return JSON.stringify(logs, null, 2);
}

/**
 * Verify audit log integrity
 */
export function verifyAuditLogIntegrity(): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  try {
    const files = fs.readdirSync(AUDIT_LOG_DIR).filter((f) => f.startsWith('audit-') && f.endsWith('.log'));

    for (const file of files) {
      const filePath = path.join(AUDIT_LOG_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter((l) => l.trim());

      for (const line of lines) {
        try {
          const event = JSON.parse(line) as AuditEvent;
          if (event.signature && !verifyEventSignature(event)) {
            issues.push(`Invalid signature for event ${event.id}`);
          }
        } catch {
          issues.push(`Invalid JSON in ${file}`);
        }
      }
    }
  } catch (error) {
    issues.push(`Integrity check failed: ${error}`);
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Cleanup old audit logs
 */
export function cleanupOldAuditLogs(retentionDays: number = LOG_RETENTION_DAYS): number {
  let deletedCount = 0;

  try {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    const files = fs.readdirSync(AUDIT_LOG_DIR);

    for (const file of files) {
      const filePath = path.join(AUDIT_LOG_DIR, file);
      const stats = fs.statSync(filePath);

      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    }
  } catch (error) {
    console.error(`Failed to cleanup old audit logs: ${error}`);
  }

  return deletedCount;
}

// ===== Helper Functions =====

function determineSeverity(
  eventType: AuditEventType,
  status?: 'success' | 'failure',
): 'low' | 'medium' | 'high' | 'critical' {
  const criticalEvents = ['certificate-revoked', 'auth-2fa-disabled', 'encryption-disabled'];
  const highEvents = ['data-deleted', 'permission-changed', 'role-changed', 'suspicious-activity', 'ip-blocked'];
  const mediumEvents = ['data-modified', 'update-failed', 'rate-limit-exceeded', 'auth-failed'];

  if (criticalEvents.includes(eventType)) return 'critical';
  if (highEvents.includes(eventType)) return 'high';
  if (mediumEvents.includes(eventType)) return 'medium';
  return 'low';
}

function generateEventSignature(event: AuditEvent): string {
  const dataToSign = `${event.id}${event.timestamp}${event.eventType}${event.userId}${event.action}`;
  return crypto.createHash('sha256').update(dataToSign).digest('hex');
}

function verifyEventSignature(event: AuditEvent): boolean {
  if (!event.signature) return false;
  const expectedSignature = generateEventSignature(event);
  return event.signature === expectedSignature;
}

function matchesQuery(event: AuditEvent, options: Record<string, any>): boolean {
  if (options.eventType && event.eventType !== options.eventType) return false;
  if (options.userId && event.userId !== options.userId) return false;
  if (options.ipAddress && event.ipAddress !== options.ipAddress) return false;
  if (options.severity && event.severity !== options.severity) return false;
  if (options.startDate && event.timestamp < options.startDate) return false;
  if (options.endDate && event.timestamp > options.endDate) return false;
  return true;
}

function getFormattedDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function convertToCSV(events: AuditEvent[]): string {
  const headers = ['ID', 'Timestamp', 'Event Type', 'User ID', 'IP Address', 'Action', 'Status', 'Severity'];
  const rows = events.map((e) => [e.id, e.timestamp, e.eventType, e.userId, e.ipAddress, e.action, e.status, e.severity]);

  return [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function alertSecurityEvent(_event: AuditEvent): void {
  // Emit event to admin dashboard or send alert
  // Implementation depends on notification system
}

export default {
  initializeAuditLogging,
  logSecurityEvent,
  logAuthEvent,
  logPermissionChange,
  logDataAccess,
  logDataModification,
  logDataDeletion,
  logSuspiciousActivity,
  logRateLimitExceeded,
  queryAuditLogs,
  exportAuditLogs,
  verifyAuditLogIntegrity,
  cleanupOldAuditLogs,
};
