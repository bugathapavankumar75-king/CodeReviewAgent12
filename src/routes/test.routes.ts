/**
 * Test Runner API Routes
 * Exposes live test execution endpoints for development and verification.
 */

import { Router, type Request, type Response } from 'express';
import { runAllTests } from '../../tests/testRunner';
import { ApiResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post(
  '/run',
  asyncHandler(async (_req: Request, res: Response) => {
    const summary = await runAllTests();
    return ApiResponse.success(res, summary, 'Test suite executed successfully');
  })
);

router.get(
  '/suites',
  asyncHandler(async (_req: Request, res: Response) => {
    const suites = [
      { id: 'services', name: 'Service Business Logic Unit Tests', path: 'tests/unit/services.test.ts', type: 'unit' },
      { id: 'models', name: 'Data Model & Repository Unit Tests', path: 'tests/unit/models.test.ts', type: 'unit' },
      { id: 'routes', name: 'HTTP Pipeline & Controller Integration Tests', path: 'tests/integration/routes.test.ts', type: 'integration' },
    ];
    return ApiResponse.success(res, suites, 'Test suites inventory');
  })
);

export default router;
