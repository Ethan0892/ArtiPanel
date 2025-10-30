/**
 * Admin Users Management Route
 * 
 * Endpoints for admins to manage users: create, list, update, delete
 * Requires admin authentication
 */

import { Router, Request, Response, NextFunction } from 'express';
import logger from '../../utils/logger';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUserRole,
  deactivateUser,
  deleteUser,
  UserRole,
  User,
} from '../../models/User';
import { verifyToken, extractTokenFromHeader } from '../../utils/jwt';

const router = Router();

// Middleware: verify admin authorization
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    res.status(401).json({ error: 'Missing authorization token' });
    return;
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  if (decoded.role !== UserRole.ADMIN) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  (req as any).user = decoded;
  next();
};

// Remove sensitive fields from user object
function sanitizeUser(user: User) {
  const { passwordHash, ...safe } = user;
  return safe;
}

/**
 * @route   GET /api/admin/users
 * @desc    List all users
 * @access  Admin
 */
router.get('/', requireAdmin, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await getAllUsers();
    const sanitized = users.map(sanitizeUser);
    res.json({ users: sanitized });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user by ID
 * @access  Admin
 */
router.get('/:id', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getUserById(req.params.id);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/admin/users
 * @desc    Create new user
 * @access  Admin
 */
router.post('/', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' });
      return;
    }

    const validRole = Object.values(UserRole).includes(role) ? role : UserRole.USER;
    const user = await createUser(username, email, password, validRole);

    res.status(201).json({
      user: sanitizeUser(user),
      message: 'User created successfully',
    });
  } catch (error: any) {
    logger.error('User creation error', error);
    res.status(400).json({ error: error.message || 'Failed to create user' });
  }
});

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Update user role
 * @access  Admin
 */
router.put('/:id/role', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body;

    if (!Object.values(UserRole).includes(role)) {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }

    const updatedUser = await updateUserRole(req.params.id, role);

    res.json({
      user: sanitizeUser(updatedUser),
      message: 'User role updated successfully',
    });
  } catch (error: any) {
    logger.error('Update role error', error);
    res.status(400).json({ error: error.message || 'Failed to update role' });
  }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user
 * @access  Admin
 */
router.delete('/:id', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUser = (req as any).user;

    // Prevent self-deletion
    if (requestingUser.userId === req.params.id) {
      res.status(400).json({ error: 'Cannot delete your own account' });
      return;
    }

    await deleteUser(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    logger.error('Delete user error', error);
    res.status(400).json({ error: error.message || 'Failed to delete user' });
  }
});

/**
 * @route   PUT /api/admin/users/:id/deactivate
 * @desc    Deactivate user (soft delete)
 * @access  Admin
 */
router.put(
  '/:id/deactivate',
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestingUser = (req as any).user;

      // Prevent self-deactivation
      if (requestingUser.userId === req.params.id) {
        res.status(400).json({ error: 'Cannot deactivate your own account' });
        return;
      }

      const updatedUser = await deactivateUser(req.params.id);

      res.json({
        user: sanitizeUser(updatedUser),
        message: 'User deactivated successfully',
      });
    } catch (error: any) {
      logger.error('Deactivate user error', error);
      res.status(400).json({ error: error.message || 'Failed to deactivate user' });
    }
  }
);

export default router;
