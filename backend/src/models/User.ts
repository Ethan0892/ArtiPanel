/**
 * User Model & Management
 * 
 * Handles user creation, authentication, and role management
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import logger from '../utils/logger';

const DATA_DIR = process.env.DATA_DIR || './storage';
const USERS_FILE = path.join(DATA_DIR, 'users.json');

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  VIEWER = 'viewer',
}

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
  lastLogin: string | null;
  isActive: boolean;
}

export interface UsersFilePayload {
  users: User[];
  lastModified: string;
}

// Hash password with salt
export function hashPassword(password: string): string {
  return crypto
    .pbkdf2Sync(password, process.env.PASSWORD_SALT || 'artipanel-salt', 100000, 64, 'sha512')
    .toString('hex');
}

// Verify password against hash
export function verifyPassword(password: string, hash: string): boolean {
  const hashOfPassword = hashPassword(password);
  return hashOfPassword === hash;
}

// Generate unique user ID
function generateUserId(): string {
  return `user_${crypto.randomBytes(8).toString('hex')}`;
}

// Ensure users data file exists
const ensureUsersFile = async () => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.stat(USERS_FILE);
    } catch {
      const initial: UsersFilePayload = {
        users: [],
        lastModified: new Date().toISOString(),
      };
      await fs.writeFile(USERS_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    }
  } catch (error: any) {
    logger.error('Failed to ensure users file', error);
    throw error;
  }
};

// Read users from disk
export async function readUsersFromDisk(): Promise<User[]> {
  try {
    await ensureUsersFile();
    const raw = await fs.readFile(USERS_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as UsersFilePayload;
    return parsed.users || [];
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return [];
    }
    logger.error('Failed to read users', error);
    throw error;
  }
}

// Write users to disk
export async function writeUsersToDisk(users: User[]): Promise<UsersFilePayload> {
  await ensureUsersFile();
  const payload: UsersFilePayload = {
    users,
    lastModified: new Date().toISOString(),
  };
  await fs.writeFile(USERS_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  return payload;
}

// Check if any admin users exist
export async function hasAdminUser(): Promise<boolean> {
  const users = await readUsersFromDisk();
  return users.some((u) => u.role === UserRole.ADMIN && u.isActive);
}

// Get user by username
export async function getUserByUsername(username: string): Promise<User | null> {
  const users = await readUsersFromDisk();
  return users.find((u) => u.username === username) || null;
}

// Get user by ID
export async function getUserById(userId: string): Promise<User | null> {
  const users = await readUsersFromDisk();
  return users.find((u) => u.id === userId) || null;
}

// Get all users
export async function getAllUsers(): Promise<User[]> {
  return readUsersFromDisk();
}

// Create new user
export async function createUser(
  username: string,
  email: string,
  password: string,
  role: UserRole = UserRole.USER
): Promise<User> {
  const users = await readUsersFromDisk();

  // Check if user already exists
  if (users.some((u) => u.username === username || u.email === email)) {
    throw new Error('User with this username or email already exists');
  }

  // If no admin exists, make first user an admin
  const hasAdmin = await hasAdminUser();
  const userRole = !hasAdmin ? UserRole.ADMIN : role;

  const newUser: User = {
    id: generateUserId(),
    username,
    email,
    passwordHash: hashPassword(password),
    role: userRole,
    createdAt: new Date().toISOString(),
    lastLogin: null,
    isActive: true,
  };

  users.push(newUser);
  await writeUsersToDisk(users);

  logger.info(`User created: ${username} (role: ${userRole})`);
  return newUser;
}

// Authenticate user (verify credentials)
export async function authenticateUser(
  username: string,
  password: string
): Promise<{ user: User; authenticated: boolean }> {
  const user = await getUserByUsername(username);

  if (!user) {
    return { user: null as any, authenticated: false };
  }

  if (!user.isActive) {
    return { user, authenticated: false };
  }

  const passwordMatch = verifyPassword(password, user.passwordHash);

  if (passwordMatch) {
    // Update last login
    const users = await readUsersFromDisk();
    const userIndex = users.findIndex((u) => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex].lastLogin = new Date().toISOString();
      await writeUsersToDisk(users);
    }
  }

  return {
    user,
    authenticated: passwordMatch,
  };
}

// Update user role (admin only)
export async function updateUserRole(userId: string, newRole: UserRole): Promise<User> {
  const users = await readUsersFromDisk();
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    throw new Error('User not found');
  }

  users[userIndex].role = newRole;
  await writeUsersToDisk(users);

  logger.info(`User role updated: ${users[userIndex].username} -> ${newRole}`);
  return users[userIndex];
}

// Disable/deactivate user
export async function deactivateUser(userId: string): Promise<User> {
  const users = await readUsersFromDisk();
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    throw new Error('User not found');
  }

  users[userIndex].isActive = false;
  await writeUsersToDisk(users);

  logger.info(`User deactivated: ${users[userIndex].username}`);
  return users[userIndex];
}

// Delete user
export async function deleteUser(userId: string): Promise<void> {
  const users = await readUsersFromDisk();
  const filteredUsers = users.filter((u) => u.id !== userId);

  if (filteredUsers.length === users.length) {
    throw new Error('User not found');
  }

  await writeUsersToDisk(filteredUsers);
  logger.info(`User deleted: ${userId}`);
}

// Initialize default admin on first startup
export async function initializeDefaultAdmin(): Promise<void> {
  try {
    const users = await readUsersFromDisk();
    
    // Only create default admin if no users exist
    if (users.length === 0) {
      const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
      await createUser('admin', 'admin@artipanel.local', defaultPassword, UserRole.ADMIN);
      logger.info(`✅ Default admin account created (username: admin, password: check .env DEFAULT_ADMIN_PASSWORD)`);
    }
  } catch (error: any) {
    logger.error('Failed to initialize default admin', error);
  }
}
