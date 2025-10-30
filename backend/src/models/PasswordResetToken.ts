/**
 * Password Reset Token Model
 * 
 * Manages password reset tokens with expiration
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import logger from '../utils/logger';

const DATA_DIR = process.env.DATA_DIR || './storage';
const TOKENS_FILE = path.join(DATA_DIR, 'reset-tokens.json');

export interface PasswordResetToken {
  id: string;
  userId: string;
  token: string;
  createdAt: string;
  expiresAt: string; // 15 minutes from creation
  isUsed: boolean;
}

export interface ResetTokensFilePayload {
  tokens: PasswordResetToken[];
  lastModified: string;
}

// Generate a secure random token
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Create a new password reset token
export function createResetToken(userId: string): PasswordResetToken {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now
  
  return {
    id: crypto.randomUUID(),
    userId,
    token: generateResetToken(),
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    isUsed: false,
  };
}

// Read tokens from disk
export async function readTokensFromDisk(): Promise<PasswordResetToken[]> {
  try {
    const data = await fs.readFile(TOKENS_FILE, 'utf-8');
    const payload: ResetTokensFilePayload = JSON.parse(data);
    return payload.tokens;
  } catch (error) {
    // File doesn't exist or is invalid, return empty array
    logger.info('Reset tokens file not found or invalid, initializing empty array');
    return [];
  }
}

// Write tokens to disk
export async function writeTokensToDisk(tokens: PasswordResetToken[]): Promise<void> {
  try {
    const payload: ResetTokensFilePayload = {
      tokens,
      lastModified: new Date().toISOString(),
    };
    
    // Ensure directory exists
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    await fs.writeFile(TOKENS_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    logger.info('Reset tokens written to disk');
  } catch (error) {
    logger.error('Failed to write reset tokens to disk', error);
    throw error;
  }
}

// Create and store a new password reset token
export async function storeResetToken(userId: string): Promise<PasswordResetToken> {
  const tokens = await readTokensFromDisk();
  const newToken = createResetToken(userId);
  
  // Remove expired tokens from the same user
  const activeTokens = tokens.filter(t => {
    const isExpired = new Date(t.expiresAt) < new Date();
    const isDifferentUser = t.userId !== userId;
    return !isExpired && isDifferentUser;
  });
  
  // Add the new token
  activeTokens.push(newToken);
  
  await writeTokensToDisk(activeTokens);
  logger.info(`Reset token created for user ${userId}`);
  
  return newToken;
}

// Verify a reset token
export async function verifyResetToken(token: string): Promise<PasswordResetToken | null> {
  const tokens = await readTokensFromDisk();
  
  const resetToken = tokens.find(t => t.token === token);
  
  if (!resetToken) {
    logger.info('Reset token not found');
    return null;
  }
  
  // Check if token is expired
  if (new Date(resetToken.expiresAt) < new Date()) {
    logger.info('Reset token expired');
    return null;
  }
  
  // Check if token has already been used
  if (resetToken.isUsed) {
    logger.info('Reset token already used');
    return null;
  }
  
  return resetToken;
}

// Mark token as used
export async function markTokenAsUsed(token: string): Promise<void> {
  const tokens = await readTokensFromDisk();
  
  const tokenIndex = tokens.findIndex(t => t.token === token);
  if (tokenIndex !== -1) {
    tokens[tokenIndex].isUsed = true;
    await writeTokensToDisk(tokens);
    logger.info('Reset token marked as used');
  }
}

// Clean up expired tokens
export async function cleanupExpiredTokens(): Promise<void> {
  try {
    const tokens = await readTokensFromDisk();
    const now = new Date();
    
    const activeTokens = tokens.filter(t => new Date(t.expiresAt) > now);
    
    if (activeTokens.length < tokens.length) {
      await writeTokensToDisk(activeTokens);
      logger.info(`Cleaned up ${tokens.length - activeTokens.length} expired reset tokens`);
    }
  } catch (error) {
    logger.error('Failed to cleanup expired tokens', error);
  }
}
