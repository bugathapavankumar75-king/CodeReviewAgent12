/**
 * Central Express Router
 * Mounts modular route groups, applies layer-tracing middleware,
 * and sets up standard error handlers.
 */

import { Router, type Request, type Response, type NextFunction } from 'express';
import userRoutes from './user.routes';
import projectRoutes from './project.routes';
import taskRoutes from './task.routes';
import healthRoutes from './health.routes';
import testRoutes from './test.routes';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';

const router = Router();

// Layer tracing middleware
router.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = performance.now();
  const requestId = Math.random().toString(36).substring(2, 8);

  logger.info('ROUTE', `Incoming ${req.method} ${req.originalUrl}`, { requestId });

  // Response finish hook to log total pipeline time
  res.on('finish', () => {
    const duration = Math.round((performance.now() - startTime) * 100) / 100;
    logger.info('ROUTE', `Completed ${req.method} ${req.originalUrl} -> [${res.statusCode}] in ${duration}ms`, {
      requestId,
      statusCode: res.statusCode,
      durationMs: duration,
    });
  });

  next();
});

// Mount module routers
router.use('/health', healthRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/tests', testRoutes);

// Fallback for unmapped API routes
router.use((req: Request, _res: Response, next: NextFunction) => {
  next(ApiError.notFound(`Endpoint ${req.method} ${req.originalUrl}`));
});

// Centralized Architecture Error Handler Middleware
router.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    logger.warn('MIDDLEWARE', `Operational Error [${err.statusCode}]: ${err.message}`, {
      statusCode: err.statusCode,
      details: err.details,
    });

    return res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      details: err.details || null,
      timestamp: err.timestamp,
    });
  }

  // Unhandled fatal error
  logger.error('MIDDLEWARE', `Unhandled Server Exception: ${err.message}`, {
    stack: err.stack,
  });

  return res.status(500).json({
    success: false,
    statusCode: 500,
    message: 'An unexpected internal error occurred',
    timestamp: new Date().toISOString(),
  });
});

export default router;
