/**
 * User Route Definitions
 * Maps HTTP verbs and endpoints to UserController handlers.
 */

import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.route('/')
  .get(asyncHandler(UserController.getUsers))
  .post(asyncHandler(UserController.createUser));

router.route('/:id')
  .get(asyncHandler(UserController.getUserById))
  .put(asyncHandler(UserController.updateUser))
  .delete(asyncHandler(UserController.deleteUser));

export default router;
