/**
 * Architecture Execution & Tracing Engine
 * Bridges client UI with the clean architecture pipeline, enabling live request tracing,
 * layer-by-layer inspection, test execution, and metrics capture.
 */

import { runAllTests, type TestSuiteSummary } from '../../tests/testRunner';
import { logger, type LogEntry } from '../utils/logger';
import { userRepository, type User } from '../models/user.model';
import { projectRepository, type Project } from '../models/project.model';
import { taskRepository, type Task } from '../models/task.model';
import { UserController } from '../controllers/user.controller';
import { ProjectController } from '../controllers/project.controller';
import { TaskController } from '../controllers/task.controller';
import { HealthController } from '../controllers/health.controller';

export interface LayerHop {
  layer: 'ROUTE' | 'MIDDLEWARE' | 'CONTROLLER' | 'SERVICE' | 'MODEL';
  name: string;
  action: string;
  durationMs: number;
  input?: unknown;
  output?: unknown;
}

export interface RequestTraceResult {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  statusCode: number;
  durationMs: number;
  hops: LayerHop[];
  responsePayload: unknown;
  timestamp: string;
}

export class ArchitectureEngine {
  static async traceRequest(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    body?: unknown,
    params: Record<string, string> = {},
    query: Record<string, string> = {}
  ): Promise<RequestTraceResult> {
    const totalStart = performance.now();
    const hops: LayerHop[] = [];
    let statusCode = 200;
    let responsePayload: unknown = null;

    // Helper to record hop
    const recordHop = async <T>(
      layer: LayerHop['layer'],
      name: string,
      action: string,
      fn: () => Promise<T>,
      input?: unknown
    ): Promise<T> => {
      const hopStart = performance.now();
      const output = await fn();
      const durationMs = Math.round((performance.now() - hopStart) * 100) / 100;
      hops.push({ layer, name, action, durationMs, input, output });
      return output;
    };

    // 1. Route Layer
    await recordHop('ROUTE', 'Express Router', `Matching [${method}] ${endpoint}`, async () => {
      logger.info('ROUTE', `Request received: ${method} ${endpoint}`);
      return { matchedPattern: endpoint, query, params };
    }, { method, endpoint, query });

    // 2. Middleware & Validation
    await recordHop('MIDDLEWARE', 'AsyncHandler & Logger', 'Validating payload headers and starting trace', async () => {
      return { hasBody: Boolean(body), paramsCount: Object.keys(params).length };
    }, body);

    // Mock response collector
    const mockRes = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(data: unknown) {
        responsePayload = data;
        return this;
      },
      send(data?: unknown) {
        responsePayload = data;
        return this;
      },
    };

    const mockReq = {
      params,
      query,
      body,
      headers: {},
      method,
      originalUrl: endpoint,
    };

