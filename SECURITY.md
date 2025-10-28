# ArtiPanel Security Features

## Overview

ArtiPanel implements comprehensive, enterprise-grade security features to protect your server infrastructure. All security features are natively built-in with no external dependencies for core encryption.

## Security Modules

### 1. AES-256 Encryption (`/backend/src/security/encryption.ts`)

**Features:**
- AES-256-GCM authenticated encryption
- PBKDF2 key derivation (100,000 iterations)
- Secure random IV generation
- HMAC integrity verification
- Session token generation with SHA-256

**Key Functions:**
```typescript
// Encrypt data
const encrypted = encryption.encrypt(plaintext, masterKey);

// Decrypt data
const decrypted = encryption.decrypt(encrypted, masterKey);

// Hash password (one-way)
const hash = encryption.hashPassword(password);

// Verify password
const isValid = encryption.verifyPassword(password, hash);

// Generate secure tokens
const token = encryption.generateSecureToken(32);
```

**Security Specs:**
- Algorithm: AES-256-GCM (NIST approved)
- IV Length: 128 bits (cryptographically random)
- Key Derivation: PBKDF2-SHA256 (100,000 iterations)
- Authentication: 128-bit GCM tag for AEAD
- Session Tokens: 256-bit cryptographic random

**Use Cases:**
- Encrypt sensitive configuration files
- Protect API keys and secrets
- Secure database credentials
- Hash user passwords
- Generate session tokens

---

### 2. Two-Factor Authentication (2FA) (`/backend/src/security/2fa.ts`)

**Supported Methods:**
- TOTP (Time-based One-Time Password) - RFC 6238
- Email verification codes
- SMS verification codes
- Backup codes for account recovery

**Key Features:**
- 6-digit TOTP tokens
- 30-second time windows
- Configurable tolerance (±1-2 windows)
- 10 backup codes per user
- QR code provisioning URI

**Key Functions:**
```typescript
// Initialize 2FA for user
const config = twoFactorAuth.initialize2FA(accountName, issuer);

// Generate TOTP secret
const { secret, qrCode, backupCodes } = twoFactorAuth.generateTOTPSecret(accountName);

// Verify TOTP token
const isValid = twoFactorAuth.verifyTOTPToken(secret, token);

// Verify backup code
const result = twoFactorAuth.verifyBackupCode(backupCodes, code);

// Generate email verification code
const { code, expiresAt } = twoFactorAuth.generateEmailVerificationCode(email);
```

**Security Specs:**
- TOTP Algorithm: HMAC-SHA1
- Token Length: 6 digits
- Time Step: 30 seconds (RFC 6238)
- Backup Codes: 32-bit hex (8 characters)
- Code Expiry: 15 minutes (email), 10 minutes (SMS)

**Implementation:**
1. User enables 2FA and receives QR code
2. User scans QR code with authenticator app (Google Authenticator, Authy, etc.)
3. User enters TOTP token to confirm setup
4. User stores 10 backup codes in secure location
5. On future logins, user enters TOTP or backup code

---

### 3. SSL/TLS Certificate Management (`/backend/src/security/certificate.ts`)

**Capabilities:**
- Self-signed certificate generation
- Let's Encrypt integration (ACME v2)
- Automatic renewal detection (30 days before expiry)
- Certificate validation and fingerprinting
- Backup and restore functionality

**Key Functions:**
```typescript
// Generate self-signed certificate
certificate.generateSelfSignedCertificate(domain, keyPath, certPath);

// Load certificate
const certInfo = certificate.loadCertificate(certPath);

// Check if valid
const isValid = certificate.isCertificateValid(certInfo);

// Check if renewal needed
const needsRenewal = certificate.needsCertificateRenewal(certInfo);

// Get certificate summary
const summary = certificate.getCertificateSummary(certInfo);

// Backup certificate
certificate.backupCertificate(certPath, backupDir);
```

**Certificate Lifecycle:**
1. Generate initial self-signed certificate or request Let's Encrypt
2. ArtiPanel monitors certificate expiration
3. 30 days before expiry, renewal is triggered
4. Certificate is backed up before renewal
5. New certificate is generated and installed
6. Old certificate archived

