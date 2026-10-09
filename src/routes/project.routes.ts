/**
 * Project Route Definitions
 * Maps HTTP verbs and endpoints to ProjectController handlers.
 */

import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.route('/')
  .get(asyncHandler(ProjectController.getProjects))
  .post(asyncHandler(ProjectController.createProject));

router.route('/:id')
  .get(asyncHandler(ProjectController.getProjectById))
  .put(asyncHandler(ProjectController.updateProject))
  .delete(asyncHandler(ProjectController.deleteProject));

router.route('/:id/metrics')
  .get(asyncHandler(ProjectController.getProjectMetrics));

export default router;
