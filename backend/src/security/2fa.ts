/**
 * Two-Factor Authentication (2FA) Module
 * Supports TOTP, backup codes, email verification
 */

import crypto from 'crypto';
import { Buffer } from 'buffer';

// TOTP constants (RFC 6238)
const TOTP_WINDOW = 30; // seconds
const TOTP_DIGITS = 6;
const TOTP_ALGORITHM = 'sha1';

export interface TOTPSecret {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface BackupCode {
  code: string;
  used: boolean;
  usedAt?: Date;
}

export interface TwoFactorConfig {
  enabled: boolean;
  method: 'totp' | 'email' | 'sms';
  secret?: string;
  backupCodes: BackupCode[];
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

/**
 * Generate TOTP secret and QR code
 */
export function generateTOTPSecret(accountName: string, issuer: string = 'ArtiPanel'): TOTPSecret {
  const secret = crypto.randomBytes(20).toString('base64').replace(/[^A-Z2-7]/g, '');
  const cleanSecret = secret.substring(0, 32);

  // Generate backup codes
  const backupCodes = Array.from({ length: 10 }, () => {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  });

  // Create QR code provisioning URI (otpauth://)
  const otpauthUrl = generateOTPAuthURI(accountName, issuer, cleanSecret, 'totp');

  return {
    secret: cleanSecret,
    qrCode: otpauthUrl,
    backupCodes,
  };
}

/**
 * Generate OTPAuth URI for QR code generation
 */
function generateOTPAuthURI(accountName: string, issuer: string, secret: string, type: 'totp' | 'hotp'): string {
  const encoder = encodeURIComponent;
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: TOTP_ALGORITHM.toUpperCase(),
    digits: TOTP_DIGITS.toString(),
    ...(type === 'totp' && { period: TOTP_WINDOW.toString() }),
  });

  return `otpauth://${type}/${encoder(issuer)}:${encoder(accountName)}?${params.toString()}`;
}

/**
 * Verify TOTP token
 */
export function verifyTOTPToken(secret: string, token: string, window: number = 1): boolean {
  if (token.length !== TOTP_DIGITS) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  const timeStep = TOTP_WINDOW;

  // Check current and adjacent time windows for better UX
  for (let i = -window; i <= window; i++) {
    const time = Math.floor((now + i * timeStep) / timeStep);
    const hmac = crypto.createHmac(TOTP_ALGORITHM, Buffer.from(secret, 'base64'));
    const buffer = Buffer.alloc(8);
    buffer.writeBigInt64BE(BigInt(time), 0);
    hmac.update(buffer);
    const digest = hmac.digest();
    const offset = digest[digest.length - 1] & 0x0f;
    const code = (digest.readUInt32BE(offset) & 0x7fffffff) % Math.pow(10, TOTP_DIGITS);
    const tokenCode = parseInt(token, 10);

    if (code === tokenCode) {
      return true;
    }
  }

  return false;
}

/**
 * Generate backup codes for recovery
 */
export function generateBackupCodes(count: number = 10): string[] {
  return Array.from({ length: count }, () => {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  });
}

/**
 * Verify and consume backup code
 */
export function verifyBackupCode(backupCodes: BackupCode[], code: string): { valid: boolean; remaining: number } {
  const backupCode = backupCodes.find((bc) => bc.code === code && !bc.used);

  if (!backupCode) {
    return { valid: false, remaining: backupCodes.filter((bc) => !bc.used).length };
  }

  backupCode.used = true;
  backupCode.usedAt = new Date();

  return {
    valid: true,
    remaining: backupCodes.filter((bc) => !bc.used).length,
  };
}

/**
 * Generate email verification code
 */
export function generateEmailVerificationCode(email: string, expiryMinutes: number = 15): { code: string; expiresAt: Date } {
  const code = crypto.randomBytes(3).toString('hex').toUpperCase();
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
  return { code, expiresAt };
}

/**
 * Generate SMS verification code
 */
export function generateSMSVerificationCode(): { code: string; expiresAt: Date } {
  const code = crypto
    .randomBytes(2)
    .readUInt16BE(0)
    .toString()
    .padStart(6, '0')
    .substring(0, 6);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  return { code, expiresAt };
}

/**
 * Create 2FA challenge token
 */
export function create2FAChallenge(userId: string, method: '2fa' | 'backup' | 'email'): { challenge: string; expiresAt: Date } {
  const challenge = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  return { challenge, expiresAt };
}

/**
 * Initialize 2FA for user
 */
export function initialize2FA(accountName: string, issuer: string = 'ArtiPanel'): TwoFactorConfig {
  const { secret, backupCodes } = generateTOTPSecret(accountName, issuer);

  return {
    enabled: false, // Must be confirmed with TOTP verification first
    method: 'totp',
    secret,
    backupCodes: backupCodes.map((code) => ({
      code,
      used: false,
    })),
  };
}

/**
 * Enable 2FA after verification
 */
export function enable2FA(config: TwoFactorConfig): TwoFactorConfig {
  return {
    ...config,
    enabled: true,
  };
}

/**
 * Disable 2FA
 */
export function disable2FA(config: TwoFactorConfig): TwoFactorConfig {
  return {
    enabled: false,
    method: 'totp',
    backupCodes: [],
  };
}

/**
 * Rotate 2FA secret (for recovery)
 */
export function rotate2FASecret(config: TwoFactorConfig, accountName: string, issuer: string = 'ArtiPanel'): TwoFactorConfig {
  const { secret, backupCodes } = generateTOTPSecret(accountName, issuer);

  return {
    ...config,
    secret,
    backupCodes: backupCodes.map((code) => ({
      code,
      used: false,
    })),
  };
}

/**
 * Verify 2FA authentication attempt
 */
export function verify2FAAttempt(config: TwoFactorConfig, token: string): { success: boolean; message: string; backupCodesRemaining?: number } {
  if (!config.enabled) {
    return { success: false, message: '2FA not enabled' };
  }

  // Try TOTP first
  if (config.secret && verifyTOTPToken(config.secret, token)) {
    return { success: true, message: 'TOTP verification successful' };
  }

  // Try backup code
  if (token.length >= 8) {
    const result = verifyBackupCode(config.backupCodes, token);
    if (result.valid) {
      return {
        success: true,
        message: 'Backup code used successfully',
        backupCodesRemaining: result.remaining,
      };
    }
  }

  return { success: false, message: 'Invalid 2FA token' };
}

export default {
  generateTOTPSecret,
  verifyTOTPToken,
  generateBackupCodes,
  verifyBackupCode,
  generateEmailVerificationCode,
  generateSMSVerificationCode,
  create2FAChallenge,
  initialize2FA,
  enable2FA,
  disable2FA,
  rotate2FASecret,
  verify2FAAttempt,
};