**Support:**
- Self-signed certificates (for testing/staging)
- Let's Encrypt (free, automated renewal)
- Custom certificates (upload your own)
- Wildcard certificates
- Multi-domain (SAN) certificates

---

### 4. Automatic Updates (`/backend/src/security/updates.ts`)

**Features:**
- Scheduled update checking (24-hour intervals)
- Semantic version comparison
- Cryptographic package verification (SHA-256)
- Automatic backup before installation
- Rollback capability
- Progress tracking

**Key Functions:**
```typescript
// Check for updates
const versionInfo = await updates.checkForUpdates('stable');

// Download update
const packagePath = await updates.downloadUpdate(manifest, onProgress);

// Verify package integrity
const isValid = updates.verifyUpdatePackage(packagePath, checksum);

// Install update
const success = await updates.installUpdate(packagePath, onProgress);

// Rollback to previous version
const rolled = await updates.rollbackUpdate(onProgress);

// Schedule automatic checks
updates.scheduleUpdateChecks();
```

**Update Channels:**
- `stable` - Production-ready releases
- `beta` - Pre-release testing
- `dev` - Development snapshots

**Safety Features:**
- Full system backup before installation
- Checksum verification (SHA-256)
- Breaking change detection
- Minimum requirements checking
- Automatic rollback on failure
- Keep previous 5 backups

**Update Process:**
1. Check for newer version available
2. Download update package
3. Verify cryptographic signature
4. Backup current installation
5. Extract and install files
6. Run migrations if needed
7. Restart services
8. Verify new version running

---

### 5. Security Audit Logging (`/backend/src/security/auditLog.ts`)

**Event Categories:**
- Authentication (login, logout, 2FA setup/disable, challenges)
- Permission changes
- Data access/modification/deletion
- Certificate operations
- Update operations
- Encryption status changes
- Rate limit violations
- Suspicious activity

**Key Functions:**
```typescript
// Log security event
auditLog.logSecurityEvent(eventType, action, details, options);

// Log auth event
auditLog.logAuthEvent('auth-login', userId, username, ip, userAgent, 'success');

// Log permission change
auditLog.logPermissionChange(userId, changedBy, oldPerms, newPerms, ip);

// Log data modification
auditLog.logDataModification(userId, resource, changes, ip);

// Query audit logs
const logs = auditLog.queryAuditLogs({ eventType, userId, startDate, endDate });

// Export for compliance
const csv = auditLog.exportAuditLogs(startDate, endDate, 'csv');

// Verify integrity
const result = auditLog.verifyAuditLogIntegrity();

// Cleanup old logs
const deleted = auditLog.cleanupOldAuditLogs(90); // Keep 90 days
```

**Log Format:**
```json
{
  "id": "event-uuid",
  "timestamp": "2025-10-28T01:15:00Z",
  "eventType": "auth-login",
  "userId": "user-123",
  "username": "admin",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "resource": "dashboard",
  "action": "User logged in",
  "details": { "mfaUsed": true },
  "status": "success",
  "severity": "low",
  "signature": "sha256-hex"
}
```

**Compliance Features:**
- Tamper-proof integrity verification (SHA-256 signatures)
- Comprehensive event logging
- Long-term retention (90 days by default)
- Export to CSV for audits
- Role-based event filtering
- Automatic cleanup of old logs

**Event Severity Levels:**
- `critical`: Certificate revoked, 2FA disabled, encryption disabled
- `high`: Data deleted, permissions changed, suspicious activity
- `medium`: Data modified, update failed, rate limits exceeded
- `low`: Data accessed, user logged in

---

### 6. Rate Limiting & DDoS Protection (`/backend/src/security/rateLimiting.ts`)

**Protection Mechanisms:**
- Token bucket algorithm for rate limiting
- Per-IP rate limiting
- Adaptive rate limiting (threat-based)
- IP blocking (temporary/permanent)
- Request fingerprinting
- Anomaly detection