    try {
      // 3. Dispatch to Controller based on endpoint
      if (endpoint === '/api/v1/health' || endpoint === '/health') {
        await recordHop('CONTROLLER', 'HealthController.getHealth', 'Assembling system health & layer inventory', async () => {
          await HealthController.getHealth(mockReq as any, mockRes as any);
          return responsePayload;
        });
      } else if (endpoint.startsWith('/api/v1/users') || endpoint.startsWith('/users')) {
        if (method === 'GET' && params.id) {
          await recordHop('CONTROLLER', 'UserController.getUserById', `Fetching user ID: ${params.id}`, async () => {
            await UserController.getUserById(mockReq as any, mockRes as any);
            return responsePayload;
          });
        } else if (method === 'GET') {
          await recordHop('CONTROLLER', 'UserController.getUsers', 'Querying paginated users', async () => {
            await UserController.getUsers(mockReq as any, mockRes as any);
            return responsePayload;
          });
        } else if (method === 'POST') {
          await recordHop('CONTROLLER', 'UserController.createUser', 'Validating user schema and dispatching to UserService', async () => {
            await UserController.createUser(mockReq as any, mockRes as any);
            return responsePayload;
          }, body);
        } else if (method === 'PUT' && params.id) {
          await recordHop('CONTROLLER', 'UserController.updateUser', `Updating user ID: ${params.id}`, async () => {
            await UserController.updateUser(mockReq as any, mockRes as any);
            return responsePayload;
          }, body);
        } else if (method === 'DELETE' && params.id) {
          await recordHop('CONTROLLER', 'UserController.deleteUser', `Deleting user ID: ${params.id}`, async () => {
            await UserController.deleteUser(mockReq as any, mockRes as any);
            return responsePayload;
          });
        }
      } else if (endpoint.startsWith('/api/v1/projects') || endpoint.startsWith('/projects')) {
        if (endpoint.includes('/metrics') && params.id) {
          await recordHop('CONTROLLER', 'ProjectController.getProjectMetrics', `Computing metrics for project: ${params.id}`, async () => {
            await ProjectController.getProjectMetrics(mockReq as any, mockRes as any);
            return responsePayload;
          });
        } else if (method === 'GET' && params.id) {
          await recordHop('CONTROLLER', 'ProjectController.getProjectById', `Looking up project: ${params.id}`, async () => {
            await ProjectController.getProjectById(mockReq as any, mockRes as any);
            return responsePayload;
          });
        } else if (method === 'GET') {
          await recordHop('CONTROLLER', 'ProjectController.getProjects', 'Listing projects with filters', async () => {
            await ProjectController.getProjects(mockReq as any, mockRes as any);
            return responsePayload;
          });
        } else if (method === 'POST') {
          await recordHop('CONTROLLER', 'ProjectController.createProject', 'Validating DTO and creating project', async () => {
            await ProjectController.createProject(mockReq as any, mockRes as any);
            return responsePayload;
          }, body);
        } else if (method === 'DELETE' && params.id) {
          await recordHop('CONTROLLER', 'ProjectController.deleteProject', `Removing project: ${params.id}`, async () => {
            await ProjectController.deleteProject(mockReq as any, mockRes as any);
            return responsePayload;
          });
        }
      } else if (endpoint.startsWith('/api/v1/tasks') || endpoint.startsWith('/tasks')) {
        if (method === 'GET' && params.id) {
          await recordHop('CONTROLLER', 'TaskController.getTaskById', `Retrieving task: ${params.id}`, async () => {
            await TaskController.getTaskById(mockReq as any, mockRes as any);
            return responsePayload;
          });
        } else if (method === 'GET') {
          await recordHop('CONTROLLER', 'TaskController.getTasks', 'Listing tasks with query filters', async () => {
            await TaskController.getTasks(mockReq as any, mockRes as any);
            return responsePayload;
          });
        } else if (method === 'POST') {
          await recordHop('CONTROLLER', 'TaskController.createTask', 'Creating new work item task', async () => {
            await TaskController.createTask(mockReq as any, mockRes as any);
            return responsePayload;
          }, body);
        } else if (method === 'PATCH' && endpoint.includes('/status') && params.id) {
          await recordHop('CONTROLLER', 'TaskController.changeStatus', `Updating status for task: ${params.id}`, async () => {
            await TaskController.changeStatus(mockReq as any, mockRes as any);
            return responsePayload;
          }, body);
        }
      }
    } catch (err: any) {
      statusCode = err.statusCode || 500;
      responsePayload = {
        success: false,
        statusCode,
        message: err.message || 'Internal server error',
        details: err.details || null,
        timestamp: new Date().toISOString(),
      };
      hops.push({
        layer: 'MIDDLEWARE',
        name: 'Error Handling Middleware',
        action: `Caught ${err.name || 'Error'} [${statusCode}]: ${err.message}`,
        durationMs: 0.1,
        output: responsePayload,
      });
    }

    const totalDurationMs = Math.round((performance.now() - totalStart) * 100) / 100;

    return {
      endpoint,
      method,
      statusCode,
      durationMs: totalDurationMs,
      hops,
      responsePayload,
      timestamp: new Date().toISOString(),
    };
  }

  static async executeTests(): Promise<TestSuiteSummary> {
    return runAllTests();
  }

  static async fetchStoredData(): Promise<{ users: User[]; projects: Project[]; tasks: Task[] }> {
    const [u, p, t] = await Promise.all([
      userRepository.findAll({ limit: 100 }),
      projectRepository.findAll({ limit: 100 }),
      taskRepository.findAll({ limit: 100 }),
    ]);
    return {
      users: u.users,
      projects: p.projects,
      tasks: t.tasks,
    };
  }

  static getLogs(): LogEntry[] {
    return logger.getRecentLogs(100);
  }
}
