/**
 * JWT Token Management
 * 
 * Handles generation, validation, and refresh of JWT tokens
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import logger from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'artipanel-secret-key-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

export interface TokenPayload {
  userId: string;
  username: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate JWT access token
 */
export function generateAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  try {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
      algorithm: 'HS256',
    });
  } catch (error: any) {
    logger.error('Failed to generate access token', error);
    throw error;
  }
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(userId: string): string {
  try {
    const tokenId = crypto.randomBytes(16).toString('hex');
    return jwt.sign({ userId, tokenId }, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
      algorithm: 'HS256',
    });
  } catch (error: any) {
    logger.error('Failed to generate refresh token', error);
    throw error;
  }
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    }) as TokenPayload;
    return decoded;
  } catch (error: any) {
    logger.debug('Token verification failed', error.message);
    return null;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): { userId: string; tokenId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    }) as any;
    return { userId: decoded.userId, tokenId: decoded.tokenId };
  } catch (error: any) {
    logger.debug('Refresh token verification failed', error.message);
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  return parts[1];
}
