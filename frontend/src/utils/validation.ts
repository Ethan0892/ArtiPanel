/**
 * Request/Response Validation Layer
 * 
 * Zod-based runtime type checking for API payloads
 */

import { z } from 'zod';

/**
 * Server validation schema
 */
export const ServerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Server name is required'),
  host: z.string().min(1, 'Host is required'),
  port: z.number().int().min(1, 'Port must be between 1 and 65535').max(65535),
  username: z.string().optional(),
  password: z.string().optional(),
  nodeId: z.string().optional(),
  status: z.enum(['online', 'offline', 'maintenance']).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Server = z.infer<typeof ServerSchema>;

/**
 * Node validation schema
 */
export const NodeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Node name is required'),
  host: z.string().min(1, 'Host is required'),
  port: z.number().int().default(22),
  username: z.string().optional(),
  publicKey: z.string().optional(),
  status: z.enum(['online', 'offline', 'error']).optional(),
  allocations: z.number().int().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Node = z.infer<typeof NodeSchema>;

/**
 * Storage validation schema
 */
export const StorageSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Storage name is required'),
  path: z.string().min(1, 'Path is required'),
  size: z.number().int().positive(),
  used: z.number().int().optional(),
  type: z.enum(['local', 'nfs', 's3', 'smb']).optional(),
  status: z.enum(['available', 'degraded', 'error']).optional(),
  createdAt: z.string().optional(),
});

export type Storage = z.infer<typeof StorageSchema>;

/**
 * Validation error response
 */
export const ValidationErrorSchema = z.object({
  code: z.literal('VALIDATION_ERROR'),
  message: z.string(),
  errors: z.record(z.array(z.string())),
});

export type ValidationError = z.infer<typeof ValidationErrorSchema>;

/**
 * Generic list response
 */
export const ListResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    total: z.number().int(),
    page: z.number().int(),
    pageSize: z.number().int(),
  });

/**
 * Validator utility class
 */
export class Validator {
  /**
   * Validate server data
   */
  static validateServer(data: unknown): Server {
    return ServerSchema.parse(data);
  }

  /**
   * Validate server creation payload
   */
  static validateServerCreate(data: unknown) {
    return ServerSchema.pick({
      name: true,
      host: true,
      port: true,
      username: true,
      password: true,
      nodeId: true,
    }).parse(data);
  }

  /**
   * Validate node data
   */
  static validateNode(data: unknown): Node {
    return NodeSchema.parse(data);
  }

  /**
   * Validate node creation payload
   */
  static validateNodeCreate(data: unknown) {
    return NodeSchema.pick({
      name: true,
      host: true,
      port: true,
      username: true,
      publicKey: true,
    }).parse(data);
  }

  /**
   * Validate storage data
   */
  static validateStorage(data: unknown): Storage {
    return StorageSchema.parse(data);
  }

  /**
   * Validate storage creation payload
   */
  static validateStorageCreate(data: unknown) {
    return StorageSchema.pick({
      name: true,
      path: true,
      size: true,
      type: true,
    }).parse(data);
  }

  /**
   * Safe parse with error handling
   */
  static safeParse<T>(schema: z.ZodSchema<T>, data: unknown) {
    const result = schema.safeParse(data);
    return result;
  }
}

/**
 * Custom error handler for Zod validation
 */
export function formatZodError(error: z.ZodError) {
  const errors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.');
    const message = issue.message;

    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(message);
  }

  return errors;
}

/**
 * Validate API response
 */
export function validateResponse<T>(schema: z.ZodSchema<T>, response: unknown): T | null {
  try {
    return schema.parse(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Response validation failed:', formatZodError(error));
    }
    return null;
  }
}