**Key Functions:**
```typescript
// Initialize rate limiting
rateLimiting.initializeRateLimiting();

// Check rate limit
const check = rateLimiting.checkRateLimit(ipAddress, config);
if (!check.allowed) {
  res.status(429).send(`Try again in ${check.resetTime}s`);
}

// Block IP
rateLimiting.blockIP({
  ipAddress: '192.168.1.100',
  reason: 'Brute force attempt',
  duration: 24 * 60 * 60 * 1000 // 24 hours
});

// Get DDoS metrics
const metrics = rateLimiting.getDDoSMetrics();

// Get adaptive rate limit
const adaptiveConfig = rateLimiting.getAdaptiveRateLimit(ipAddress, threatLevel);
```

**Rate Limit Configuration:**
```typescript
// Default: 100 requests per 15 minutes
const config = {
  windowMs: 15 * 60 * 1000,  // 15 minutes
  maxRequests: 100,
  statusCode: 429,
  message: 'Too many requests'
};

// Adaptive based on threat:
// High threat (>70%): 10 req/5 min
// Medium threat (40-70%): 30 req/10 min
// Low threat (<40%): 100 req/15 min
```

**Threat Detection:**
- Rapid request patterns
- Failed 2FA attempts
- User agent anomalies
- Geographic anomalies
- Unusual access patterns

**IP Blocking:**
- Automatic blocking after multiple violations
- Manual blocking with custom duration
- Permanent blacklist capability
- Automatic cleanup of expired blocks
- Whitelist support (for trusted IPs)

---

## Security Architecture

### Layered Defense

```
┌─────────────────────────────────────────────┐
│ Rate Limiting & DDoS Protection            │ Layer 1: Request Filtering
├─────────────────────────────────────────────┤
│ SSL/TLS & Certificate Management           │ Layer 2: Transport Security
├─────────────────────────────────────────────┤
│ Authentication & 2FA                       │ Layer 3: Identity & Access
├─────────────────────────────────────────────┤
│ AES-256 Encryption & Session Management    │ Layer 4: Data Protection
├─────────────────────────────────────────────┤
│ Audit Logging & Anomaly Detection          │ Layer 5: Monitoring & Response
├─────────────────────────────────────────────┤
│ Automatic Updates & Patch Management       │ Layer 6: Continuous Hardening
└─────────────────────────────────────────────┘
```

### Key Management Strategy

1. **Master Key Derivation**
   - Environment-based master key
   - PBKDF2 with 100,000 iterations
   - Stored in secure configuration

2. **Session Tokens**
   - 256-bit cryptographic random
   - Hashed before storage
   - Short-lived (15 minutes default)
   - Automatic rotation

3. **API Keys**
   - Rate-limited usage tracking
   - Revocation capability
   - Audit logging
   - Automatic expiration

### Data Protection at Rest

- All sensitive data encrypted with AES-256-GCM
- Passwords hashed with PBKDF2 (one-way)
- Configuration encrypted in database
- Backups encrypted

### Data Protection in Transit

- TLS 1.3+ enforced
- Perfect forward secrecy
- Certificate pinning support
- HSTS headers

---

## Implementation Guide

### 1. Enable Security on Startup

```typescript
import { security } from './security';

// Initialize all security systems
security.initializeSecuritySystems();

// Get security status
console.log(security.getSecurityStatus());
```

### 2. Protect Authentication Routes

```typescript
import { rateLimiting, auditLog, encryption, twoFactorAuth } from './security';

app.post('/api/auth/login', (req, res) => {
  const ip = req.ip;
  
  // Check rate limit
  const limit = rateLimiting.checkRateLimit(ip);
  if (!limit.allowed) {
    auditLog.logAuthEvent('auth-failed', userId, username, ip, req.get('user-agent'), 'failure');
    return res.status(429).json({ error: 'Too many attempts' });
  }

  // Authenticate user
  const user = authenticateUser(req.body);
  if (!user) {
    auditLog.logAuthEvent('auth-failed', req.body.username, req.body.username, ip, req.get('user-agent'), 'failure');
    rateLimiting.blockIP({
      ipAddress: ip,
      reason: 'Failed login attempt',
      duration: 15 * 60 * 1000 // 15 minutes
    });
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Check 2FA
  if (user.twoFactorConfig?.enabled) {
    // User needs to complete 2FA challenge
    const challenge = twoFactorAuth.create2FAChallenge(user.id, '2fa');
    return res.status(200).json({ twoFactorRequired: true, challenge: challenge.challenge });
  }

  // Generate session token
  const { token, hash } = encryption.createSessionToken();
  
  // Log successful login
  auditLog.logAuthEvent('auth-login', user.id, user.username, ip, req.get('user-agent'), 'success');
  
  res.json({ token, user });
});
```

