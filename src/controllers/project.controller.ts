/**
 * Project Controller
 * Handles project routes, query parsing, validation, and response delivery.
 */

import type { Request, Response } from 'express';
import { projectService } from '../services/project.service';
import { ApiResponse } from '../utils/apiResponse';
import { Validator } from '../utils/validator';
import { logger } from '../utils/logger';
import type {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectQueryOptions,
  ProjectStatus,
  ProjectPriority,
} from '../models/project.model';

export class ProjectController {
  static async getProjects(req: Request, res: Response) {
    logger.info('CONTROLLER', 'ProjectController.getProjects handling query');
    const { status, priority, ownerId, search, limit = '10', page = '1' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const query: ProjectQueryOptions = {
      status: status as ProjectStatus,
      priority: priority as ProjectPriority,
      ownerId: ownerId as string,
      search: search as string,
      limit: limitNum,
      offset,
    };

    const { projects, total } = await projectService.listProjects(query);
    return ApiResponse.paginated(res, projects, pageNum, limitNum, total, 'Projects retrieved');
  }

  static async getProjectById(req: Request, res: Response) {
    const { id } = req.params;
    logger.info('CONTROLLER', `ProjectController.getProjectById looking up: ${id}`);
    const project = await projectService.getProjectById(id);
    return ApiResponse.success(res, project, 'Project retrieved successfully');
  }

  static async createProject(req: Request, res: Response) {
    logger.info('CONTROLLER', 'ProjectController.createProject validating payload');

    const validated = Validator.validate<CreateProjectInput>(req.body, {
      name: [Validator.required(), Validator.string({ min: 3, max: 120 })],
      code: [Validator.required(), Validator.string({ min: 2, max: 20 })],
      ownerId: [Validator.required(), Validator.string()],
      priority: [Validator.enum(['low', 'medium', 'high', 'critical'])],
      budget: [Validator.number({ min: 0 })],
    });

    const project = await projectService.createProject(validated);
    return ApiResponse.created(res, project, 'Project created successfully');
  }

  static async updateProject(req: Request, res: Response) {
    const { id } = req.params;
    logger.info('CONTROLLER', `ProjectController.updateProject updating: ${id}`);

    const validated = Validator.validate<UpdateProjectInput>(req.body, {
      name: [Validator.string({ min: 3, max: 120 })],
      status: [Validator.enum(['planning', 'active', 'completed', 'archived'])],
      priority: [Validator.enum(['low', 'medium', 'high', 'critical'])],
      budget: [Validator.number({ min: 0 })],
    });

    const updated = await projectService.updateProject(id, validated);
    return ApiResponse.success(res, updated, 'Project updated successfully');
  }

  static async deleteProject(req: Request, res: Response) {
    const { id } = req.params;
    logger.info('CONTROLLER', `ProjectController.deleteProject removing: ${id}`);
    const result = await projectService.deleteProject(id);
    return ApiResponse.success(res, result, 'Project deleted successfully');
  }

  static async getProjectMetrics(req: Request, res: Response) {
    const { id } = req.params;
    logger.info('CONTROLLER', `ProjectController.getProjectMetrics calculating for: ${id}`);
    const metrics = await projectService.getProjectMetrics(id);
    return ApiResponse.success(res, metrics, 'Project metrics computed successfully');
  }
}
