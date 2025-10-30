/**
 * Password Strength Meter
 * 
 * Evaluates password strength and provides feedback
 */

export interface PasswordStrengthResult {
  score: number; // 0-5
  strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  feedback: string[];
  isValid: boolean;
}

/**
 * Evaluate password strength
 * @param password - The password to evaluate
 * @returns Password strength result with score and feedback
 */
export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const feedback: string[] = [];
  let score = 0;

  // Minimum length requirement (8 characters)
  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
  } else if (password.length < 12) {
    score += 1;
  } else if (password.length < 16) {
    score += 2;
  } else {
    score += 3;
  }

  // Check for uppercase letters
  if (/[A-Z]/.test(password)) {
    score += 1;
    feedback.push('✓ Contains uppercase letters');
  } else {
    feedback.push('Add uppercase letters (A-Z)');
  }

  // Check for lowercase letters
  if (/[a-z]/.test(password)) {
    score += 1;
    feedback.push('✓ Contains lowercase letters');
  } else {
    feedback.push('Add lowercase letters (a-z)');
  }

  // Check for numbers
  if (/[0-9]/.test(password)) {
    score += 1;
    feedback.push('✓ Contains numbers');
  } else {
    feedback.push('Add numbers (0-9)');
  }

  // Check for special characters
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 2;
    feedback.push('✓ Contains special characters');
  } else {
    feedback.push('Add special characters (!@#$%^&*, etc.)');
  }

  // Check for common patterns
  if (/(.)\1{2,}/.test(password)) {
    score -= 1;
    feedback.push('Avoid repeating characters (aaa, 111, etc.)');
  }

  // Check for common sequences
  if (/abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789|890/i.test(password)) {
    score -= 1;
    feedback.push('Avoid sequential characters (abc, 123, etc.)');
  }

  // Normalize score to 0-5 range
  score = Math.max(0, Math.min(5, score));
  const isValid = password.length >= 8;

  let strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  if (score === 0) strength = 'very-weak';
  else if (score === 1) strength = 'weak';
  else if (score === 2) strength = 'fair';
  else if (score === 3) strength = 'good';
  else if (score === 4) strength = 'strong';
  else strength = 'very-strong';

  return {
    score,
    strength,
    feedback,
    isValid,
  };
}

/**
 * Get color for password strength
 */
export function getStrengthColor(strength: string): string {
  switch (strength) {
    case 'very-weak':
    case 'weak':
      return '#ef4444'; // red
    case 'fair':
      return '#f97316'; // orange
    case 'good':
      return '#eab308'; // yellow
    case 'strong':
      return '#84cc16'; // lime
    case 'very-strong':
      return '#22c55e'; // green
    default:
      return '#6b7280'; // gray
  }
}

/**
 * Get label for password strength
 */
export function getStrengthLabel(strength: string): string {
  switch (strength) {
    case 'very-weak':
      return 'Very Weak';
    case 'weak':
      return 'Weak';
    case 'fair':
      return 'Fair';
    case 'good':
      return 'Good';
    case 'strong':
      return 'Strong';
    case 'very-strong':
      return 'Very Strong';
    default:
      return 'Unknown';
  }
}
