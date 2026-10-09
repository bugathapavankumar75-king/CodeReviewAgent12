/**
 * Project Business Service
 * Manages project lifecycle, ownership validations, code constraints,
 * and aggregated progress metrics.
 */

import {
  projectRepository,
  type Project,
  type CreateProjectInput,
  type UpdateProjectInput,
  type ProjectQueryOptions,
} from '../models/project.model';
import { userRepository } from '../models/user.model';
import { taskRepository } from '../models/task.model';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';

export interface ProjectMetrics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  totalEstimateHours: number;
  pendingTasks: number;
}

export class ProjectService {
  async getProjectById(id: string): Promise<Project> {
    logger.info('SERVICE', `ProjectService.getProjectById looking up: ${id}`);
    const project = await projectRepository.findById(id);
    if (!project) {
      throw ApiError.notFound('Project', id);
    }
    return project;
  }

  async listProjects(options: ProjectQueryOptions = {}): Promise<{ projects: Project[]; total: number }> {
    logger.info('SERVICE', 'ProjectService.listProjects fetching projects', options);
    return projectRepository.findAll(options);
  }

  async createProject(input: CreateProjectInput): Promise<Project> {
    logger.info('SERVICE', `ProjectService.createProject evaluating code '${input.code}'`);

    // Verify owner exists
    const owner = await userRepository.findById(input.ownerId);
    if (!owner) {
      throw ApiError.badRequest(`Owner user ID '${input.ownerId}' does not exist`);
    }

    // Verify unique project code
    const existing = await projectRepository.findByCode(input.code);
    if (existing) {
      throw ApiError.conflict(`Project code '${input.code.toUpperCase()}' is already in use`);
    }

    const created = await projectRepository.create(input);
    logger.info('SERVICE', `ProjectService created project: ${created.id} (${created.code})`);
    return created;
  }

  async updateProject(id: string, updates: UpdateProjectInput): Promise<Project> {
    logger.info('SERVICE', `ProjectService.updateProject modifying ID: ${id}`);
    const existing = await projectRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('Project', id);
    }

    const updated = await projectRepository.update(id, updates);
    if (!updated) {
      throw ApiError.internal('Failed to update project');
    }
    return updated;
  }

  async deleteProject(id: string): Promise<{ deletedId: string; cascadeTasksRemoved: number }> {
    logger.info('SERVICE', `ProjectService.deleteProject removing project: ${id}`);
    const existing = await projectRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('Project', id);
    }

    // Find and delete associated tasks
    const { tasks } = await taskRepository.findAll({ projectId: id, limit: 1000 });
    for (const t of tasks) {
      await taskRepository.delete(t.id);
    }

    await projectRepository.delete(id);
    logger.info('SERVICE', `ProjectService deleted project ${id} and ${tasks.length} associated tasks`);
    return { deletedId: id, cascadeTasksRemoved: tasks.length };
  }

  async getProjectMetrics(id: string): Promise<{ project: Project; metrics: ProjectMetrics }> {
    logger.info('SERVICE', `ProjectService.getProjectMetrics calculating for: ${id}`);
    const project = await this.getProjectById(id);
    const { tasks, total } = await taskRepository.findAll({ projectId: id, limit: 1000 });

    const completedTasks = tasks.filter((t) => t.status === 'done').length;
    const totalEstimateHours = tasks.reduce((sum, t) => sum + (t.estimateHours || 0), 0);
    const completionRate = total > 0 ? Math.round((completedTasks / total) * 100) : 0;

    return {
      project,
      metrics: {
        totalTasks: total,
        completedTasks,
        completionRate,
        totalEstimateHours,
        pendingTasks: total - completedTasks,
      },
    };
  }
}

export const projectService = new ProjectService();
