/**
 * Task Route Definitions
 * Maps HTTP verbs and endpoints to TaskController handlers.
 */

import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.route('/')
  .get(asyncHandler(TaskController.getTasks))
  .post(asyncHandler(TaskController.createTask));

router.route('/:id')
  .get(asyncHandler(TaskController.getTaskById))
  .put(asyncHandler(TaskController.updateTask))
  .delete(asyncHandler(TaskController.deleteTask));

router.route('/:id/status')
  .patch(asyncHandler(TaskController.changeStatus));

export default router;
