/**
 * Advanced Rate Limiting & DDoS Protection
 * Implements token bucket algorithm, IP blocking, request fingerprinting
 */

import crypto from 'crypto';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message: string;
  statusCode: number;
}

export interface IPBlockConfig {
  ipAddress: string;
  reason: string;
  duration: number; // in milliseconds
  permanent?: boolean;
}

export interface RequestFingerprint {
  ip: string;
  userAgent: string;
  acceptLanguage: string;
  tlsVersion?: string;
}

export interface DDoSMetrics {
  requestCount: number;
  uniqueIPs: number;
  blockedIPs: number;
  suspiciousPatterns: number;
  averageResponseTime: number;
}

const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many requests, please try again later.',
  statusCode: 429,
};

// Store for rate limit buckets: IP -> { tokens: number; lastRefill: number }
const tokenBuckets = new Map<string, { tokens: number; lastRefill: number }>();

// Store for IP blocks: IP -> { expiresAt: number; reason: string; permanent: boolean }
const ipBlockList = new Map<string, { expiresAt: number; reason: string; permanent: boolean }>();

// Store for request fingerprints (for anomaly detection)
const requestFingerprints = new Map<string, RequestFingerprint[]>();

// DDoS metrics
const metricsWindow = new Map<string, number>();

/**
 * Initialize rate limiting
 */
export function initializeRateLimiting(): void {
  // Cleanup expired IP blocks every hour
  setInterval(() => {
    cleanupExpiredBlocks();
  }, 60 * 60 * 1000);

  // Reset metrics every hour
  setInterval(() => {
    metricsWindow.clear();
  }, 60 * 60 * 1000);
}

/**
 * Check rate limit for IP address using token bucket algorithm
 */
export function checkRateLimit(ipAddress: string, config: RateLimitConfig = DEFAULT_RATE_LIMIT_CONFIG): { allowed: boolean; remaining: number; resetTime: number } {
  // Check if IP is blocked
  if (isIPBlocked(ipAddress)) {
    return { allowed: false, remaining: 0, resetTime: 0 };
  }

  const now = Date.now();
  let bucket = tokenBuckets.get(ipAddress);

  if (!bucket) {
    bucket = { tokens: config.maxRequests, lastRefill: now };
    tokenBuckets.set(ipAddress, bucket);
  }

  // Refill tokens based on elapsed time
  const elapsedTime = now - bucket.lastRefill;
  const refillRate = config.maxRequests / config.windowMs;
  const tokensToAdd = (elapsedTime * refillRate) / 1000;

  bucket.tokens = Math.min(config.maxRequests, bucket.tokens + tokensToAdd);
  bucket.lastRefill = now;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return {
      allowed: true,
      remaining: Math.floor(bucket.tokens),
      resetTime: Math.ceil((config.windowMs - elapsedTime) / 1000),
    };
  }

  // Calculate reset time
  const tokensNeeded = 1 - bucket.tokens;
  const resetTime = Math.ceil((tokensNeeded / refillRate) * 1000);

  return { allowed: false, remaining: 0, resetTime: Math.ceil(resetTime / 1000) };
}

/**
 * Block an IP address
 */
export function blockIP(config: IPBlockConfig): void {
  const expiresAt = config.permanent ? Number.MAX_SAFE_INTEGER : Date.now() + config.duration;

  ipBlockList.set(config.ipAddress, {
    expiresAt,
    reason: config.reason,
    permanent: config.permanent || false,
  });
}

/**
 * Unblock an IP address
 */
export function unblockIP(ipAddress: string): boolean {
  return ipBlockList.delete(ipAddress);
}

/**
 * Check if IP is blocked
 */
export function isIPBlocked(ipAddress: string): boolean {
  const block = ipBlockList.get(ipAddress);
  if (!block) return false;

  if (block.expiresAt <= Date.now() && !block.permanent) {
    ipBlockList.delete(ipAddress);
    return false;
  }

  return true;
}

/**
 * Get IP block info
 */
export function getIPBlockInfo(ipAddress: string): { reason: string; expiresAt: Date; permanent: boolean } | null {
  const block = ipBlockList.get(ipAddress);
  if (!block || (!block.permanent && block.expiresAt <= Date.now())) {
    return null;
  }

  return {
    reason: block.reason,
    expiresAt: new Date(block.expiresAt),
    permanent: block.permanent,
  };
}

/**
 * Get all blocked IPs
 */
export function getBlockedIPs(): Array<{ ip: string; reason: string; expiresAt: Date; permanent: boolean }> {
  const blocked: Array<{ ip: string; reason: string; expiresAt: Date; permanent: boolean }> = [];

  for (const [ip, block] of ipBlockList.entries()) {
    if (block.permanent || block.expiresAt > Date.now()) {
      blocked.push({
        ip,
        reason: block.reason,
        expiresAt: new Date(block.expiresAt),
        permanent: block.permanent,
      });
    }
  }

  return blocked;
}

/**
 * Generate request fingerprint for anomaly detection
 */
export function generateRequestFingerprint(headers: Record<string, any>): RequestFingerprint {
  return {
    ip: headers['x-forwarded-for'] || headers['x-real-ip'] || headers['remote-addr'] || 'unknown',
    userAgent: headers['user-agent'] || 'unknown',
    acceptLanguage: headers['accept-language'] || 'unknown',
    tlsVersion: headers['tls-version'],
  };
}

