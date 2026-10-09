/**
 * Health & Architecture Diagnostic Routes
 */

import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(HealthController.getHealth));
router.get('/meta', asyncHandler(HealthController.getArchitectureMeta));
router.get('/logs', asyncHandler(HealthController.getLogs));

export default router;
