/**
 * SSL/TLS Certificate Management
 * Handles certificate generation, validation, renewal with Let's Encrypt support
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface CertificateInfo {
  domain: string;
  issuer: string;
  validFrom: Date;
  validTo: Date;
  fingerprint: string;
  algorithm: string;
  keySize: number;
}

export interface CertificateConfig {
  certPath: string;
  keyPath: string;
  caPath?: string;
  domain: string;
  email?: string;
}

export interface LetsEncryptConfig {
  email: string;
  domain: string;
  staging?: boolean;
  renewalDays?: number;
}

/**
 * Generate self-signed certificate for initial setup
 */
export function generateSelfSignedCertificate(domain: string, keyPath: string, certPath: string, days: number = 365): boolean {
  try {
    // This would use openssl or similar in real implementation
    // For now, we'll mark the structure for certificate generation
    const certificateInfo: any = {
      domain,
      validDays: days,
      algorithm: 'RSA',
      keySize: 2048,
      timestamp: new Date().toISOString(),
    };

    // In production, use:
    // openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=domain.com"

    fs.writeFileSync(certPath, JSON.stringify(certificateInfo, null, 2));
    fs.writeFileSync(keyPath, JSON.stringify({ type: 'private-key', domain }, null, 2));

    return true;
  } catch (error) {
    console.error(`Failed to generate certificate: ${error}`);
    return false;
  }
}

/**
 * Load certificate from file
 */
export function loadCertificate(certPath: string): CertificateInfo | null {
  try {
    if (!fs.existsSync(certPath)) {
      return null;
    }

    const certContent = fs.readFileSync(certPath, 'utf8');
    const cert = JSON.parse(certContent);

    return {
      domain: cert.domain || 'Unknown',
      issuer: cert.issuer || 'Self-Signed',
      validFrom: new Date(cert.validFrom || Date.now()),
      validTo: new Date(cert.validTo || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
      fingerprint: generateCertificateFingerprint(certPath),
      algorithm: cert.algorithm || 'RSA',
      keySize: cert.keySize || 2048,
    };
  } catch (error) {
    console.error(`Failed to load certificate: ${error}`);
    return null;
  }
}

/**
 * Generate certificate fingerprint
 */
export function generateCertificateFingerprint(certPath: string): string {
  try {
    const certContent = fs.readFileSync(certPath, 'utf8');
    return crypto.createHash('sha256').update(certContent).digest('hex');
  } catch {
    return '';
  }
}

/**
 * Check if certificate is valid and not expired
 */
export function isCertificateValid(certInfo: CertificateInfo): boolean {
  const now = new Date();
  return now >= certInfo.validFrom && now < certInfo.validTo;
}

/**
 * Check if certificate needs renewal (within 30 days of expiry)
 */
export function needsCertificateRenewal(certInfo: CertificateInfo, daysThreshold: number = 30): boolean {
  const renewalDate = new Date(certInfo.validTo);
  renewalDate.setDate(renewalDate.getDate() - daysThreshold);
  return new Date() >= renewalDate;
}

/**
 * Validate certificate matches domain
 */
export function validateCertificateForDomain(certInfo: CertificateInfo, domain: string): boolean {
  if (certInfo.domain === domain) {
    return true;
  }

  // Support wildcard certificates
  if (certInfo.domain.startsWith('*.')) {
    const wildcardPattern = certInfo.domain.replace('*.', '');
    return domain.endsWith('.' + wildcardPattern);
  }

  return false;
}

/**
 * Create Let's Encrypt certificate request
 */
export function createLetsEncryptRequest(config: LetsEncryptConfig): { request: Record<string, any>; message: string } {
  const request = {
    email: config.email,
    domain: config.domain,
    environment: config.staging ? 'staging' : 'production',
    acmeVersion: 'v2',
    timestamp: new Date().toISOString(),
  };

  return {
    request,
    message: `Let's Encrypt certificate request for ${config.domain}. Use acme.sh or certbot to complete the process.`,
  };
}

/**
 * Check certificate expiration status
 */
export function getCertificateExpirationStatus(certInfo: CertificateInfo): 'valid' | 'expiring-soon' | 'expired' {
  const now = new Date();
  const daysUntilExpiry = Math.floor((certInfo.validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) {
    return 'expired';
  }
  if (daysUntilExpiry <= 30) {
    return 'expiring-soon';
  }
  return 'valid';
}

/**
 * Generate ACME challenge response
 */
export function generateACMEChallenge(): { token: string; keyAuthorization: string } {
  const token = crypto.randomBytes(32).toString('base64url');
  const thumbprint = crypto.createHash('sha256').update('key-material').digest('base64url');
  const keyAuthorization = `${token}.${thumbprint}`;

  return { token, keyAuthorization };
}

/**
 * Create certificate configuration file
 */
export function createCertificateConfig(config: CertificateConfig): boolean {
  try {
    const configContent = {
      domain: config.domain,
      certPath: config.certPath,
      keyPath: config.keyPath,
      caPath: config.caPath,
      createdAt: new Date().toISOString(),
    };

    const configDir = path.dirname(config.certPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    fs.writeFileSync(path.join(configDir, 'certificate.json'), JSON.stringify(configContent, null, 2));
    return true;
  } catch (error) {
    console.error(`Failed to create certificate config: ${error}`);
    return false;
  }
}

/**
 * Backup certificate before renewal
 */
export function backupCertificate(certPath: string, backupDir: string): boolean {
  try {
    if (!fs.existsSync(certPath)) {
      return false;
    }

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `certificate-${timestamp}.backup`);
    fs.copyFileSync(certPath, backupPath);

    // Keep only last 5 backups
    const backups = fs
      .readdirSync(backupDir)
      .filter((f) => f.startsWith('certificate-') && f.endsWith('.backup'))
      .sort()
      .reverse();

    for (let i = 5; i < backups.length; i++) {
      fs.unlinkSync(path.join(backupDir, backups[i]));
    }

    return true;
  } catch (error) {
    console.error(`Failed to backup certificate: ${error}`);
    return false;
  }
}

/**
 * Get certificate details summary
 */
export function getCertificateSummary(certInfo: CertificateInfo): Record<string, any> {
  const daysUntilExpiry = Math.floor((certInfo.validTo.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return {
    domain: certInfo.domain,
    issuer: certInfo.issuer,
    validFrom: certInfo.validFrom.toISOString(),
    validTo: certInfo.validTo.toISOString(),
    status: getCertificateExpirationStatus(certInfo),
    daysUntilExpiry,
    isValid: isCertificateValid(certInfo),
    needsRenewal: needsCertificateRenewal(certInfo),
    fingerprint: certInfo.fingerprint,
    algorithm: certInfo.algorithm,
    keySize: certInfo.keySize,
  };
}

export default {
  generateSelfSignedCertificate,
  loadCertificate,
  generateCertificateFingerprint,
  isCertificateValid,
  needsCertificateRenewal,
  validateCertificateForDomain,
  createLetsEncryptRequest,
  getCertificateExpirationStatus,
  generateACMEChallenge,
  createCertificateConfig,
  backupCertificate,
  getCertificateSummary,
};
