/**
 * Task Controller
 * Handles work item HTTP interactions, status updates, and assignments.
 */

import type { Request, Response } from 'express';
import { taskService } from '../services/task.service';
import { ApiResponse } from '../utils/apiResponse';
import { Validator } from '../utils/validator';
import { logger } from '../utils/logger';
import type {
  CreateTaskInput,
  UpdateTaskInput,
  TaskQueryOptions,
  TaskStatus,
  TaskPriority,
} from '../models/task.model';

export class TaskController {
  static async getTasks(req: Request, res: Response) {
    logger.info('CONTROLLER', 'TaskController.getTasks processing request');
    const { projectId, assigneeId, status, priority, search, limit = '10', page = '1' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const query: TaskQueryOptions = {
      projectId: projectId as string,
      assigneeId: assigneeId as string,
      status: status as TaskStatus,
      priority: priority as TaskPriority,
      search: search as string,
      limit: limitNum,
      offset,
    };

    const { tasks, total } = await taskService.listTasks(query);
    return ApiResponse.paginated(res, tasks, pageNum, limitNum, total, 'Tasks retrieved successfully');
  }

  static async getTaskById(req: Request, res: Response) {
    const { id } = req.params;
    logger.info('CONTROLLER', `TaskController.getTaskById fetching: ${id}`);
    const task = await taskService.getTaskById(id);
    return ApiResponse.success(res, task, 'Task retrieved successfully');
  }

  static async createTask(req: Request, res: Response) {
    logger.info('CONTROLLER', 'TaskController.createTask validating input');

    const validated = Validator.validate<CreateTaskInput>(req.body, {
      projectId: [Validator.required(), Validator.string()],
      title: [Validator.required(), Validator.string({ min: 3, max: 150 })],
      description: [Validator.string({ max: 500 })],
      priority: [Validator.enum(['low', 'medium', 'high', 'urgent'])],
      estimateHours: [Validator.number({ min: 0.5, max: 200 })],
    });

    const task = await taskService.createTask(validated);
    return ApiResponse.created(res, task, 'Task created successfully');
  }

  static async updateTask(req: Request, res: Response) {
    const { id } = req.params;
    logger.info('CONTROLLER', `TaskController.updateTask modifying: ${id}`);

    const validated = Validator.validate<UpdateTaskInput>(req.body, {
      title: [Validator.string({ min: 3, max: 150 })],
      status: [Validator.enum(['todo', 'in_progress', 'in_review', 'done'])],
      priority: [Validator.enum(['low', 'medium', 'high', 'urgent'])],
      estimateHours: [Validator.number({ min: 0.5, max: 200 })],
    });

    const updated = await taskService.updateTask(id, validated);
    return ApiResponse.success(res, updated, 'Task updated successfully');
  }

  static async changeStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;
    logger.info('CONTROLLER', `TaskController.changeStatus: ${id} -> ${status}`);

    const validated = Validator.validate<{ status: TaskStatus }>(req.body, {
      status: [Validator.required(), Validator.enum(['todo', 'in_progress', 'in_review', 'done'])],
    });

    const updated = await taskService.changeStatus(id, validated.status);
    return ApiResponse.success(res, updated, `Task marked as ${validated.status}`);
  }

  static async deleteTask(req: Request, res: Response) {
    const { id } = req.params;
    logger.info('CONTROLLER', `TaskController.deleteTask removing: ${id}`);
    const result = await taskService.deleteTask(id);
    return ApiResponse.success(res, result, 'Task deleted successfully');
  }
}
