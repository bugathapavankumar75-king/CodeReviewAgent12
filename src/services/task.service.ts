/**
 * Task Business Service
 * Encapsulates task workflow states, assignment checks,
 * and project association rules.
 */

import {
  taskRepository,
  type Task,
  type CreateTaskInput,
  type UpdateTaskInput,
  type TaskQueryOptions,
  type TaskStatus,
} from '../models/task.model';
import { projectRepository } from '../models/project.model';
import { userRepository } from '../models/user.model';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';

export class TaskService {
  async getTaskById(id: string): Promise<Task> {
    logger.info('SERVICE', `TaskService.getTaskById looking up: ${id}`);
    const task = await taskRepository.findById(id);
    if (!task) {
      throw ApiError.notFound('Task', id);
    }
    return task;
  }

  async listTasks(options: TaskQueryOptions = {}): Promise<{ tasks: Task[]; total: number }> {
    logger.info('SERVICE', 'TaskService.listTasks querying tasks', options);
    return taskRepository.findAll(options);
  }

  async createTask(input: CreateTaskInput): Promise<Task> {
    logger.info('SERVICE', `TaskService.createTask for project: ${input.projectId}`);

    // Verify parent project exists
    const project = await projectRepository.findById(input.projectId);
    if (!project) {
      throw ApiError.badRequest(`Parent project ID '${input.projectId}' not found`);
    }

    // Verify assignee if provided
    if (input.assigneeId) {
      const assignee = await userRepository.findById(input.assigneeId);
      if (!assignee) {
        throw ApiError.badRequest(`Assigned user ID '${input.assigneeId}' not found`);
      }
    }

    const created = await taskRepository.create(input);
    logger.info('SERVICE', `TaskService created task: ${created.id}`);
    return created;
  }

  async updateTask(id: string, updates: UpdateTaskInput): Promise<Task> {
    logger.info('SERVICE', `TaskService.updateTask updating ID: ${id}`);
    const existing = await taskRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('Task', id);
    }

    if (updates.assigneeId) {
      const assignee = await userRepository.findById(updates.assigneeId);
      if (!assignee) {
        throw ApiError.badRequest(`Assigned user ID '${updates.assigneeId}' not found`);
      }
    }

    const updated = await taskRepository.update(id, updates);
    if (!updated) {
      throw ApiError.internal('Failed to update task');
    }
    return updated;
  }

  async changeStatus(id: string, newStatus: TaskStatus): Promise<Task> {
    logger.info('SERVICE', `TaskService.changeStatus: transition ${id} to ${newStatus}`);
    return this.updateTask(id, { status: newStatus });
  }

  async deleteTask(id: string): Promise<{ deletedId: string }> {
    logger.info('SERVICE', `TaskService.deleteTask removing task: ${id}`);
    const existing = await taskRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound('Task', id);
    }
    await taskRepository.delete(id);
    return { deletedId: id };
  }
}

export const taskService = new TaskService();
