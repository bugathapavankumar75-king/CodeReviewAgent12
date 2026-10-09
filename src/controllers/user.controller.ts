/**
 * User Controller
 * Receives HTTP requests, validates incoming DTOs, delegates to UserService,
 * and renders standardized API responses.
 */

import type { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { ApiResponse } from '../utils/apiResponse';
import { Validator } from '../utils/validator';
import { logger } from '../utils/logger';
import type { CreateUserInput, UpdateUserInput, UserQueryOptions, UserRole, UserStatus } from '../models/user.model';

export class UserController {
  static async getUsers(req: Request, res: Response) {
    logger.info('CONTROLLER', 'UserController.getUsers handling request');
    const { role, status, search, limit = '10', page = '1' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const query: UserQueryOptions = {
      role: role as UserRole,
      status: status as UserStatus,
      search: search as string,
      limit: limitNum,
      offset,
    };

    const { users, total } = await userService.listUsers(query);
    return ApiResponse.paginated(res, users, pageNum, limitNum, total, 'User accounts retrieved');
  }

  static async getUserById(req: Request, res: Response) {
    const { id } = req.params;
    logger.info('CONTROLLER', `UserController.getUserById handling request for ID: ${id}`);
    const user = await userService.getUserById(id);
    return ApiResponse.success(res, user, 'User retrieved successfully');
  }

  static async createUser(req: Request, res: Response) {
    logger.info('CONTROLLER', 'UserController.createUser validating payload');

    const validated = Validator.validate<CreateUserInput>(req.body, {
      name: [Validator.required(), Validator.string({ min: 2, max: 100 })],
      email: [Validator.required(), Validator.email()],
      role: [Validator.enum(['admin', 'developer', 'manager', 'viewer'])],
    });

    const newUser = await userService.createUser(validated);
    return ApiResponse.created(res, newUser, 'User created successfully');
  }

  static async updateUser(req: Request, res: Response) {
    const { id } = req.params;
    logger.info('CONTROLLER', `UserController.updateUser processing update for ID: ${id}`);

    const validated = Validator.validate<UpdateUserInput>(req.body, {
      name: [Validator.string({ min: 2, max: 100 })],
      email: [Validator.email()],
      role: [Validator.enum(['admin', 'developer', 'manager', 'viewer'])],
      status: [Validator.enum(['active', 'inactive', 'suspended'])],
    });

    const updated = await userService.updateUser(id, validated);
    return ApiResponse.success(res, updated, 'User profile updated successfully');
  }

  static async deleteUser(req: Request, res: Response) {
    const { id } = req.params;
    logger.info('CONTROLLER', `UserController.deleteUser executing deletion for ID: ${id}`);
    const result = await userService.deleteUser(id);
    return ApiResponse.success(res, result, 'User deleted successfully');
  }
}
