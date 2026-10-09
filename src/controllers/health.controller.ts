/**
 * System Health & Architecture Introspection Controller
 * Exposes runtime health, layer diagnostics, and live logs for developer studio.
 */

import type { Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import { userRepository } from '../models/user.model';
import { projectRepository } from '../models/project.model';
import { taskRepository } from '../models/task.model';
import { config } from '../../config/index';

export class HealthController {
  static async getHealth(_req: Request, res: Response) {
    logger.info('CONTROLLER', 'HealthController.getHealth verifying system state');

    const [userCount, projectCount, taskCount] = await Promise.all([
      userRepository.count(),
      projectRepository.count(),
      taskRepository.count(),
    ]);

    const uptimeSeconds = Math.floor(process.uptime ? process.uptime() : 120);

    const healthData = {
      status: 'healthy',
      environment: config.env,
      timestamp: new Date().toISOString(),
      uptimeSeconds,
      architecture: {
        pattern: '3-Tier Layered Architecture',
        layers: [
          { name: 'Routes', status: 'active', path: 'src/routes/' },
          { name: 'Controllers', status: 'active', path: 'src/controllers/' },
          { name: 'Services', status: 'active', path: 'src/services/' },
          { name: 'Models', status: 'active', path: 'src/models/' },
          { name: 'Utils', status: 'active', path: 'src/utils/' },
          { name: 'Config', status: 'active', path: 'config/' },
          { name: 'Tests', status: 'active', path: 'tests/' },
        ],
        storeStatus: 'ready',
        entityCounts: {
          users: userCount,
          projects: projectCount,
          tasks: taskCount,
        },
      },
    };

    return ApiResponse.success(res, healthData, 'System is healthy and operational');
  }

  static async getArchitectureMeta(_req: Request, res: Response) {
    logger.info('CONTROLLER', 'HealthController.getArchitectureMeta generating schema');

    const schema = {
      projectStructure: {
        root: 'project/',
        folders: [
          { path: 'src/controllers/', description: 'HTTP request termination, DTO validation, and response formatting' },
          { path: 'src/services/', description: 'Pure business logic, domain rules, and orchestrations' },
          { path: 'src/models/', description: 'Data structures, entities, and repository access layers' },
          { path: 'src/routes/', description: 'URL routing, method binding, and middleware chains' },
          { path: 'src/utils/', description: 'Shared error handlers, response builders, logger, and helpers' },
          { path: 'config/', description: 'Environment configuration and application settings' },
          { path: 'tests/', description: 'Unit and integration test suites' },
          { path: 'package.json', description: 'Dependencies, scripts, and runtime configuration' },
        ],
      },
      endpoints: [
        { method: 'GET', path: '/api/v1/health', layer: 'HealthController', desc: 'System uptime and layer health status' },
        { method: 'GET', path: '/api/v1/users', layer: 'UserController.getUsers', desc: 'Paginated user accounts' },
        { method: 'POST', path: '/api/v1/users', layer: 'UserController.createUser', desc: 'Create a new user account' },
        { method: 'GET', path: '/api/v1/users/:id', layer: 'UserController.getUserById', desc: 'Get specific user details' },
        { method: 'PUT', path: '/api/v1/users/:id', layer: 'UserController.updateUser', desc: 'Update user profile' },
        { method: 'DELETE', path: '/api/v1/users/:id', layer: 'UserController.deleteUser', desc: 'Delete user account' },
        { method: 'GET', path: '/api/v1/projects', layer: 'ProjectController.getProjects', desc: 'Filterable projects list' },
        { method: 'POST', path: '/api/v1/projects', layer: 'ProjectController.createProject', desc: 'Create new project' },
        { method: 'GET', path: '/api/v1/projects/:id', layer: 'ProjectController.getProjectById', desc: 'Get project with details' },
        { method: 'GET', path: '/api/v1/projects/:id/metrics', layer: 'ProjectController.getProjectMetrics', desc: 'Compute project progress & task metrics' },
        { method: 'GET', path: '/api/v1/tasks', layer: 'TaskController.getTasks', desc: 'List work items with filters' },
        { method: 'POST', path: '/api/v1/tasks', layer: 'TaskController.createTask', desc: 'Create project task' },
        { method: 'PATCH', path: '/api/v1/tasks/:id/status', layer: 'TaskController.changeStatus', desc: 'Transition task workflow state' },
      ],
    };

    return ApiResponse.success(res, schema, 'Architecture metadata introspected');
  }

  static async getLogs(req: Request, res: Response) {
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const logs = logger.getRecentLogs(limit);
    return ApiResponse.success(res, logs, 'Recent architecture logs');
  }
}
