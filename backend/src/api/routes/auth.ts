import { Router, Request, Response, NextFunction } from 'express';
import logger from '../../utils/logger';
import {
  createUser,
  authenticateUser,
  hasAdminUser,
  getUserById,
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

export default router;