/**
 * Create fingerprint hash for comparison
 */
export function hashFingerprint(fingerprint: RequestFingerprint): string {
  const data = `${fingerprint.ip}|${fingerprint.userAgent}|${fingerprint.acceptLanguage}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Track request fingerprint
 */
export function trackRequestFingerprint(fingerprint: RequestFingerprint): void {
  const hash = hashFingerprint(fingerprint);
  const prints = requestFingerprints.get(hash) || [];

  prints.push(fingerprint);

  // Keep only last 100 prints per hash
  if (prints.length > 100) {
    prints.shift();
  }

  requestFingerprints.set(hash, prints);
}

/**
 * Detect suspicious patterns
 */
export function detectSuspiciousPatterns(ipAddress: string): { suspicious: boolean; patterns: string[]; riskScore: number } {
  const patterns: string[] = [];
  let riskScore = 0;

  const bucket = tokenBuckets.get(ipAddress);
  if (bucket) {
    // Check for rapid request pattern
    const elapsedTime = Date.now() - bucket.lastRefill;
    if (elapsedTime < 1000 && bucket.tokens < 1) {
      patterns.push('rapid-requests');
      riskScore += 25;
    }
  }

  // Check for multiple failed 2FA attempts
  // This would be tracked separately in auth module
  // patterns.push('multiple-2fa-failures');
  // riskScore += 30;

  // Check for unusual user agent changes
  // This would be tracked separately
  // patterns.push('user-agent-anomaly');
  // riskScore += 20;

  return {
    suspicious: riskScore > 50,
    patterns,
    riskScore,
  };
}

/**
 * Implement adaptive rate limiting based on threat level
 */
export function getAdaptiveRateLimit(ipAddress: string, baseThreatLevel: number = 0): RateLimitConfig {
  const suspicious = detectSuspiciousPatterns(ipAddress);
  const threatLevel = baseThreatLevel + (suspicious.riskScore / 100) * 0.5;

  let config = { ...DEFAULT_RATE_LIMIT_CONFIG };

  if (threatLevel > 0.7) {
    // High threat: very strict limits
    config.maxRequests = 10;
    config.windowMs = 5 * 60 * 1000; // 5 minutes
  } else if (threatLevel > 0.4) {
    // Medium threat: moderate limits
    config.maxRequests = 30;
    config.windowMs = 10 * 60 * 1000; // 10 minutes
  } else if (threatLevel > 0.2) {
    // Low threat: normal limits
    config.maxRequests = 100;
    config.windowMs = 15 * 60 * 1000; // 15 minutes
  }

  return config;
}

/**
 * Get DDoS metrics
 */
export function getDDoSMetrics(): DDoSMetrics {
  let requestCount = 0;
  const uniqueIPs = new Set<string>();
  let blockedIPCount = 0;
  let suspiciousCount = 0;
  let totalResponseTime = 0;
  let responseTimeCount = 0;

  for (const [ip] of tokenBuckets.entries()) {
    requestCount++;
    uniqueIPs.add(ip);

    if (isIPBlocked(ip)) {
      blockedIPCount++;
    }

    const suspicious = detectSuspiciousPatterns(ip);
    if (suspicious.suspicious) {
      suspiciousCount++;
    }
  }

  // Calculate average response time (would be tracked separately in practice)
  const averageResponseTime = responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0;

  return {
    requestCount,
    uniqueIPs: uniqueIPs.size,
    blockedIPs: blockedIPCount,
    suspiciousPatterns: suspiciousCount,
    averageResponseTime,
  };
}

/**
 * Cleanup expired IP blocks
 */
function cleanupExpiredBlocks(): void {
  const now = Date.now();
  for (const [ip, block] of ipBlockList.entries()) {
    if (!block.permanent && block.expiresAt <= now) {
      ipBlockList.delete(ip);
    }
  }
}

/**
 * Reset rate limit for IP (admin function)
 */
export function resetRateLimit(ipAddress: string): boolean {
  return tokenBuckets.delete(ipAddress);
}

/**
 * Get rate limit status for IP
 */
export function getRateLimitStatus(ipAddress: string, config: RateLimitConfig = DEFAULT_RATE_LIMIT_CONFIG): Record<string, any> {
  const bucket = tokenBuckets.get(ipAddress);
  const check = checkRateLimit(ipAddress, config);

  return {
    ipAddress,
    isBlocked: isIPBlocked(ipAddress),
    rateLimitAllowed: check.allowed,
    remainingRequests: check.remaining,
    resetInSeconds: check.resetTime,
    tokensInBucket: bucket ? Math.floor(bucket.tokens) : config.maxRequests,
    suspicious: detectSuspiciousPatterns(ipAddress),
  };
}

export default {
  initializeRateLimiting,
  checkRateLimit,
  blockIP,
  unblockIP,
  isIPBlocked,
  getIPBlockInfo,
  getBlockedIPs,
  generateRequestFingerprint,
  hashFingerprint,
  trackRequestFingerprint,
  detectSuspiciousPatterns,
  getAdaptiveRateLimit,
  getDDoSMetrics,
  resetRateLimit,
  getRateLimitStatus,
};
