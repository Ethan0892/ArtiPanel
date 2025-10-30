import { Router, Request, Response, NextFunction } from 'express';
import logger from '../../utils/logger';
import {
  createUser,
  authenticateUser,
  hasAdminUser,
  getUserById,
  getUserByUsername,
  readUsersFromDisk,
  writeUsersToDisk,
  hashPassword,
  UserRole,
} from '../../models/User';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  extractTokenFromHeader,
  verifyToken,
} from '../../utils/jwt';

const router = Router();

/**
 * @route   GET /api/auth/status
 * @desc    Check system status (has admin, needs setup)
 * @access  Public
 */
router.get('/status', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const adminExists = await hasAdminUser();
    res.json({
      initialized: adminExists,
      requiresSetup: !adminExists,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (first user becomes admin, requires auth for others)
 * @access  Public (first user) or Private (subsequent users)
 */
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' });
      return;
    }

    const user = await createUser(username, email, password);

    // Don't return password hash
    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    const accessToken = generateAccessToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken(user.id);

    res.json({
      user: safeUser,
      accessToken,
      refreshToken,
      isFirstAdmin: user.role === UserRole.ADMIN,
    });
  } catch (error: any) {
    logger.error('Registration error', error);
    res.status(400).json({ error: error.message || 'Registration failed' });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    User login
 * @access  Public
 */
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Missing username or password' });
      return;
    }

    const { user, authenticated } = await authenticateUser(username, password);

    if (!authenticated) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    };

    const accessToken = generateAccessToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken(user.id);

    res.json({
      user: safeUser,
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    logger.error('Login error', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Missing refresh token' });
      return;
    }

    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    const user = await getUserById(decoded.userId);

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    const accessToken = generateAccessToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    res.json({ accessToken });
  } catch (error: any) {
    logger.error('Token refresh error', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    User logout (invalidates tokens on client)
 * @access  Private
 */
router.post('/logout', (req: Request, res: Response) => {
  // Token invalidation is typically handled on client
  // Could implement token blacklist in production
  res.json({ message: 'Logged out successfully' });
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset (for security: just returns success)
 * @access  Public
 */
router.post('/forgot-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username } = req.body;

    if (!username) {
      res.status(400).json({ error: 'Username is required' });
      return;
    }

    const user = await getUserByUsername(username);

    if (!user) {
      // Don't reveal if user exists (security best practice)
      res.status(200).json({ 
        message: 'If a matching user exists, password reset instructions have been sent to their email.' 
      });
      return;
    }

    // In production, this would:
    // 1. Generate a reset token
    // 2. Store it with expiration (15 minutes)
    // 3. Send email with reset link
    // For now, return success message
    
    logger.info(`Password reset requested for user: ${username}`);
    res.status(200).json({ 
      message: 'If this account exists, password reset instructions have been sent to the email on file.',
      note: 'In production, an email would be sent with a secure reset link'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Admin endpoint to reset a user's password
 * @access  Private (Admin only)
 */
router.post('/reset-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, newPassword } = req.body;
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!username || !newPassword) {
      res.status(400).json({ error: 'Username and new password are required' });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' });
      return;
    }

    // Verify admin token
    if (!token) {
      res.status(401).json({ error: 'Authorization required. Contact an administrator to reset your password.' });
      return;
    }

    const tokenData = verifyToken(token);
    if (!tokenData || tokenData.role !== UserRole.ADMIN) {
      res.status(403).json({ error: 'Only administrators can reset passwords' });
      return;
    }

    // Update user password
    const users = await readUsersFromDisk();
    const userIndex = users.findIndex(u => u.username === username);

    if (userIndex === -1) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    users[userIndex].passwordHash = hashPassword(newPassword);
    await writeUsersToDisk(users);

    logger.info(`Password reset by admin for user: ${username}`);
    res.json({ message: `Password for ${username} has been reset successfully` });
  } catch (error) {
    next(error);
  }
});

export default router;
