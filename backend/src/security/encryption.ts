/**
 * AES-256 Encryption Module
 * Provides secure encryption/decryption with IV, salt, and HMAC verification
 */

import crypto from 'crypto';
import { Buffer } from 'buffer';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 16;
const PBKDF2_ITERATIONS = 100000;

export interface EncryptedData {
  iv: string;
  ciphertext: string;
  authTag: string;
  salt: string;
}

export interface DecryptedData {
  success: boolean;
  data?: string;
  error?: string;
}

/**
 * Derive a key from a password using PBKDF2
 */
export function deriveKey(password: string, salt: Buffer = crypto.randomBytes(SALT_LENGTH)): { key: Buffer; salt: Buffer } {
  const key = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256');
  return { key, salt };
}

/**
 * Encrypt data using AES-256-GCM with authentication
 */
export function encrypt(plaintext: string, masterKey: string | Buffer): EncryptedData {
  try {
    // Derive key from master key
    let key: Buffer;
    let salt: Buffer;

    if (typeof masterKey === 'string') {
      const derived = deriveKey(masterKey);
      key = derived.key;
      salt = derived.salt;
    } else {
      key = masterKey;
      salt = Buffer.alloc(SALT_LENGTH);
    }

    // Generate random IV
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt data
    let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
    ciphertext += cipher.final('hex');

    // Get authentication tag
    const authTag = cipher.getAuthTag();

    return {
      iv: iv.toString('hex'),
      ciphertext,
      authTag: authTag.toString('hex'),
      salt: salt.toString('hex'),
    };
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypt data using AES-256-GCM with authentication verification
 */
export function decrypt(encryptedData: EncryptedData, masterKey: string | Buffer): DecryptedData {
  try {
    // Derive key from master key and salt
    let key: Buffer;

    if (typeof masterKey === 'string') {
      const salt = Buffer.from(encryptedData.salt, 'hex');
      const derived = deriveKey(masterKey, salt);
      key = derived.key;
    } else {
      key = masterKey;
    }

    // Convert hex strings to buffers
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const ciphertext = Buffer.from(encryptedData.ciphertext, 'hex');
    const authTag = Buffer.from(encryptedData.authTag, 'hex');

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    // Decrypt data
    let plaintext = decipher.update(ciphertext, 'hex', 'utf8');
    plaintext += decipher.final('utf8') as any;

    return {
      success: true,
      data: plaintext,
    };
  } catch (error) {
    return {
      success: false,
      error: `Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Generate a cryptographically secure random string
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash password with bcrypt-like behavior using PBKDF2
 */
export function hashPassword(password: string, rounds: number = 100000): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const hash = crypto.pbkdf2Sync(password, salt, rounds, KEY_LENGTH, 'sha256');
  return `${salt.toString('hex')}$${hash.toString('hex')}`;
}

/**
 * Verify password against hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  try {
    const [saltHex, hashHex] = hash.split('$');
    const salt = Buffer.from(saltHex, 'hex');
    const storedHash = Buffer.from(hashHex, 'hex');
    const derivedHash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256');
    return crypto.timingSafeEqual(derivedHash, storedHash);
  } catch {
    return false;
  }
}

/**
 * Generate HMAC for integrity verification
 */
export function generateHMAC(data: string, key: string): string {
  return crypto.createHmac('sha256', key).update(data).digest('hex');
}

/**
 * Verify HMAC integrity
 */
export function verifyHMAC(data: string, hmac: string, key: string): boolean {
  const computedHmac = generateHMAC(data, key);
  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(computedHmac));
}

/**
 * Create a secure session token
 */
export function createSessionToken(): { token: string; hash: string } {
  const token = generateSecureToken(64);
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hash };
}

/**
 * Encrypt sensitive data at rest
 */
export function encryptSensitiveData(data: Record<string, any>, masterKey: string, fieldsToEncrypt: string[]): Record<string, any> {
  const encrypted = { ...data };

  for (const field of fieldsToEncrypt) {
    if (field in encrypted && encrypted[field]) {
      const encryptedField = encrypt(JSON.stringify(encrypted[field]), masterKey);
      encrypted[field] = encryptedField;
    }
  }

  return encrypted;
}

/**
 * Decrypt sensitive data at rest
 */
export function decryptSensitiveData(data: Record<string, any>, masterKey: string, fieldsToDecrypt: string[]): Record<string, any> {
  const decrypted = { ...data };

  for (const field of fieldsToDecrypt) {
    if (field in decrypted && decrypted[field] && typeof decrypted[field] === 'object') {
      const result = decrypt(decrypted[field] as EncryptedData, masterKey);
      if (result.success && result.data) {
        try {
          decrypted[field] = JSON.parse(result.data);
        } catch {
          decrypted[field] = result.data;
        }
      }
    }
  }

  return decrypted;
}

export default {
  encrypt,
  decrypt,
  deriveKey,
  generateSecureToken,
  hashPassword,
  verifyPassword,
  generateHMAC,
  verifyHMAC,
  createSessionToken,
  encryptSensitiveData,
  decryptSensitiveData,
};
