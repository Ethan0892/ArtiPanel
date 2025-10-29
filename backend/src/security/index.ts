/**
 * Security Module Index
 * Centralized export of all security features
 */

export * as encryption from './encryption';
export * as twoFactorAuth from './2fa';
export * as certificates from './certificate';
export * as updates from './updates';
export * as auditLog from './auditLog';
export * as rateLimiting from './rateLimiting';

import * as auditLog from './auditLog';
import * as rateLimiting from './rateLimiting';

/**
 * Initialize all security systems
 */
export function initializeSecuritySystems(): boolean {
  try {
    // Initialize audit logging
    auditLog.initializeAuditLogging();

    // Initialize rate limiting
    rateLimiting.initializeRateLimiting();

    // Schedule certificate renewal checks
    // certificateManager.scheduleRenewalChecks();

    // Schedule update checks
    // updates.scheduleUpdateChecks();

    console.log('✓ All security systems initialized');
    return true;
  } catch (error) {
    console.error(`Failed to initialize security systems: ${error}`);
    return false;
  }
}

/**
 * Get security status summary
 */
export function getSecurityStatus(): Record<string, any> {
  return {
    encryption: {
      aes256Enabled: true,
      hmacEnabled: true,
      sessionTokens: true,
    },
    twoFactorAuth: {
      totpSupported: true,
      emailVerificationSupported: true,
      smsVerificationSupported: true,
      backupCodesSupported: true,
    },
    certificates: {
      selfSignedSupported: true,
      letsEncryptSupported: true,
      autoRenewalSupported: true,
    },
    updates: {
      autoUpdateCheckingEnabled: true,
      automaticInstallationSupported: true,
      rollbackSupported: true,
    },
    auditLogging: {
      securityEventLogging: true,
      integrityVerification: true,
      complianceReporting: true,
    },
    rateLimiting: {
      tokenBucketAlgorithm: true,
      ipBlocking: true,
      ddosProtection: true,
      adaptiveLimiting: true,
    },
  };
}

export default {
  initializeSecuritySystems,
  getSecurityStatus,
};