### 3. Encrypt Sensitive Configuration

```typescript
import { encryption } from './security';

const config = {
  databaseUrl: 'postgres://...',
  apiSecret: 'secret-key',
  awsKey: 'aws-key'
};

// Encrypt sensitive fields
const encrypted = encryption.encryptSensitiveData(
  config,
  process.env.MASTER_KEY,
  ['databaseUrl', 'apiSecret', 'awsKey']
);

// Store encrypted config
fs.writeFileSync('config.encrypted.json', JSON.stringify(encrypted));

// Later, decrypt when needed
const decrypted = encryption.decryptSensitiveData(
  encrypted,
  process.env.MASTER_KEY,
  ['databaseUrl', 'apiSecret', 'awsKey']
);
```

### 4. Audit Security-Sensitive Operations

```typescript
import { auditLog } from './security';

// Log data deletion
auditLog.logDataDeletion(req.user.id, 'servers', serverId, req.ip);

// Log permission change
auditLog.logPermissionChange(adminId, req.user.id, oldPerms, newPerms, req.ip);

// Export compliance report
const report = auditLog.exportAuditLogs(
  new Date('2025-01-01'),
  new Date('2025-12-31'),
  'csv'
);
fs.writeFileSync('compliance-2025.csv', report);
```

---

## Security Best Practices

### Configuration

1. **Use Strong Master Key**
   ```bash
   MASTER_KEY=$(openssl rand -base64 32)
   ```

2. **Enable 2FA for All Admin Users**
   ```typescript
   user.twoFactorConfig = twoFactorAuth.initialize2FA(user.email);
   // Force confirmation within 24 hours
   ```

3. **Use HTTPS Everywhere**
   ```typescript
   const cert = certificate.loadCertificate('/path/to/cert.pem');
   if (certificate.needsCertificateRenewal(cert)) {
     // Auto-renew
   }
   ```

### Operational

1. **Monitor Audit Logs Regularly**
   ```typescript
   // Weekly review of security events
   const logs = auditLog.queryAuditLogs({
     eventType: 'suspicious-activity',
     startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
   });
   ```

2. **Check for Blocked IPs**
   ```typescript
   const blocked = rateLimiting.getBlockedIPs();
   console.log(`Currently blocked: ${blocked.length} IPs`);
   ```

3. **Review Failed Authentication Attempts**
   ```typescript
   const failedLogins = auditLog.queryAuditLogs({
     eventType: 'auth-failed',
     startDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
   });
   ```

### Development

1. **Never commit secrets to git**
   - Use `.env` files (not in git)
   - Use environment variables in production
   - Rotate secrets regularly

2. **Use separate keys for different environments**
   - Development: weak keys (for testing)
   - Staging: medium keys
   - Production: strong keys from key management service

3. **Test security features regularly**
   - Penetration testing
   - Fuzzing
   - Security code reviews

---

## Compliance

ArtiPanel's security implementation helps meet:

- **GDPR**: Encryption, audit logs, data retention policies
- **HIPAA**: Audit logging, access controls, encryption
- **SOC 2**: Logging, monitoring, incident response
- **PCI DSS**: Encryption, rate limiting, access controls
- **ISO 27001**: Information security management

---

## Future Enhancements

- Hardware security module (HSM) integration
- FIDO2/WebAuthn support for 2FA
- Zero-knowledge proofs for authentication
- Machine learning-based anomaly detection
- Biometric authentication
- Decentralized key management

---

## Support & Reporting

For security issues, please report responsibly to: **security@artipanel.dev**

Do NOT create public issues for security vulnerabilities.

---

**Last Updated**: October 28, 2025
**Version**: 1.0.0
**Security Level**: Enterprise Grade
