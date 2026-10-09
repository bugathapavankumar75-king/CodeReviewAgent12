/**
 * Full Source Code Registry for Interactive File Explorer
 */

export const FILE_CONTENTS: Record<string, string> = {
  'package.json': `{
  "name": "clean-arch-studio",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build",
    "start": "tsx server.ts",
    "lint": "tsc --noEmit",
    "test": "tsx -e \\"import('./tests/testRunner.ts').then(m => m.runAllTests())\\""
  },
  "dependencies": {
    "express": "^4.21.2",
    "dotenv": "^17.2.3",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "vite": "^8.3.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^22.14.0",
    "@types/react": "^19.3.0",
    "tsx": "^4.21.0",
    "typescript": "^7.0.2",
    "tailwindcss": "^4.3.3"
  }
}`,

  'config/index.ts': `/**
 * Application Configuration Module
 * Single source of truth for runtime settings.
 */

export interface AppConfig {
  env: 'development' | 'production' | 'test';
  port: number;
  apiPrefix: string;
  pagination: { defaultLimit: number; maxLimit: number };
  logging: { level: 'debug' | 'info' | 'warn' | 'error'; enableTimestamps: boolean };
}

export const config: AppConfig = {
  env: (process.env.NODE_ENV as AppConfig['env']) || 'development',
  port: Number(process.env.PORT) || 3000,
  apiPrefix: '/api/v1',
  pagination: { defaultLimit: 10, maxLimit: 100 },
  logging: { level: 'debug', enableTimestamps: true },
};

export default config;`,

  'src/routes/index.ts': `/**
 * Central Express Router
 * Mounts modular route groups and registers centralized error middleware.
 */

import { Router, Request, Response, NextFunction } from 'express';
import userRoutes from './user.routes';
import projectRoutes from './project.routes';
import taskRoutes from './task.routes';
import healthRoutes from './health.routes';
import testRoutes from './test.routes';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';

const router = Router();

// Layer tracing hook
router.use((req, res, next) => {
  logger.info('ROUTE', \`Incoming \${req.method} \${req.originalUrl}\`);
  next();
});

router.use('/health', healthRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/tests', testRoutes);

// Fallback 404
router.use((req, _res, next) => {
  next(ApiError.notFound(\`Endpoint \${req.method} \${req.originalUrl}\`));
});

// Central Error Middleware
router.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      details: err.details || null,
      timestamp: err.timestamp,
    });
  }
  return res.status(500).json({
    success: false,
    statusCode: 500,
    message: 'An unexpected internal error occurred',
  });
});

export default router;`,

  'src/controllers/user.controller.ts': `/**
 * User Controller
 * Adapts incoming HTTP requests, validates DTOs, and formats responses.
 */

import type { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { ApiResponse } from '../utils/apiResponse';
import { Validator } from '../utils/validator';

export class UserController {
  static async getUsers(req: Request, res: Response) {
    const { role, status, search, limit = '10', page = '1' } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    
    const { users, total } = await userService.listUsers({
      role: role as any,
      status: status as any,
      search: search as string,
      limit: limitNum,
      offset: (pageNum - 1) * limitNum,
    });

    return ApiResponse.paginated(res, users, pageNum, limitNum, total);
  }

  static async createUser(req: Request, res: Response) {
    const validated = Validator.validate(req.body, {
      name: [Validator.required(), Validator.string({ min: 2, max: 100 })],
      email: [Validator.required(), Validator.email()],
      role: [Validator.enum(['admin', 'developer', 'manager', 'viewer'])],
    });

    const user = await userService.createUser(validated as any);
    return ApiResponse.created(res, user, 'User created successfully');
  }

  static async getUserById(req: Request, res: Response) {
    const user = await userService.getUserById(req.params.id);
    return ApiResponse.success(res, user);
  }
}`,

  'src/services/user.service.ts': `/**
 * User Service
 * Encapsulates domain rules and invariants without HTTP awareness.
 */

import { userRepository, type CreateUserInput } from '../models/user.model';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';

export class UserService {
  async getUserById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw ApiError.notFound('User', id);
    return user;
  }

  async createUser(input: CreateUserInput) {
    // Invariant: Email must be unique across all accounts
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw ApiError.conflict(\`User with email '\${input.email}' already exists\`);
    }

    const created = await userRepository.create(input);
    logger.info('SERVICE', \`Created user \${created.id}\`);
    return created;
  }

  async listUsers(options = {}) {
    return userRepository.findAll(options);
  }
}

export const userService = new UserService();`,

  'src/models/user.model.ts': `/**
 * User Model & Repository
 * Encapsulates data schema and persistence layer.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'developer' | 'manager' | 'viewer';
  status: 'active' | 'inactive' | 'suspended';
  department: string;
  createdAt: string;
  updatedAt: string;
}

class UserRepository {
  private users: Map<string, User> = new Map();

  async findById(id: string): Promise<User | null> {
    const u = this.users.get(id);
    return u ? { ...u } : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const norm = email.toLowerCase().trim();
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === norm) return { ...u };
    }
    return null;
  }

  async create(data: any): Promise<User> {
    const id = \`usr_\${Date.now()}\`;
    const user: User = { id, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    this.users.set(id, user);
    return { ...user };
  }
}

export const userRepository = new UserRepository();`,

  'src/utils/apiResponse.ts': `/**
 * Standardized API Response Envelope
 */

export class ApiResponse {
  static success<T>(res: any, data: T, message = 'Success', statusCode = 200, meta?: any) {
    return res.status(statusCode).json({
      success: true,
      statusCode,
      message,
      data,
      meta,
      timestamp: new Date().toISOString(),
    });
  }

  static created<T>(res: any, data: T, message = 'Created') {
    return this.success(res, data, message, 201);
  }

  static paginated<T>(res: any, data: T[], page: number, limit: number, total: number) {
    return this.success(res, data, 'Success', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  }
}`,

  'src/utils/apiError.ts': `/**
 * Custom Operational API Error
 */

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
    public readonly isOperational = true
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static badRequest(msg: string, details?: unknown) { return new ApiError(400, msg, details); }
  static notFound(resource: string, id?: string) { return new ApiError(404, id ? \`\${resource} '\${id}' not found\` : \`\${resource} not found\`); }
  static conflict(msg: string) { return new ApiError(409, msg); }
  static unprocessable(msg: string, details?: unknown) { return new ApiError(422, msg, details); }
}`,

  'tests/unit/services.test.ts': `/**
 * Unit Test Suite for Services
 */

import { userService } from '../../src/services/user.service';
import { ApiError } from '../../src/utils/apiError';

describe('UserService', () => {
  it('should reject duplicate email registration with 409 Conflict', async () => {
    try {
      await userService.createUser({ name: 'Dup', email: 'alex.rivera@example.com' });
      throw new Error('Should have failed');
    } catch (err: any) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.statusCode).toBe(409);
    }
  });
});`,
};
