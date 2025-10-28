#!/usr/bin/env node
/**
 * ArtiPanel Security Features - Quick Reference & Usage Examples
 */

// ===== 1. ENCRYPTION EXAMPLES =====

import { encryption } from './backend/src/security';

// Example 1: Encrypt sensitive data
function encryptExample() {
  const sensitiveData = 'my-api-key-12345';
  const masterKey = process.env.MASTER_KEY || 'development-key';

  const encrypted = encryption.encrypt(sensitiveData, masterKey);
  console.log('Encrypted:', encrypted);

  const decrypted = encryption.decrypt(encrypted, masterKey);
  console.log('Decrypted:', decrypted.data);
}

// Example 2: Hash and verify passwords
function passwordExample() {
  const password = 'UserPassword123!';

  // Hash password
  const hash = encryption.hashPassword(password);
  console.log('Password hash:', hash);

  // Verify password
  const isValid = encryption.verifyPassword(password, hash);
  console.log('Password valid:', isValid);
}

// Example 3: Generate session token
function sessionTokenExample() {
  const { token, hash } = encryption.createSessionToken();
  console.log('Session token:', token);
  console.log('Session hash:', hash);

  // Store hash in database, send token to client
  // On next request, hash the token and compare with stored hash
}

// ===== 2. TWO-FACTOR AUTHENTICATION EXAMPLES =====

import { twoFactorAuth } from './backend/src/security';

// Example 1: Initialize 2FA for new user
function initialize2FAExample() {
  const user = { email: 'user@example.com', id: 'user-123' };

  // Generate TOTP secret
  const twoFAConfig = twoFactorAuth.generateTOTPSecret(user.email, 'ArtiPanel');
  console.log('QR Code URL:', twoFAConfig.qrCode);
  console.log('Backup codes:', twoFAConfig.backupCodes);

  // User scans QR code with authenticator app
  // Then verifies setup with TOTP token
}

// Example 2: Verify TOTP token during login
function verify2FAExample() {
  const userToken = '123456'; // User enters 6-digit code
  const userSecret = 'stored-totp-secret-from-db';

  const isValid = twoFactorAuth.verifyTOTPToken(userSecret, userToken);
  if (isValid) {
    console.log('✓ 2FA authentication successful');
  } else {
    console.log('✗ Invalid 2FA token');
  }
}

// Example 3: Use backup code for recovery
function backupCodeExample() {
  const userBackupCodes: any[] = [
    { code: 'A1B2C3D4', used: false },
    { code: 'E5F6G7H8', used: false },
    // ... more codes
  ];

  const backupCode = 'A1B2C3D4';
  const result = twoFactorAuth.verifyBackupCode(userBackupCodes, backupCode);

  if (result.valid) {
    console.log(`✓ Backup code valid. ${result.remaining} codes remaining.`);
  } else {
    console.log('✗ Invalid or already used backup code');
  }
}

// ===== 3. CERTIFICATE MANAGEMENT EXAMPLES =====

import { certificates } from './backend/src/security';

// Example 1: Generate self-signed certificate
function generateCertificateExample() {
  const domain = 'artipanel.example.com';
  const keyPath = '/etc/artipanel/private.key';
  const certPath = '/etc/artipanel/certificate.crt';

  const success = certificates.generateSelfSignedCertificate(domain, keyPath, certPath, 365);
  if (success) {
    console.log('✓ Self-signed certificate generated');
  }
}

// Example 2: Check certificate status
function checkCertificateExample() {
  const certPath = '/etc/artipanel/certificate.crt';
  const certInfo = certificates.loadCertificate(certPath);

  if (certInfo) {
    const summary = certificates.getCertificateSummary(certInfo);
    console.log('Certificate Status:', summary);

    if (certificates.needsCertificateRenewal(certInfo)) {
      console.log('⚠ Certificate needs renewal - initiating renewal process');
      certificates.backupCertificate(certPath, './backups/certs');
    }
  }
}

// ===== 4. AUTOMATIC UPDATES EXAMPLES =====

import { updates } from './backend/src/security';

// Example 1: Check for updates
async function checkUpdatesExample() {
  const current = updates.getCurrentVersion();
  console.log('Current version:', current);

  const versionInfo = await updates.checkForUpdates('stable');
  if (versionInfo && updates.isUpdateAvailable(versionInfo.current, versionInfo.latest)) {
    console.log(`✓ Update available: ${versionInfo.current} → ${versionInfo.latest}`);
    console.log('Changelog:', versionInfo.changelog);
  }
}

// Example 2: Install update with progress tracking
async function installUpdateExample() {
  const manifest = {
    version: '1.1.0',
    releaseDate: new Date(),
    changelog: 'Security improvements and bug fixes',
    downloadUrl: 'https://artipanel.example.com/updates/1.1.0.zip',
    checksum: 'sha256-hash-here',
    size: 50 * 1024 * 1024,
    breakingChanges: [],
    minimumRequirements: {
      nodeVersion: '18.0.0',
      diskSpace: 1024 * 1024 * 1024,
      ram: 512 * 1024 * 1024,
    },
  };

  // Download with progress
  const packagePath = await updates.downloadUpdate(manifest, (progress) => {
    console.log(`[${progress.status}] ${progress.progress}% - ${progress.message}`);
  });

  // Verify integrity
  const isValid = updates.verifyUpdatePackage(packagePath, manifest.checksum);
  if (!isValid) {
    console.log('✗ Package integrity check failed');
    return;
  }

  // Install with progress
  const success = await updates.installUpdate(packagePath, (progress) => {
    console.log(`[${progress.status}] ${progress.progress}% - ${progress.message}`);
  });

  if (success) {
    console.log('✓ Update installed successfully. Please restart the application.');
  } else {
    console.log('✗ Update failed. Rolling back...');
    await updates.rollbackUpdate();
  }
}

// Example 3: Schedule automatic update checks
function scheduleUpdatesExample() {
  updates.scheduleUpdateChecks(24 * 60 * 60 * 1000); // Check daily
  console.log('✓ Automatic update checks scheduled');
}

// ===== 5. AUDIT LOGGING EXAMPLES =====

import { auditLog } from './backend/src/security';

// Example 1: Initialize and log events
function auditLoggingExample() {
  auditLog.initializeAuditLogging();

  // Log a login event
  auditLog.logAuthEvent('auth-login', 'user-123', 'admin@example.com', '192.168.1.100', 'Mozilla/5.0...', 'success');

  // Log a permission change
  auditLog.logPermissionChange(
    'user-456', // changed user
    'admin-id', // who made the change
    ['read', 'write'], // old permissions
    ['read', 'write', 'delete'], // new permissions
    '192.168.1.100', // from IP
  );

  // Log suspicious activity
  auditLog.logSuspiciousActivity('Multiple failed 2FA attempts detected', { attempts: 5, window: '15 minutes' }, '192.168.1.200', 'user-789');
}

// Example 2: Query audit logs
function queryLogsExample() {
  const logs = auditLog.queryAuditLogs({
    eventType: 'auth-failed',
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    endDate: new Date(),
    limit: 100,
  });

  console.log(`Found ${logs.totalCount} failed login attempts in the last 24 hours`);
  logs.events.forEach((event) => {
    console.log(`- ${event.timestamp} from ${event.ipAddress}: ${event.action}`);
  });
}

// Example 3: Export logs for compliance
function exportLogsExample() {
  const csv = auditLog.exportAuditLogs(new Date('2025-01-01'), new Date('2025-12-31'), 'csv');
  const fs = require('fs');
  fs.writeFileSync('compliance-audit-2025.csv', csv);
  console.log('✓ Audit logs exported to compliance-audit-2025.csv');
}

// Example 4: Verify audit log integrity
function verifyLogsExample() {
  const result = auditLog.verifyAuditLogIntegrity();
  if (result.valid) {
    console.log('✓ Audit logs integrity verified');
  } else {
    console.log('✗ Integrity issues found:', result.issues);
  }
}

// ===== 6. RATE LIMITING & DDoS EXAMPLES =====

import { rateLimiting } from './backend/src/security';

// Example 1: Check rate limit in middleware
function rateLimitMiddlewareExample() {
  // In Express middleware
  app.use((req, res, next) => {
    const ipAddress = req.ip;
    const check = rateLimiting.checkRateLimit(ipAddress);

    res.set('X-RateLimit-Remaining', check.remaining.toString());

    if (!check.allowed) {
      res.set('Retry-After', check.resetTime.toString());
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: check.resetTime,
      });
    }

    next();
  });
}

// Example 2: Block IP for suspicious activity
function blockIPExample() {
  const suspiciousIP = '192.168.1.200';

  rateLimiting.blockIP({
    ipAddress: suspiciousIP,
    reason: 'Multiple failed 2FA attempts',
    duration: 24 * 60 * 60 * 1000, // 24 hours
  });

  console.log(`✓ IP ${suspiciousIP} blocked for 24 hours`);
}

// Example 3: Detect DDoS attack
function detectDDoSExample() {
  const metrics = rateLimiting.getDDoSMetrics();
  console.log('DDoS Metrics:', metrics);

  if (metrics.suspiciousPatterns > 10) {
    console.log('⚠ High number of suspicious patterns detected - possible DDoS');
    // Take action: increase rate limits, enable CAPTCHA, etc.
  }
}

// Example 4: Get IP status
function getIPStatusExample() {
  const ipAddress = '192.168.1.100';
  const status = rateLimiting.getRateLimitStatus(ipAddress);
  console.log('IP Status:', status);
}

// ===== 7. COMPLETE SECURITY INITIALIZATION =====

import security from './backend/src/security';

function initializeAllSecurityExample() {
  console.log('🔒 Initializing ArtiPanel Security...\n');

  // Initialize all security systems
  const success = security.initializeSecuritySystems();

  if (success) {
    console.log('\n✓ Security initialization complete\n');

    // Get security status
    const status = security.getSecurityStatus();
    console.log('Security Features Enabled:');
    console.log('─────────────────────────────────────');
    Object.entries(status).forEach(([module, features]) => {
      console.log(`\n${module}:`);
      Object.entries(features).forEach(([feature, enabled]) => {
        const icon = enabled ? '✓' : '✗';
        console.log(`  ${icon} ${feature}`);
      });
    });
    console.log('\n─────────────────────────────────────');
  } else {
    console.error('✗ Security initialization failed');
  }
}

// ===== EXPORT EXAMPLES FOR TESTING =====

export {
  encryptExample,
  passwordExample,
  sessionTokenExample,
  initialize2FAExample,
  verify2FAExample,
  backupCodeExample,
  generateCertificateExample,
  checkCertificateExample,
  checkUpdatesExample,
  installUpdateExample,
  scheduleUpdatesExample,
  auditLoggingExample,
  queryLogsExample,
  exportLogsExample,
  verifyLogsExample,
  rateLimitMiddlewareExample,
  blockIPExample,
  detectDDoSExample,
  getIPStatusExample,
  initializeAllSecurityExample,
};

/**
 * Usage:
 *
 * Run individual examples:
 * $ npm run example:encrypt
 * $ npm run example:2fa
 * $ npm run example:certificate
 * $ npm run example:updates
 * $ npm run example:audit
 * $ npm run example:ratelimit
 *
 * Or initialize all security:
 * const security = require('./backend/src/security');
 * security.initializeSecuritySystems();
 */
